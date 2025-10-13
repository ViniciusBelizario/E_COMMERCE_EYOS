//routes\marcaRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

// Página de marcas
router.get("/", authMiddleware, (req, res) => {
    res.render("partials/marcas");
});

module.exports = router;
