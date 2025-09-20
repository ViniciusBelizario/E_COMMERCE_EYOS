// src/routes/corRoutes.js
const express = require("express");
const CorController = require("../controllers/CorController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// 🔹 Qualquer usuário pode visualizar as cores
router.get("/", CorController.listarCores);

// 🔹 Apenas administradores podem criar novas cores
router.post("/", authMiddleware, CorController.criarCor);

module.exports = router;
