// src/controllers/CorController.js
const Cor = require("../models/Cor");

exports.listarCores = async (req, res) => {
  try {
    const cores = await Cor.findAll();
    return res.json(cores);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao listar cores" });
  }
};

exports.criarCor = async (req, res) => {
  try {
    const { nome, codigo_hex } = req.body;
    const usuario = req.user; // Obtém usuário autenticado via JWT

    // 🔹 Verifica se o usuário é administrador
    if (usuario.tipo !== "administrador") {
      return res.status(403).json({ error: "Apenas administradores podem criar cores." });
    }

    const novaCor = await Cor.create({ nome, codigo_hex });
    return res.status(201).json(novaCor);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao criar cor" });
  }
};
