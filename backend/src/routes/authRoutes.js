// routes/authRoutes.js
const express = require("express");
const AuthController = require("../controllers/AuthController");

const router = express.Router();

// Rotas de registro e login
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

module.exports = router;
