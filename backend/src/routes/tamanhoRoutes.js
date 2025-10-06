const express = require("express");
const TamanhoController = require("../controllers/TamanhoController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminOnly = require("../middlewares/adminOnly");

const router = express.Router();

// Público
router.get("/", TamanhoController.listarTamanhos);

// Admin
router.post("/", authMiddleware, adminOnly, TamanhoController.criarTamanho);
router.delete("/:id", authMiddleware, adminOnly, TamanhoController.deletarTamanho);

module.exports = router;
