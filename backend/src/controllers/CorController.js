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
    const usuario = req.user; // via JWT
    if (!usuario || usuario.tipo !== "administrador") {
      return res.status(403).json({ error: "Apenas administradores podem criar cores." });
    }

    const { nome, codigo_hex } = req.body || {};
    if (!nome || !String(nome).trim()) {
      return res.status(400).json({ error: "O campo 'nome' é obrigatório." });
    }

    const novaCor = await Cor.create({
      nome: String(nome).trim(),
      codigo_hex: codigo_hex || null
    });

    return res.status(201).json(novaCor);
  } catch (error) {
    console.error(error);
    if (error?.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "Cor já existente (nome ou código_hex duplicado)." });
    }
    return res.status(500).json({ error: "Erro ao criar cor" });
  }
};
