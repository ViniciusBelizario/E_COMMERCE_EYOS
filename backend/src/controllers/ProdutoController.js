// src/controllers/ProdutoController.js
const sequelize = require("../config/database");
const { Op, fn, col, where, literal } = require("sequelize");
const Produto = require("../models/Produto");
const ProdutoVariacao = require("../models/ProdutoVariacao");
const Cor = require("../models/Cor");
const Tamanho = require("../models/Tamanho");
const Marca = require("../models/Marca");
const Categoria = require("../models/Categoria");

// Lista produtos (com variações)
const listar = async (req, res) => {
  try {
    const produtos = await Produto.findAll({
      include: [
        {
          model: ProdutoVariacao,
          include: [Cor, Tamanho],
        },
      ],
      order: [["id", "DESC"]],
    });
    return res.json(produtos);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro ao listar produtos" });
  }
};

// Busca por id
const buscar = async (req, res) => {
  try {
    const { id } = req.params;
    const produto = await Produto.findByPk(id, {
      include: [{ model: ProdutoVariacao, include: [Cor, Tamanho] }],
    });
    if (!produto) return res.status(404).json({ error: "Produto não encontrado" });
    return res.json(produto);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro ao buscar produto" });
  }
};

/**
 * Criar OU mesclar produto/variação
 * - Match de produto por (nome, marca_id, categoria_id)
 * - Para cada variação (cor_id, tamanho_id, quantidade):
 *    - se existir: soma quantidade e, se não tiver imagem, herda a imagem do produto enviada agora
 *    - se não existir: cria e define imagem da variação = imagem do produto (se enviada)
 * - Recalcula `estoque` = soma das quantidades das variações
 * - Aceita upload via uploadMiddleware (fields: imagem, video)
 */
const criarOuMesclar = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    let {
      nome,
      descricao = null,
      preco,
      marca_id,
      categoria_id,
      variacoes = [],
    } = req.body;

    // Quando vem por multipart/form-data, variacoes geralmente é string
    if (typeof variacoes === "string") {
      try {
        variacoes = JSON.parse(variacoes);
      } catch {
        await t.rollback();
        return res.status(400).json({ error: "Campo 'variacoes' deve ser um JSON válido." });
      }
    }
    if (!Array.isArray(variacoes)) variacoes = [];

    // uploads recebidos do produto
    const imagemFile = req.files?.imagem?.[0];
    const videoFile  = req.files?.video?.[0];
    const imagem_url_produto = imagemFile ? `/uploads/images/${imagemFile.filename}` : null;
    const video_url  = videoFile ? `/uploads/videos/${videoFile.filename}` : null;

    // validações
    if (!nome || !preco || !marca_id || !categoria_id) {
      await t.rollback();
      return res.status(400).json({
        error: "Campos obrigatórios: nome, preco, marca_id, categoria_id",
      });
    }

    // Busca (ou cria) o produto por nome exato + marca + categoria
    let produto = await Produto.findOne({
      where: { nome, marca_id, categoria_id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!produto) {
      produto = await Produto.create(
        {
          nome,
          descricao,
          preco,
          estoque: 0, // será recalculado
          imagem_url: imagem_url_produto,
          video_url,
          marca_id,
          categoria_id,
        },
        { transaction: t }
      );
    } else {
      // Atualiza campos opcionais se vieram
      const patch = {};
      if (descricao !== null && descricao !== undefined) patch.descricao = descricao;
      if (preco !== undefined) patch.preco = preco;
      if (imagem_url_produto) patch.imagem_url = imagem_url_produto; // atualiza imagem do produto
      if (video_url) patch.video_url = video_url;
      if (Object.keys(patch).length) {
        await produto.update(patch, { transaction: t });
      }
    }

    // HERANÇA: se o produto tiver imagem nova, variações novas herdam;
    // variações existentes SEM imagem passam a herdar também
    for (const v of variacoes) {
      const { cor_id, tamanho_id, quantidade = 0 } = v || {};
      if (!cor_id || !tamanho_id) {
        await t.rollback();
        return res
          .status(400)
          .json({ error: "Cada variação precisa de 'cor_id' e 'tamanho_id'." });
      }
      if (!Number.isInteger(quantidade) || quantidade < 0) {
        await t.rollback();
        return res
          .status(400)
          .json({ error: "Quantidade da variação deve ser um inteiro >= 0." });
      }

      const existente = await ProdutoVariacao.findOne({
        where: { produto_id: produto.id, cor_id, tamanho_id },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (existente) {
        // soma a quantidade (se > 0)
        if (quantidade > 0) {
          await existente.update(
            { quantidade: literal(`quantidade + ${quantidade}`) },
            { transaction: t }
          );
        }
        // se a variação ainda NÃO tem imagem e o produto tem, herda agora
        if (!existente.imagem_url && imagem_url_produto) {
          await existente.update({ imagem_url: imagem_url_produto }, { transaction: t });
        }
      } else {
        // cria nova variação (já herdando a imagem do produto, se existir)
        await ProdutoVariacao.create(
          {
            produto_id: produto.id,
            cor_id,
            tamanho_id,
            quantidade,
            imagem_url: imagem_url_produto || null,
          },
          { transaction: t }
        );
      }
    }

    // Recalcula estoque do produto = soma das variações
    const totalEstoque = await ProdutoVariacao.sum("quantidade", {
      where: { produto_id: produto.id },
      transaction: t,
    });
    await produto.update({ estoque: totalEstoque || 0 }, { transaction: t });

    await t.commit();

    // Retorna produto com associações
    const resposta = await Produto.findByPk(produto.id, {
      include: [{ model: ProdutoVariacao, include: [Cor, Tamanho] }],
    });
    return res.status(201).json(resposta);
  } catch (e) {
    await t.rollback();
    console.error(e);
    if (e.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        error:
          "Variação duplicada para este produto (produto_id, cor_id, tamanho_id). Tente novamente.",
      });
    }
    return res.status(500).json({ error: "Erro ao criar/mesclar produto" });
  }
};

