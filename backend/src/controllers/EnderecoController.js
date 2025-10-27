// src/controllers/EnderecoController.js
const Endereco = require("../models/Endereco");

function trimStr(s) {
  return s == null ? s : String(s).trim();
}

exports.listarMeusEnderecos = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Não autenticado." });

    const enderecos = await Endereco.findAll({
      where: { usuario_id: userId },
      order: [["id", "DESC"]],
    });
    return res.json(enderecos);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro ao listar endereços." });
  }
};

exports.buscarMeuEndereco = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const endereco = await Endereco.findOne({
      where: { id, usuario_id: userId },
    });

    if (!endereco) return res.status(404).json({ error: "Endereço não encontrado." });
    return res.json(endereco);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro ao buscar endereço." });
  }
};

exports.criarEndereco = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Não autenticado." });

    let {
      rua,
      bairro,
      cidade,
      estado,
      cep,
      numero,
      complemento,
      pais,
    } = req.body || {};

    rua = trimStr(rua);
    cidade = trimStr(cidade);
    estado = trimStr(estado);
    cep = trimStr(cep);
    pais = trimStr(pais) || "Brasil"; // default
    bairro = trimStr(bairro);
    numero = trimStr(numero);
    complemento = trimStr(complemento);

    if (!rua || !cidade || !estado || !cep || !pais) {
      return res.status(400).json({
        error: "Campos obrigatórios: rua, cidade, estado, cep, pais.",
      });
    }

    const criado = await Endereco.create({
      rua,
      bairro,
      cidade,
      estado,
      cep,
      numero,
      complemento,
      pais,
      usuario_id: userId,
    });

    return res.status(201).json(criado);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro ao criar endereço." });
  }
};

exports.atualizarEndereco = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const endereco = await Endereco.findOne({
      where: { id, usuario_id: userId },
    });
    if (!endereco) return res.status(404).json({ error: "Endereço não encontrado." });

    const patch = {};
    const campos = [
      "rua",
      "bairro",
      "cidade",
      "estado",
      "cep",
      "numero",
      "complemento",
      "pais",
    ];
    campos.forEach((c) => {
      if (req.body[c] !== undefined) patch[c] = trimStr(req.body[c]);
    });

    await endereco.update(patch);
    return res.json(endereco);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro ao atualizar endereço." });
  }
};

exports.removerEndereco = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const endereco = await Endereco.findOne({
      where: { id, usuario_id: userId },
    });
    if (!endereco) return res.status(404).json({ error: "Endereço não encontrado." });

    await endereco.destroy();
    return res.json({ message: "Endereço removido com sucesso." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro ao remover endereço." });
  }
};
