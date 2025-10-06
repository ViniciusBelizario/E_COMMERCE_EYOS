const express = require("express");
const CorController = require("../controllers/CorController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminOnly = require("../middlewares/adminOnly");

const router = express.Router();

// Público
router.get("/", CorController.listarCores);

// Admin
router.post("/", authMiddleware, adminOnly, CorController.criarCor);

module.exports = router;
