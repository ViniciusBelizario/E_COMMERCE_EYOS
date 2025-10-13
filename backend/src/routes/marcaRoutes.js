const express = require("express");
const MarcaController = require("../controllers/MarcaController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminOnly = require("../middlewares/adminOnly");

const router = express.Router();

// Público
router.get("/", MarcaController.listarMarcas);

// 🔎 nova rota pública de busca por marca
router.get("/busca", MarcaController.buscarPorNome);

// Admin
router.post("/", authMiddleware, adminOnly, MarcaController.criarMarca);

module.exports = router;
