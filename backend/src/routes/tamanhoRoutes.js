const express = require("express");
const TamanhoController = require("../controllers/TamanhoController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", TamanhoController.listarTamanhos);
router.post("/", authMiddleware, TamanhoController.criarTamanho);
router.delete("/:id", authMiddleware, TamanhoController.deletarTamanho);

module.exports = router;
