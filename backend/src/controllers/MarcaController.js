const { Op, fn, col, where } = require("sequelize");
const Marca = require("../models/Marca");
const Produto = require("../models/Produto");
const ProdutoVariacao = require("../models/ProdutoVariacao");
const Cor = require("../models/Cor");
const Tamanho = require("../models/Tamanho");
const Categoria = require("../models/Categoria");

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
    if (error?.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "Já existe uma marca com esse nome." });
    }
    return res.status(500).json({ error: "Erro ao criar marca" });
  }
};

// === NOVO: busca textual por nome de marca (parcial) ===
// GET /marcas/busca?nome=adid&comProdutos=1&page=1&limit=20
exports.buscarPorNome = async (req, res) => {
  try {
    const nome = (req.query.nome || "").trim();
    const comProdutos = req.query.comProdutos === "1";
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
    const offset = (page - 1) * limit;

    if (!nome) {
      return res.status(400).json({ error: "Parâmetro 'nome' é obrigatório." });
    }

    const include = [];
    if (comProdutos) {
      include.push({
        model: Produto,
        include: [
          { model: ProdutoVariacao, include: [Cor, Tamanho] },
          { model: Categoria },
        ],
      });
    }

    const { rows, count } = await Marca.findAndCountAll({
      where: where(fn("LOWER", col("Marca.nome")), {
        [Op.like]: `%${nome.toLowerCase()}%`,
      }),
      include,
      order: [["id", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      meta: { page, limit, total: count, pages: Math.ceil(count / limit) },
      data: rows,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro ao buscar marcas" });
  }
};
