// src/controllers/CategoriaController.js
const Categoria = require("../models/Categoria");

async function listarCategorias(req, res) {
  try {
    const categorias = await Categoria.findAll();
    return res.json(categorias);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao listar categorias", detalhes: error.message });
  }
}

async function criarCategoria(req, res) {
  try {
    const { nome, descricao } = req.body;
    if (!nome) return res.status(400).json({ error: "O campo 'nome' é obrigatório." });

    const categoria = await Categoria.create({ nome, descricao });
    return res.status(201).json(categoria);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao criar categoria", detalhes: error.message });
  }
}

async function buscarCategoria(req, res) {
  try {
    const categoria = await Categoria.findByPk(req.params.id);
    if (!categoria) return res.status(404).json({ error: "Categoria não encontrada" });
    return res.json(categoria);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar categoria", detalhes: error.message });
  }
}

async function atualizarCategoria(req, res) {
  try {
    const { nome, descricao } = req.body;
    if (!nome) return res.status(400).json({ error: "O campo 'nome' é obrigatório." });

    const [linhasAfetadas] = await Categoria.update({ nome, descricao }, { where: { id: req.params.id } });
    if (linhasAfetadas === 0) return res.status(404).json({ error: "Categoria não encontrada" });

    return res.json({ message: "Categoria atualizada com sucesso" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao atualizar categoria", detalhes: error.message });
  }
}

async function deletarCategoria(req, res) {
  try {
    const linhasAfetadas = await Categoria.destroy({ where: { id: req.params.id } });
    if (linhasAfetadas === 0) return res.status(404).json({ error: "Categoria não encontrada" });
    return res.json({ message: "Categoria removida com sucesso" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao remover categoria", detalhes: error.message });
  }
}

module.exports = {
  listarCategorias,
  criarCategoria,
  buscarCategoria,
  atualizarCategoria,
  deletarCategoria,
};
