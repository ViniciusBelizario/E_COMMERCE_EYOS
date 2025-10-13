// src/routes/produtoRoutes.js
const express = require("express");
const ProdutoController = require("../controllers/ProdutoController");
const auth = require("../middlewares/authMiddleware");
const adminOnly = require("../middlewares/adminOnly");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

// Público
router.get("/", ProdutoController.listar);
router.get("/:id", ProdutoController.buscar);

// Admin — cria/mescla produto; variações herdam imagem do produto quando apropriado
router.post(
  "/",
  auth,
  adminOnly,
  upload, // fields: imagem, video
  ProdutoController.criarOuMesclar
);

router.put(
  "/:id",
  auth,
  adminOnly,
  upload,
  ProdutoController.atualizar
);

router.delete("/:id", auth, adminOnly, ProdutoController.remover);

module.exports = router;
