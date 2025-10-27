// src/routes/carrinhoRoutes.js
const express = require("express");
const CarrinhoController = require("../controllers/CarrinhoController");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", auth, CarrinhoController.verCarrinho);
router.post("/itens", auth, CarrinhoController.adicionarItem);
router.put("/itens/:id", auth, CarrinhoController.atualizarItem);
router.delete("/itens/:id", auth, CarrinhoController.removerItem);
router.delete("/", auth, CarrinhoController.esvaziarCarrinho);
router.post("/frete", auth, CarrinhoController.escolherFrete);

module.exports = router;
