// src/controllers/MarcaController.js
const Marca = require("../models/Marca");

exports.listarMarcas = async (req, res) => {
  try {
    const marcas = await Marca.findAll();
    return res.json(marcas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao listar marcas" });
  }
};

exports.criarMarca = async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    const usuario = req.user; // Usuário autenticado via JWT

    // 🔹 Verifica se o usuário é administrador
    if (usuario.tipo !== "administrador") {
      return res.status(403).json({ error: "Apenas administradores podem criar marcas." });
    }

    const novaMarca = await Marca.create({ nome, descricao });
    return res.status(201).json(novaMarca);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao criar marca" });
  }
};
