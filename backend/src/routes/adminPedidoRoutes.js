// src/routes/adminPedidoRoutes.js
const express = require("express");
const AdminPedidoController = require("../controllers/AdminPedidoController");

const router = express.Router();

router.get("/", AdminPedidoController.listarTodos);
router.get("/:id", AdminPedidoController.detalhar);
router.post("/:id/etiqueta/comprar", AdminPedidoController.comprarEtiqueta);
router.post("/:id/etiqueta/gerar", AdminPedidoController.gerarEtiqueta);
router.post("/:id/etiqueta/imprimir", AdminPedidoController.imprimirEtiqueta);

module.exports = router;
