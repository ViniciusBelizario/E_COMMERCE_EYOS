const ProdutoCor = require("../models/ProdutoCor");
const Produto = require("../models/Produto");
const Cor = require("../models/Cor");

const listarProdutoCores = async (req, res) => {
  try {
    const produtoCores = await ProdutoCor.findAll({
      include: [
        { model: Produto, attributes: ["id", "nome"] }, // Inclui nome do produto
        { model: Cor, attributes: ["id", "nome", "codigo_hex"] }, // Inclui nome e código da cor
      ],
    });
    return res.json(produtoCores);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao listar Produto-Cor", detalhes: error.message });
  }
};

const criarProdutoCor = async (req, res) => {
  try {
    const usuario = req.user;
    if (usuario.tipo !== "administrador") {
      return res.status(403).json({ error: "Apenas administradores podem criar Produto-Cor." });
    }

    const { produto_id, cor_id, quantidade } = req.body;

    // 🔹 Validação da entrada
    if (!produto_id || !cor_id || quantidade === undefined || isNaN(quantidade)) {
      return res.status(400).json({ error: "Campos 'produto_id', 'cor_id' e 'quantidade' são obrigatórios e válidos." });
    }

    // 🔹 Verifica se o produto e a cor existem
    const produto = await Produto.findByPk(produto_id);
    const cor = await Cor.findByPk(cor_id);

    if (!produto) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }
    if (!cor) {
      return res.status(404).json({ error: "Cor não encontrada." });
    }

    // 🔹 Criar associação entre Produto e Cor com a quantidade especificada
    const novaProdutoCor = await ProdutoCor.create({ produto_id, cor_id, quantidade });

    return res.status(201).json(novaProdutoCor);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao criar Produto-Cor", detalhes: error.message });
  }
};

const deletarProdutoCor = async (req, res) => {
  try {
    const usuario = req.user;
    if (usuario.tipo !== "administrador") {
      return res.status(403).json({ error: "Apenas administradores podem remover Produto-Cor." });
    }

    const { id } = req.params;
    const produtoCor = await ProdutoCor.findByPk(id);

    if (!produtoCor) {
      return res.status(404).json({ error: "Produto-Cor não encontrado." });
    }

    await produtoCor.destroy();
    return res.json({ message: "Produto-Cor removido com sucesso" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao remover Produto-Cor", detalhes: error.message });
  }
};

module.exports = {
  listarProdutoCores,
  criarProdutoCor,
  deletarProdutoCor,
};
