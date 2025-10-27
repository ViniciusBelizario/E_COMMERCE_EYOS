//src\controllers\AuthController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// helper simples para limpar CPF
const onlyDigits = (v) => String(v || "").replace(/\D/g, "");

// POST /auth/register
exports.register = async (req, res) => {
  try {
    const { nome, email, senha, telefone, cpf } = req.body || {};

    // validação básica
    if (!nome || !email || !senha || !cpf) {
      return res.status(400).json({
        error: "Campos obrigatórios: nome, email, senha e cpf.",
      });
    }

    const cpfLimpo = onlyDigits(cpf);
    if (cpfLimpo.length !== 11) {
      return res.status(400).json({ error: "CPF inválido. Use apenas números." });
    }

    // verifica se já existe e-mail
    const existeEmail = await Usuario.findOne({
      where: { email: String(email).toLowerCase() },
    });
    if (existeEmail) {
      return res.status(409).json({ error: "E-mail já cadastrado." });
    }

    // verifica se já existe CPF
    const existeCPF = await Usuario.findOne({
      where: { cpf: cpfLimpo },
    });
    if (existeCPF) {
      return res.status(409).json({ error: "CPF já cadastrado." });
    }

    const senha_hash = await bcrypt.hash(senha, 10);

    const novo = await Usuario.create({
      nome: String(nome).trim(),
      email: String(email).trim().toLowerCase(),
      senha_hash,
      telefone: telefone || null,
      cpf: cpfLimpo,
      tipo: "cliente", // registro público -> cliente
    });

    // inclui email no payload para o middleware ter req.user.email
    const token = jwt.sign(
      { id: novo.id, email: novo.email, tipo: novo.tipo },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      id: novo.id,
      nome: novo.nome,
      email: novo.email,
      cpf: novo.cpf,
      tipo: novo.tipo,
      token,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro ao registrar usuário." });
  }
};

// POST /auth/login
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body || {};
    if (!email || !senha) {
      return res.status(400).json({ error: "Campos obrigatórios: email e senha." });
    }

    const user = await Usuario.findOne({
      where: { email: String(email).toLowerCase() },
    });
    if (!user) return res.status(401).json({ error: "Credenciais inválidas." });

    const ok = await bcrypt.compare(senha, user.senha_hash);
    if (!ok) return res.status(401).json({ error: "Credenciais inválidas." });

    const token = jwt.sign(
      { id: user.id, email: user.email, tipo: user.tipo },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      cpf: user.cpf,
      tipo: user.tipo,
      token,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro ao autenticar." });
  }
};
exports.me = (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Não autenticado." });
  return res.json(req.user);
};
