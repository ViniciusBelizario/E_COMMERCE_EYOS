// src/routes/index.js
const express = require("express");

// Import das rotas
const authRoutes = require("./authRoutes");
const usuarioRoutes = require("./usuarioRoutes");
const enderecoRoutes = require("./enderecoRoutes");
const marcaRoutes = require("./marcaRoutes");
const corRoutes = require("./corRoutes");
const tamanhoRoutes = require("./tamanhoRoutes");
const categoriaRoutes = require("./categoriaRoutes");
const produtoRoutes = require("./produtoRoutes");
const produtoVariacaoRoutes = require("./produtoVariacaoRoutes");
const carrinhoRoutes = require("./carrinhoRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/usuarios", usuarioRoutes);
router.use("/enderecos", enderecoRoutes);
router.use("/marcas", marcaRoutes);
router.use("/cores", corRoutes);
router.use("/tamanhos", tamanhoRoutes);
router.use("/categorias", categoriaRoutes);
router.use("/produtos", produtoRoutes);
router.use("/produto-variacoes", produtoVariacaoRoutes);
router.use("/carrinho", carrinhoRoutes);

module.exports = router;
