//routes\tamanhoRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
// Página de marcas
router.get("/", authMiddleware, (req, res) => {
    res.render("partials/tamanhos");
});

module.exports = router;