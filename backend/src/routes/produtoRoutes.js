const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multerConfig");
const ProdutoController = require("../controllers/ProdutoController");

// Rotas para produtos
router.get("/", ProdutoController.listarProdutos);
router.get("/:id", ProdutoController.buscarProduto);
router.post(
    "/",
    authMiddleware,
    upload.any(), // Permite múltiplos campos (imagem, video, imagem_variacao_x_y, etc.)
    ProdutoController.criarProduto
);
router.put(
    "/:id",
    authMiddleware,
    upload.any(), // Permite múltiplos campos
    ProdutoController.atualizarProduto
);
router.delete("/:id", authMiddleware, ProdutoController.deletarProduto);

module.exports = router;
