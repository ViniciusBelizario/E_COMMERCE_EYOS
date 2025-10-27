const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const PagamentoController = require("../controllers/PagamentoController");

// cria preference a partir do pedido (usuário logado)
router.post("/mercadopago/checkout", auth, PagamentoController.criarPreference);

// páginas de retorno (somente UX, status real vem via webhook)
router.get("/mercadopago/retorno/sucesso", PagamentoController.retornoSucesso);
router.get("/mercadopago/retorno/falha",   PagamentoController.retornoFalha);
router.get("/mercadopago/retorno/pendente",PagamentoController.retornoPendente);

// webhook (sem auth; Mercado Pago chama diretamente)
router.post("/mercadopago/webhook", PagamentoController.webhook);

// atalho: alguns preferem expor também em /webhooks/mercadopago
router.post("/webhooks/mercadopago", PagamentoController.webhook);

module.exports = router;
