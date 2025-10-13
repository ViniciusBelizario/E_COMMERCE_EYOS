//routes\produtoRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

// Página de produtos
router.get("/", authMiddleware, (req, res) => {
    res.render("partials/produtos");
});

module.exports = router;
