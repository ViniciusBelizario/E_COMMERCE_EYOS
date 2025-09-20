const express = require("express");
const CarrinhoController = require("../controllers/CarrinhoController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, CarrinhoController.obterCarrinho);
router.post("/item", authMiddleware, CarrinhoController.adicionarItem);
router.put("/item/:id", authMiddleware, CarrinhoController.atualizarItem);
router.delete("/item/:id", authMiddleware, CarrinhoController.removerItem);
router.post("/finalizar", authMiddleware, CarrinhoController.finalizarCarrinho);

module.exports = router;
