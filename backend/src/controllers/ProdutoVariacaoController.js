//src\controllers\ProdutoVariacaoController.js
const ProdutoVariacao = require("../models/ProdutoVariacao");
const Produto = require("../models/Produto");
const Cor = require("../models/Cor");
const Tamanho = require("../models/Tamanho");

const listarProdutoVariacoes = async (req, res) => {
  try {
    const produtoVariacoes = await ProdutoVariacao.findAll({
      include: [
        { model: Produto, attributes: ["id", "nome"] },
        { model: Cor, attributes: ["id", "nome", "codigo_hex"] },
        { model: Tamanho, attributes: ["id", "nome"] }
      ],
    });
    return res.json(produtoVariacoes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao listar Produto-Variacao", detalhes: error.message });
  }
};

const criarProdutoVariacao = async (req, res) => {
  try {
    const usuario = req.user;
    if (usuario.tipo !== "administrador") {
      return res.status(403).json({ error: "Apenas administradores podem criar Produto-Variacao." });
    }

    const { produto_id, cor_id, tamanho_id, quantidade, imagem_url } = req.body;

    if (!produto_id || !cor_id || !tamanho_id || quantidade === undefined || isNaN(quantidade)) {
      return res.status(400).json({ error: "Campos 'produto_id', 'cor_id', 'tamanho_id' e 'quantidade' são obrigatórios e válidos." });
    }

    const produto = await Produto.findByPk(produto_id);
    const cor = await Cor.findByPk(cor_id);
    const tamanho = await Tamanho.findByPk(tamanho_id);

    if (!produto) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }
    if (!cor) {
      return res.status(404).json({ error: "Cor não encontrada." });
    }
    if (!tamanho) {
      return res.status(404).json({ error: "Tamanho não encontrado." });
    }

    const novaProdutoVariacao = await ProdutoVariacao.create({
      produto_id,
      cor_id,
      tamanho_id,
      quantidade,
      imagem_url
    });

    return res.status(201).json(novaProdutoVariacao);
  } catch (error) {
    console.error(error);
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
  criarProdutoVariacao,
  deletarProdutoVariacao,
};