// Atualizar produto (campos básicos)
const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const produto = await Produto.findByPk(id);
    if (!produto) return res.status(404).json({ error: "Produto não encontrado" });

    const patch = { ...req.body };

    // uploads
    const imagemFile = req.files?.imagem?.[0];
    const videoFile = req.files?.video?.[0];
    if (imagemFile) patch.imagem_url = `/uploads/images/${imagemFile.filename}`;
    if (videoFile) patch.video_url = `/uploads/videos/${videoFile.filename}`;

    await produto.update(patch);
    return res.json(produto);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro ao atualizar produto" });
  }
};

// Remover produto
const remover = async (req, res) => {
  try {
    const { id } = req.params;
    const produto = await Produto.findByPk(id);
    if (!produto) return res.status(404).json({ error: "Produto não encontrado" });

    await produto.destroy();
    return res.json({ message: "Produto removido" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro ao remover produto" });
  }
};

const { Op, fn, col, where, literal } = require("sequelize");
// ... seus requires existentes

/**
 * GET /produtos/busca?q=<texto>&marca=<textoOpcional>&page=1&limit=20
 * - Busca por nome do produto contendo `q` (parcial, case-insensitive)
 * - Se `marca` vier, filtra também pelo nome da marca (parcial)
 * - Retorna paginação + includes (variações com Cor/Tamanho)
 */
const buscarTexto = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    const marcaNome = (req.query.marca || "").trim();
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
    const offset = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({ error: "Parâmetro 'q' é obrigatório." });
    }

    // where: nome do produto contém q (case-insensitive)
    const whereProduto = where(fn("LOWER", col("Produto.nome")), {
      [Op.like]: `%${q.toLowerCase()}%`,
    });

    // include da marca (se filtrar por nome de marca)
    const include = [
      {
        model: ProdutoVariacao,
        include: [Cor, Tamanho],
      },
      {
        model: Marca,
        // se marcaNome vier, forçamos filtro na própria include
        ...(marcaNome
          ? {
              required: true,
              where: where(fn("LOWER", col("Marca.nome")), {
                [Op.like]: `%${marcaNome.toLowerCase()}%`,
              }),
            }
          : {}),
      },
      {
        model: Categoria,
      },
    ];

    const { rows, count } = await Produto.findAndCountAll({
      where: whereProduto,
      include,
      order: [["id", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      meta: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
      },
      data: rows,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro ao buscar produtos" });
  }
};

module.exports = {
  listar,
  buscar,
  criarOuMesclar,
  atualizar,
  remover,
  buscarTexto,
};
