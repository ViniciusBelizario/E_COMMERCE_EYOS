// src/routes/pedidoRoutes.js
const express = require("express");
const PedidoController = require("../controllers/PedidoController");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/checkout", auth, PedidoController.checkout);
router.get("/", auth, PedidoController.listarMeusPedidos);
router.get("/:id", auth, PedidoController.detalharPedido);

module.exports = router;
