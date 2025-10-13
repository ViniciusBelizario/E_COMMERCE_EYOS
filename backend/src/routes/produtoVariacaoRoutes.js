// src/routes/produtoVariacaoRoutes.js
const express = require("express");
const ProdutoVariacaoController = require("../controllers/ProdutoVariacaoController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminOnly = require("../middlewares/adminOnly");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

// Público (listar para o front montar opções de variação)
router.get("/", ProdutoVariacaoController.listarProdutoVariacoes);

// Admin — upsert de variação; aceita 'imagem' específica da variação
router.post(
  "/",
  authMiddleware,
  adminOnly,
  upload, // usa campo 'imagem' se quiser imagem própria da variação
  ProdutoVariacaoController.criarProdutoVariacao
);

router.delete("/:id", authMiddleware, adminOnly, ProdutoVariacaoController.deletarProdutoVariacao);

module.exports = router;
