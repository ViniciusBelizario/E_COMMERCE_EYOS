const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

// Página de categorias (Corrigido o caminho da view)
router.get("/", authMiddleware, (req, res) => {
    res.render("partials/categorias"); // Corrigido para a pasta correta
});

module.exports = router;
