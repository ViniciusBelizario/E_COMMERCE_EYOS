const express = require("express");
const ProdutoVariacaoController = require("../controllers/ProdutoVariacaoController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminOnly = require("../middlewares/adminOnly");

const router = express.Router();

// Público (listar para o front montar opções de variação)
router.get("/", ProdutoVariacaoController.listarProdutoVariacoes);

// Admin
router.post("/", authMiddleware, adminOnly, ProdutoVariacaoController.criarProdutoVariacao);
router.delete("/:id", authMiddleware, adminOnly, ProdutoVariacaoController.deletarProdutoVariacao);

module.exports = router;
