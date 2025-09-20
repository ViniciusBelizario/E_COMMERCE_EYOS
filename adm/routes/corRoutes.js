const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

// Página de cores
router.get("/", authMiddleware, (req, res) => {
    res.render("partials/cores");
});

module.exports = router;
