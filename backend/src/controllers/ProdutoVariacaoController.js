// src/controllers/ProdutoVariacaoController.js
const sequelize = require("../config/database");
const { literal } = require("sequelize");
const ProdutoVariacao = require("../models/ProdutoVariacao");
const Produto = require("../models/Produto");
const Cor = require("../models/Cor");
const Tamanho = require("../models/Tamanho");

// GET mantém igual, já enriquecendo com preco e imagem efetiva
const listarProdutoVariacoes = async (req, res) => {
  try {
    const variacoes = await ProdutoVariacao.findAll({
      include: [
        { model: Produto, attributes: ["id", "nome", "preco", "imagem_url"] },
        { model: Cor, attributes: ["id", "nome", "codigo_hex"] },
        { model: Tamanho, attributes: ["id", "nome"] },
      ],
      order: [["id", "ASC"]],
    });

    const resposta = variacoes.map(v => {
      const obj = v.get({ plain: true });
      return {
        ...obj,
        preco: obj.Produto?.preco ?? null,
        imagem_url_efetiva: obj.imagem_url || obj.Produto?.imagem_url || null,
      };
    });

    return res.json(resposta);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao listar Produto-Variacao", detalhes: error.message });
  }
};

// POST /produto-variacoes -> se existir a combinação, soma; senão, cria
const criarOuSomarProdutoVariacao = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const usuario = req.user;
    if (!usuario || usuario.tipo !== "administrador") {
      await t.rollback();
      return res.status(403).json({ error: "Apenas administradores podem criar Produto-Variacao." });
    }

    // campos (podem vir como string)
    let { produto_id, cor_id, tamanho_id, quantidade } = req.body;

    // normaliza tipos
    produto_id = Number(produto_id);
    cor_id = Number(cor_id);
    tamanho_id = Number(tamanho_id);
    quantidade = Number(quantidade);

    if (!produto_id || !cor_id || !tamanho_id || !Number.isFinite(quantidade) || quantidade <= 0) {
      await t.rollback();
      return res.status(400).json({
        error: "Campos 'produto_id', 'cor_id', 'tamanho_id' e 'quantidade>0' são obrigatórios e válidos.",
      });
    }

    // imagem opcional da variação (enviada como 'imagem' no form-data)
    const imagemFile = req.files?.imagem?.[0];
    const imagem_url = imagemFile ? `/uploads/images/${imagemFile.filename}` : null;

    // checa existência do produto pai
    const produto = await Produto.findByPk(produto_id, {
      attributes: ["id", "preco", "imagem_url"],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!produto) {
      await t.rollback();
      return res.status(404).json({ error: "Produto pai não encontrado." });
    }

    // tenta achar a variação existente
    const existente = await ProdutoVariacao.findOne({
      where: { produto_id, cor_id, tamanho_id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    let variacao;
    if (existente) {
      // soma quantidade
      await existente.update(
        {
          quantidade: literal(`quantidade + ${quantidade}`),
          // se veio imagem nova, atualiza
          ...(imagem_url ? { imagem_url } : {}),
        },
        { transaction: t }
      );
      variacao = existente;
    } else {
      // cria nova
      variacao = await ProdutoVariacao.create(
        {
          produto_id,
          cor_id,
          tamanho_id,
          quantidade,
          imagem_url, // pode ser null (herda imagem do pai no GET)
        },
        { transaction: t }
      );
    }

    // recalcula o estoque do produto pai = soma das variações
    const total = await ProdutoVariacao.sum("quantidade", {
      where: { produto_id },
      transaction: t,
    });
    await produto.update({ estoque: total || 0 }, { transaction: t });

    await t.commit();

    // recarrega variação com includes e enriquece resposta
    const completa = await ProdutoVariacao.findByPk(variacao.id, {
      include: [
        { model: Produto, attributes: ["id", "nome", "preco", "imagem_url"] },
        { model: Cor, attributes: ["id", "nome", "codigo_hex"] },
        { model: Tamanho, attributes: ["id", "nome"] },
      ],
    });

    const obj = completa.get({ plain: true });
    return res.status(existente ? 200 : 201).json({
      ...obj,
      preco: obj.Produto?.preco ?? null,
      imagem_url_efetiva: obj.imagem_url || obj.Produto?.imagem_url || null,
    });
  } catch (error) {
    await t.rollback();
    console.error(error);
    // se ainda assim acontecer corrida de unique, trate aqui
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "Variação já existe. Tente novamente." });
    }
    return res.status(500).json({ error: "Erro ao criar Produto-Variacao", detalhes: error.message });
  }
};

const deletarProdutoVariacao = async (req, res) => {
  try {
    const usuario = req.user;
    if (usuario.tipo !== "administrador") {
      return res.status(403).json({ error: "Apenas administradores podem remover Produto-Variacao." });
    }

    const { id } = req.params;
    const produtoVariacao = await ProdutoVariacao.findByPk(id);

    if (!produtoVariacao) {
      return res.status(404).json({ error: "Produto-Variacao não encontrado." });
    }

    await produtoVariacao.destroy();
    return res.json({ message: "Produto-Variacao removido com sucesso" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao remover Produto-Variacao", detalhes: error.message });
  }
};

module.exports = {
  listarProdutoVariacoes,
  criarOuSomarProdutoVariacao,
  deletarProdutoVariacao,
};
