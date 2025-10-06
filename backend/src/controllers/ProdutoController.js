// src/controllers/ProdutoController.js
const sequelize = require("../config/database");
const { Op, fn, col, literal } = require("sequelize");
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
 * Regra:
 * - Procura produto por (nome, marca_id, categoria_id). Se existir, reaproveita.
 * - Para cada variação recebida (cor_id, tamanho_id, quantidade):
 *      - se já existir, soma quantidade
 *      - se não existir, cria
 * - Recalcula `estoque` do Produto como soma das quantidades das variações
 * Aceita upload de imagem/vídeo via uploadMiddleware (fields: imagem, video)
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
      // pode vir string (multipart) ou array JSON
      variacoes = [],
    } = req.body;

    // Quando vem por multipart/form-data, variacoes geralmente é string
    if (typeof variacoes === "string") {
      try {
        variacoes = JSON.parse(variacoes);
      } catch {
        return res.status(400).json({ error: "Campo 'variacoes' deve ser um JSON válido." });
      }
    }
    if (!Array.isArray(variacoes)) variacoes = [];

    // uploads
    const imagemFile = req.files?.imagem?.[0];
    const videoFile = req.files?.video?.[0];
    const imagem_url = imagemFile ? `/uploads/images/${imagemFile.filename}` : null;
    const video_url = videoFile ? `/uploads/videos/${videoFile.filename}` : null;

    // validações básicas
    if (!nome || !preco || !marca_id || !categoria_id) {
      return res.status(400).json({
        error: "Campos obrigatórios: nome, preco, marca_id, categoria_id",
      });
    }

    // Busca (ou cria) o produto por nome exato + marca + categoria
    // (remova qualquer sufixo que você tenha colocado nos testes para permitir o match)
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
          estoque: 0, // recalculamos já já
          imagem_url,
          video_url,
          marca_id,
          categoria_id,
        },
        { transaction: t }
      );
    } else {
      // Se já existe, podemos atualizar campos opcionais se foram enviados
      const patch = {};
      if (descricao !== null && descricao !== undefined) patch.descricao = descricao;
      if (preco !== undefined) patch.preco = preco;
      if (imagem_url) patch.imagem_url = imagem_url;
      if (video_url) patch.video_url = video_url;
      if (Object.keys(patch).length) {
        await produto.update(patch, { transaction: t });
      }
    }

    // Para cada variação: soma ou cria
    for (const v of variacoes) {
      const { cor_id, tamanho_id, quantidade = 0, imagem_url: imgVar = null } = v || {};
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
        // soma a quantidade
        if (quantidade > 0) {
          await existente.update(
            {
              quantidade: literal(`quantidade + ${quantidade}`),
              // opcionalmente, atualiza a imagem da variação se enviada
              ...(imgVar ? { imagem_url: imgVar } : {}),
            },
            { transaction: t }
          );
        }
      } else {
        // cria nova variação
        await ProdutoVariacao.create(
          {
            produto_id: produto.id,
            cor_id,
            tamanho_id,
            quantidade,
            imagem_url: imgVar || null,
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

    // Retorna produto atualizado com associações
    const resposta = await Produto.findByPk(produto.id, {
      include: [{ model: ProdutoVariacao, include: [Cor, Tamanho] }],
    });
    return res.status(201).json(resposta);
  } catch (e) {
    await t.rollback();
    console.error(e);
    // Trate violação da unique (produto_id,cor_id,tamanho_id) com merge seguro
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

module.exports = {
  listar,
  buscar,
  criarOuMesclar,
  atualizar,
  remover,
};
