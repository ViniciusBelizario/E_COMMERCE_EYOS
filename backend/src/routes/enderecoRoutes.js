const express = require("express");
const EnderecoController = require("../controllers/EnderecoController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", EnderecoController.listarEnderecos);
router.post("/", EnderecoController.criarEndereco);
router.put("/:id", EnderecoController.atualizarEndereco);
router.delete("/:id", EnderecoController.deletarEndereco);

module.exports = router;
