// controllers/UsuarioController.js
const Usuario = require("../models/Usuario");

exports.listarUsuarios = async (req, res) => {
  try {
    // Evitar retornar senha_hash
    const usuarios = await Usuario.findAll({
      attributes: ["id", "nome", "email", "telefone", "tipo"],
    });
    return res.json(usuarios);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao listar usuários" });
  }
};

exports.criarUsuario = async (req, res) => {
  try {
    // Exemplo: Criar um usuário sem hash, para uso em CRUD simples
    // Em ambiente real, use bcrypt para hashear a senha!
    const { nome, email, senha_hash, telefone, tipo } = req.body;

    // Verifica se o email já está sendo usado
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ error: "Email já cadastrado." });
    }

    const novoUsuario = await Usuario.create({
      nome,
      email,
      senha_hash,
      telefone,
      tipo: tipo || "cliente",
    });

    // Não retornar a senha em texto puro
    return res.status(201).json({
      id: novoUsuario.id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      telefone: novoUsuario.telefone,
      tipo: novoUsuario.tipo,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao criar usuário" });
  }
};

exports.buscarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Evitar retornar senha_hash
    const usuario = await Usuario.findByPk(id, {
      attributes: ["id", "nome", "email", "telefone", "tipo"],
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    return res.json(usuario);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar usuário" });
  }
};

exports.atualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone, tipo } = req.body;

    // Atualiza somente campos necessários (sem mexer em senha aqui)
    const [linhasAfetadas] = await Usuario.update(
      { nome, email, telefone, tipo },
      { where: { id } }
    );

    if (linhasAfetadas === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Retorna o novo estado do usuário
    const usuarioAtualizado = await Usuario.findByPk(id, {
      attributes: ["id", "nome", "email", "telefone", "tipo"],
    });
    return res.json(usuarioAtualizado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
};

exports.deletarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const linhasAfetadas = await Usuario.destroy({ where: { id } });
    if (linhasAfetadas === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    return res.json({ message: "Usuário removido com sucesso" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao remover usuário" });
  }
};
