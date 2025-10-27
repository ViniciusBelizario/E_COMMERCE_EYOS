// src/routes/freteRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const FreteController = require("../controllers/FreteController");

router.post("/cotacao", auth, FreteController.cotar);

module.exports = router;
