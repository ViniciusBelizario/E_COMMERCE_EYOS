const express = require("express");
const CategoriaController = require("../controllers/CategoriaController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// 🔹 Qualquer usuário pode visualizar categorias
router.get("/", CategoriaController.listarCategorias);
router.get("/:id", CategoriaController.buscarCategoria);

// 🔹 Apenas administradores podem criar, atualizar e deletar categorias
router.post("/", authMiddleware, CategoriaController.criarCategoria);
router.put("/:id", authMiddleware, CategoriaController.atualizarCategoria);
router.delete("/:id", authMiddleware, CategoriaController.deletarCategoria);

module.exports = router;
