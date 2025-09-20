const express = require("express");
const UsuarioController = require("../controllers/UsuarioController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, UsuarioController.listarUsuarios);
router.post("/", authMiddleware, UsuarioController.criarUsuario);
router.get("/:id", authMiddleware, UsuarioController.buscarUsuario);
router.put("/:id", authMiddleware, UsuarioController.atualizarUsuario);
router.delete("/:id", authMiddleware, UsuarioController.deletarUsuario);

module.exports = router;
