const express = require("express");
const router = express.Router();

// Importar rotas específicas
const categoriaRoutes = require("./categoriaRoutes");
const marcaRoutes = require("./marcaRoutes");
const corRoutes = require("./corRoutes");
const produtoRoutes = require("./produtoRoutes");
const tamanhoRoutes = require("./tamanhoRoutes");
const produtoVariacaoRoutes = require("./produtoVariacaoRoutes");

// Rota inicial (ex.: Dashboard)
router.get("/dashboard", (req, res) => {
    // Renderiza a view "dashboard.ejs" ou "partials/dashboard.ejs", conforme seu setup
    res.render("partials/dashboard", { title: "Painel Administrativo" });
});

// Rotas do e-commerce
router.use("/categorias", categoriaRoutes);
router.use("/marcas", marcaRoutes);
router.use("/cores", corRoutes);
router.use("/produtos", produtoRoutes);
router.use("/tamanhos", tamanhoRoutes);
router.use("/produto-variacoes", produtoVariacaoRoutes);

module.exports = router;
