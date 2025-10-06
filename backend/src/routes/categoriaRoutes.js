// src/routes/categoriaRoutes.js
const express = require("express");
const CategoriaController = require("../controllers/CategoriaController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminOnly = require("../middlewares/adminOnly");

const router = express.Router();

// Sanity check – remove depois que subir
if (!CategoriaController || typeof CategoriaController.listarCategorias !== "function") {
  console.error("CategoriaController inválido:", CategoriaController);
  throw new Error("CategoriaController.listarCategorias não é uma função. Verifique o export e o caminho do require.");
}

// Público
router.get("/", CategoriaController.listarCategorias);
router.get("/:id", CategoriaController.buscarCategoria);

// Admin
router.post("/", authMiddleware, adminOnly, CategoriaController.criarCategoria);
router.put("/:id", authMiddleware, adminOnly, CategoriaController.atualizarCategoria);
router.delete("/:id", authMiddleware, adminOnly, CategoriaController.deletarCategoria);

module.exports = router;
