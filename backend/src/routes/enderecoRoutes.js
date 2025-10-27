// src/routes/enderecoRoutes.js
const express = require("express");
const EnderecoController = require("../controllers/EnderecoController");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();

// Todas as rotas são do usuário autenticado
router.get("/", auth, EnderecoController.listarMeusEnderecos);
router.get("/:id", auth, EnderecoController.buscarMeuEndereco);
router.post("/", auth, EnderecoController.criarEndereco);
router.put("/:id", auth, EnderecoController.atualizarEndereco);
router.delete("/:id", auth, EnderecoController.removerEndereco);

module.exports = router;
