// controllers/AuthController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

const JWT_SECRET = process.env.JWT_SECRET || "chave_padrao";

module.exports = {
  register: async (req, res) => {
    try {
      const { nome, email, senha, telefone, tipo } = req.body;

      // Verifica se já existe um usuário com esse email
      const usuarioExistente = await Usuario.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(400).json({ error: "Email já está em uso." });
      }

      // Gera o hash da senha
      const salt = await bcrypt.genSalt(10);
      const senha_hash = await bcrypt.hash(senha, salt);

      // Cria o usuário
      const novoUsuario = await Usuario.create({
        nome,
        email,
        senha_hash,
        telefone,
        tipo: tipo || "cliente",
      });

      // Não retorne a senha diretamente
      return res.status(201).json({
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        telefone: novoUsuario.telefone,
        tipo: novoUsuario.tipo,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao registrar usuário" });
    }
  },

  login: async (req, res) => {
    try {
      const { email, senha } = req.body;

      // Verifica se o usuário existe
      const usuario = await Usuario.findOne({ where: { email } });
      if (!usuario) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      // Compara a senha
      const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
      if (!senhaCorreta) {
        return res.status(401).json({ error: "Senha inválida" });
      }

      // Gera o token JWT
      const token = jwt.sign(
        {
          id: usuario.id,
          email: usuario.email,
          tipo: usuario.tipo,
        },
        JWT_SECRET,
        { expiresIn: "1d" } // Token válido por 1 dia
      );

      return res.json({ message: "Login bem-sucedido", token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao fazer login" });
    }
  },
};
