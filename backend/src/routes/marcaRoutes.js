// src/routes/marcaRoutes.js
const express = require("express");
const MarcaController = require("../controllers/MarcaController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// 🔹 Qualquer usuário pode visualizar marcas
router.get("/", MarcaController.listarMarcas);

// 🔹 Apenas administradores podem criar marcas (já validado no controller)
router.post("/", authMiddleware, MarcaController.criarMarca);

module.exports = router;
