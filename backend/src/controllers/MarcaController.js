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
    const usuario = req.user; // via JWT
    if (!usuario || usuario.tipo !== "administrador") {
      return res.status(403).json({ error: "Apenas administradores podem criar marcas." });
    }

    const { nome, descricao } = req.body || {};
    if (!nome || !String(nome).trim()) {
      return res.status(400).json({ error: "O campo 'nome' é obrigatório." });
    }

    const novaMarca = await Marca.create({ nome: String(nome).trim(), descricao });
    return res.status(201).json(novaMarca);
  } catch (error) {
    console.error(error);
    // conflito de unique
    if (error?.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "Já existe uma marca com esse nome." });
    }
    return res.status(500).json({ error: "Erro ao criar marca" });
  }
};
