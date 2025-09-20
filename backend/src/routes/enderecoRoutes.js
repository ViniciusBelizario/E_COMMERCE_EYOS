// src/routes/enderecoRoutes.js
const express = require("express");
const EnderecoController = require("../controllers/EnderecoController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Todas as rotas de endereço requerem autenticação (JWT)
router.use(authMiddleware);

// Rotas protegidas
router.get("/", EnderecoController.listarEnderecos);
router.post("/", EnderecoController.criarEndereco);
router.put("/:id", EnderecoController.atualizarEndereco);
router.delete("/:id", EnderecoController.deletarEndereco);

module.exports = router;
