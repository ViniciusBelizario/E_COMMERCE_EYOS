// src/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

module.exports = async (req, res, next) => {
  try {
    const raw =
      req.headers.authorization ||
      req.cookies?.token ||
      req.session?.token;

    if (!raw) return res.status(401).json({ error: "Token não fornecido." });

    const token = String(raw).startsWith("Bearer ")
      ? String(raw).slice(7).trim()
      : String(raw).trim();

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await Usuario.findByPk(decoded.id);
    if (!user) return res.status(401).json({ error: "Usuário não encontrado." });

    req.user = {
      id: user.id,
      email: user.email,
      tipo: user.tipo,
      nome: user.nome,
      telefone: user.telefone,
      cpf: user.cpf,
    };

    return next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
};
