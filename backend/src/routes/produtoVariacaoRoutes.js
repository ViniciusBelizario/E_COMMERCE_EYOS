// src/routes/produtoVariacaoRoutes.js
const express = require("express");
const ProdutoVariacaoController = require("../controllers/ProdutoVariacaoController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminOnly = require("../middlewares/adminOnly");
const upload = require("../middlewares/uploadMiddleware"); // ⬅️ usar o mesmo middleware

const router = express.Router();

// Público
router.get("/", ProdutoVariacaoController.listarProdutoVariacoes);

// Admin
router.post(
  "/",
  authMiddleware,
  adminOnly,
  upload, // ⬅️ permite enviar campo "imagem" (arquivo)
  ProdutoVariacaoController.criarOuSomarProdutoVariacao // ⬅️ novo handler
);
router.delete("/:id", authMiddleware, adminOnly, ProdutoVariacaoController.deletarProdutoVariacao);

module.exports = router;
