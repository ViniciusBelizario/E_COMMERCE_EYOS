// src/routes/index.js
const express = require("express");

const authRoutes = require("./authRoutes");
const enderecoRoutes = require("./enderecoRoutes");
const marcaRoutes = require("./marcaRoutes");
const corRoutes = require("./corRoutes");
const tamanhoRoutes = require("./tamanhoRoutes");
const categoriaRoutes = require("./categoriaRoutes");
const produtoRoutes = require("./produtoRoutes");
const produtoVariacaoRoutes = require("./produtoVariacaoRoutes");
const carrinhoRoutes = require("./carrinhoRoutes");
const pedidoRoutes = require("./pedidoRoutes");
const freteRoutes = require("./freteRoutes");
const adminPedidoRoutes = require("./adminPedidoRoutes");
const auth = require("../middlewares/authMiddleware");
const adminOnly = require("../middlewares/adminOnly");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/enderecos", enderecoRoutes);
router.use("/marcas", marcaRoutes);
router.use("/cores", corRoutes);
router.use("/tamanhos", tamanhoRoutes);
router.use("/categorias", categoriaRoutes);
router.use("/produtos", produtoRoutes);
router.use("/produto-variacoes", produtoVariacaoRoutes);
router.use("/carrinho", carrinhoRoutes);
router.use("/pedidos", pedidoRoutes);
router.use("/fretes", freteRoutes);


router.use("/admin/pedidos", auth, adminOnly, adminPedidoRoutes);

module.exports = router;
