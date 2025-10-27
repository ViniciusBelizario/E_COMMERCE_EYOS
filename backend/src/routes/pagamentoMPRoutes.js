const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const MP = require("../controllers/PagamentoMPController");

// criar preference (precisa estar logado)
router.post("/preferencia", auth, MP.criarPreferencia);

// webhook (acesso público pelo MP)
router.post("/webhook", MP.webhook);

module.exports = router;
