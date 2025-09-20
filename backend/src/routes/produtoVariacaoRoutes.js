const express = require("express");
const ProdutoVariacaoController = require("../controllers/ProdutoVariacaoController"); 
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// 🔹 Rotas para ProdutoVariacao (cor + tamanho)
router.get("/", ProdutoVariacaoController.listarProdutoVariacoes);
router.post("/", authMiddleware, ProdutoVariacaoController.criarProdutoVariacao);
router.delete("/:id", authMiddleware, ProdutoVariacaoController.deletarProdutoVariacao);

module.exports = router;
