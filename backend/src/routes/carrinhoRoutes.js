// src/routes/carrinhoRoutes.js
const express = require("express");
const CarrinhoController = require("../controllers/CarrinhoController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Todas as rotas do carrinho são do usuário autenticado
router.get("/", authMiddleware, CarrinhoController.obterCarrinho);
router.post("/item", authMiddleware, CarrinhoController.adicionarItem);
router.put("/item/:id", authMiddleware, CarrinhoController.atualizarItem);
router.delete("/item/:id", authMiddleware, CarrinhoController.removerItem);

// Finalização com transação, baixa de estoque e criação de pedido
router.post("/finalizar", authMiddleware, CarrinhoController.finalizarCarrinho);

module.exports = router;
