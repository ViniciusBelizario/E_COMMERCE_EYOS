const express = require("express");
const UsuarioController = require("../controllers/UsuarioController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminOnly = require("../middlewares/adminOnly");

const router = express.Router();

// Admin
router.get("/", authMiddleware, adminOnly, UsuarioController.listarUsuarios);
router.post("/", authMiddleware, adminOnly, UsuarioController.criarUsuario);
router.get("/:id", authMiddleware, adminOnly, UsuarioController.buscarUsuario);
router.put("/:id", authMiddleware, adminOnly, UsuarioController.atualizarUsuario);
router.delete("/:id", authMiddleware, adminOnly, UsuarioController.deletarUsuario);

module.exports = router;
