//src\controllers\TamanhoController.js
const Tamanho = require("../models/Tamanho");

// Listar todos os tamanhos
const listarTamanhos = async (req, res) => {
  try {
    const tamanhos = await Tamanho.findAll();
    return res.json(tamanhos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao listar tamanhos", detalhes: error.message });
  }
};

// Criar um novo tamanho
const criarTamanho = async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome) {
      return res.status(400).json({ error: "O campo 'nome' é obrigatório." });
    }
    const novoTamanho = await Tamanho.create({ nome });
    return res.status(201).json(novoTamanho);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao criar tamanho", detalhes: error.message });
  }
};

// Deletar um tamanho
const deletarTamanho = async (req, res) => {
  try {
    const { id } = req.params;
    const tamanho = await Tamanho.findByPk(id);
    if (!tamanho) {
      return res.status(404).json({ error: "Tamanho não encontrado." });
    }
    await tamanho.destroy();
    return res.json({ message: "Tamanho removido com sucesso." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao remover tamanho", detalhes: error.message });
  }
};

module.exports = {
  listarTamanhos,
  criarTamanho,
  deletarTamanho
};
