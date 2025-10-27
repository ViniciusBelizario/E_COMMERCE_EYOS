const MercadoPago = require("../services/mercadoPago");
const Pedido = require("../models/Pedido");
const PedidoItem = require("../models/PedidoItem");
const Usuario = require("../models/Usuario");

/**
 * POST /pagamentos/mercadopago/checkout
 * body: { pedido_id }
 * -> cria a preference e retorna a URL (init_point)
 */
exports.criarPreference = async (req, res) => {
  try {
    const { pedido_id } = req.body || {};
    if (!pedido_id) {
      return res.status(400).json({ error: "pedido_id é obrigatório." });
    }

    const pedido = await Pedido.findByPk(pedido_id, {
      include: [{ model: PedidoItem }],
    });
    if (!pedido) return res.status(404).json({ error: "Pedido não encontrado." });
    if (pedido.status !== "aguardando_pagamento") {
      return res.status(422).json({ error: "Pedido não está aguardando pagamento." });
    }

    const usuario = await Usuario.findByPk(pedido.usuario_id);

    // Itens da preference: você pode enviar um item único "Pedido #id"
    // ou detalhar item a item (PedidoItems). Vou enviar os itens reais:
    const items = (pedido.PedidoItems || []).map((it) => ({
      id: String(it.id),
      title: `${it.nome_produto || "Produto"} ${it.nome_cor ? `- ${it.nome_cor}` : ""} ${it.nome_tamanho ? `(${it.nome_tamanho})` : ""}`.trim(),
      quantity: Number(it.quantidade),
      currency_id: "BRL",
      unit_price: Number(it.preco_unitario),
    }));

    // Somar frete como item separado (opcional) para ficar claro no MP:
    if (pedido.shipping_price && Number(pedido.shipping_price) > 0) {
      items.push({
        id: "frete",
        title: "Frete",
        quantity: 1,
        currency_id: "BRL",
        unit_price: Number(pedido.shipping_price),
      });
    }

    // URLs de retorno (frente):
    const base = process.env.APP_BASE_URL || "http://localhost:3333";
    const backUrls = {
      success: `${base}/pagamentos/mercadopago/retorno/sucesso?pedido_id=${pedido.id}`,
      failure: `${base}/pagamentos/mercadopago/retorno/falha?pedido_id=${pedido.id}`,
      pending: `${base}/pagamentos/mercadopago/retorno/pendente?pedido_id=${pedido.id}`,
    };

    // Webhook (backend público!):
    const notificationUrl = `${base}/webhooks/mercadopago`;

    const prefPayload = {
      items,
      payer: {
        name: usuario?.nome || undefined,
        email: usuario?.email || undefined,
        phone: usuario?.telefone
          ? { area_code: "", number: usuario.telefone.replace(/\D/g, "") }
          : undefined,
        identification: usuario?.cpf
          ? { type: "CPF", number: usuario.cpf }
          : undefined,
      },
      external_reference: String(pedido.id),
      back_urls: backUrls,
      notification_url: notificationUrl,
      auto_return: "approved", // MP volta automático quando approved
    };

    const pref = await MercadoPago.createPreference(prefPayload);

    await pedido.update({
      payment_provider: "mercado_pago",
      payment_status: "pending",
      payment_total: Number(pedido.total),
      mp_preference_id: pref.id,
    });

    return res.json({
      ok: true,
      pedido_id: pedido.id,
      preference_id: pref.id,
      init_point: pref.init_point,               // URL (web)
      sandbox_init_point: pref.sandbox_init_point, // sandbox
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro ao criar preferência no Mercado Pago.", details: e });
  }
};

/**
 * GET /pagamentos/mercadopago/retorno/:status
 * apenas para UX do cliente; NÃO deve mudar status do pedido sem webhook.
 */
exports.retornoSucesso = async (req, res) => {
  // Você pode redirecionar para sua página de "pedido recebido" no front
  return res.json({ ok: true, message: "Pagamento em processamento (aguarde confirmação).", query: req.query });
};
exports.retornoFalha = async (req, res) => {
  return res.status(400).json({ ok: false, message: "Pagamento não concluído.", query: req.query });
};
exports.retornoPendente = async (req, res) => {
  return res.json({ ok: true, message: "Pagamento pendente.", query: req.query });
};

/**
 * POST /webhooks/mercadopago
 * Corpo vem do MP com topic/type e id do pagamento
 * Fluxo robusto: quando receber notificação, consulta a API /v1/payments/{id}
 * e atualiza o pedido conforme o status.
 */
exports.webhook = async (req, res) => {
  try {
    // MP manda coisas diferentes (v1/v2). Os dois mais comuns:
    const paymentId =
      req.body?.data?.id ||
      req.query?.data_id ||
      req.query?.id ||
      req.body?.id;

    const type =
      req.body?.type ||
      req.query?.type ||
      req.query?.topic;

    if (!paymentId) {
      return res.status(200).json({ ok: true, ignore: "Sem paymentId" });
    }

    // Só tratamos payments
    if ((type || "").toLowerCase().includes("payment")) {
      const payment = await MercadoPago.getPayment(paymentId);

      const externalRef = payment?.external_reference;
      const status = payment?.status; // approved, pending, rejected, etc.

      if (!externalRef) {
        return res.status(200).json({ ok: true, ignore: "Sem external_reference" });
      }

      const pedido = await Pedido.findByPk(externalRef);
      if (!pedido) {
        return res.status(200).json({ ok: true, ignore: "Pedido não encontrado." });
      }

      // Atualiza campos
      const patch = {
        mp_payment_id: String(payment.id),
        payment_status: status || null,
        payment_raw: JSON.stringify(payment),
      };

      // Regras simples de status:
      if (status === "approved") {
        patch.status = "pago";
      } else if (status === "rejected" || status === "cancelled" || status === "charged_back") {
        patch.status = "cancelado";
      } else if (status === "pending" || status === "in_process" || status === "in_mediation") {
        if (pedido.status === "aguardando_pagamento") {
          patch.status = "aguardando_pagamento";
        }
      }

      await pedido.update(patch);

      // Dica: aqui você pode disparar e-mail, notificação, etc.

      return res.status(200).json({ ok: true });
    }

    return res.status(200).json({ ok: true, ignore: "Tipo não tratado" });
  } catch (e) {
    console.error("[MP webhook] erro:", e?.response?.data || e);
    return res.status(200).json({ ok: true }); // MP exige 200 mesmo em erro para não re-chamar em loop
  }
};
