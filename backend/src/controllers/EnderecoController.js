// src/controllers/EnderecoController.js
const Endereco = require("../models/Endereco");

exports.listarEnderecos = async (req, res) => {
  try {
    const usuario_id = req.user.id; // Obtém o ID do usuário autenticado pelo JWT
    const enderecos = await Endereco.findAll({ where: { usuario_id } });
    
    return res.json(enderecos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao listar endereços" });
  }
};

exports.criarEndereco = async (req, res) => {
  try {
    const { rua, cidade, estado, cep, pais } = req.body;
    const usuario_id = req.user.id; // Obtém o ID do usuário autenticado pelo JWT

    const endereco = await Endereco.create({ rua, cidade, estado, cep, pais, usuario_id });
    return res.status(201).json(endereco);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao criar endereço" });
  }
};

exports.buscarEndereco = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.user.id; 

    const endereco = await Endereco.findOne({ where: { id, usuario_id } });
    if (!endereco) {
      return res.status(404).json({ error: "Endereço não encontrado ou não pertence a você" });
    }

    return res.json(endereco);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar endereço" });
  }
};

exports.atualizarEndereco = async (req, res) => {
  try {
    const { id } = req.params;
    const { rua, cidade, estado, cep, pais } = req.body;
    const usuario_id = req.user.id; 

    const endereco = await Endereco.findOne({ where: { id, usuario_id } });
    if (!endereco) {
      return res.status(404).json({ error: "Endereço não encontrado ou não pertence a você" });
    }

    await endereco.update({ rua, cidade, estado, cep, pais });
    return res.json({ message: "Endereço atualizado", endereco });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao atualizar endereço" });
  }
};

exports.deletarEndereco = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.user.id; 

    const endereco = await Endereco.findOne({ where: { id, usuario_id } });
    if (!endereco) {
      return res.status(404).json({ error: "Endereço não encontrado ou não pertence a você" });
    }

    await endereco.destroy();
    return res.json({ message: "Endereço deletado com sucesso" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao deletar endereço" });
  }
};
