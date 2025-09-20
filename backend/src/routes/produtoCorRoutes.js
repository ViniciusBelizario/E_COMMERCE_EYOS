const express = require("express");
const ProdutoCorController = require("../controllers/ProdutoCorController"); // Verifique o nome do arquivo!
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// 🔹 Garante que as funções existem no ProdutoCorController
router.get("/", ProdutoCorController.listarProdutoCores);
router.post("/", authMiddleware, ProdutoCorController.criarProdutoCor);
router.delete("/:id", authMiddleware, ProdutoCorController.deletarProdutoCor);

module.exports = router;
