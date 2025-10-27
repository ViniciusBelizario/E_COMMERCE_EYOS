const sequelize = require("../config/database");
const Pedido = require("../models/Pedido");
const PedidoItem = require("../models/PedidoItem");
const { createPreference, getPayment } = require("../services/mercadoPago");

const APP_URL = process.env.APP_URL || "http://localhost:3001";

// POST /pagamentos/mp/preferencia  { pedido_id }
exports.criarPreferencia = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { pedido_id } = req.body || {};
    if (!pedido_id) {
      await t.rollback();
      return res.status(400).json({ error: "pedido_id é obrigatório." });
    }

    const pedido = await Pedido.findByPk(pedido_id, {
      include: [{ model: PedidoItem }],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!pedido) {
      await t.rollback();
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    if (pedido.status !== "aguardando_pagamento") {
      await t.rollback();
      return res.status(409).json({ error: "STATUS_INVALIDO", message: "Pedido não está aguardando pagamento." });
    }

    // monta items para a preference (valor dos produtos, sem frete; o frete já está no pedido.total)
    const items = (pedido.PedidoItems || []).map((pi) => ({
      title: pi.nome_produto || `Item ${pi.produto_id}`,
      quantity: Number(pi.quantidade || 1),
      unit_price: Number(pi.preco_unitario || 0),
      currency_id: "BRL",
    }));

    // Opcional: incluir item Frete (se você quer mostrá-lo na UI do MP). Se não, deixe só nos items de produto.
    // items.push({ title: "Frete", quantity: 1, unit_price: Number(pedido.shipping_price || 0), currency_id: "BRL" });

    const preferencePayload = {
      external_reference: String(pedido.id),
      items,
      payer: {}, // opcional (email, nome) – pode preencher depois
      notification_url: `${APP_URL}/pagamentos/mp/webhook`,
      back_urls: {
        success: `${APP_URL}/pagamentos/mp/sucesso?pedido_id=${pedido.id}`,
        failure: `${APP_URL}/pagamentos/mp/erro?pedido_id=${pedido.id}`,
        pending: `${APP_URL}/pagamentos/mp/pendente?pedido_id=${pedido.id}`,
      },
      auto_return: "approved",
    };

    const pref = await createPreference(preferencePayload);

    await pedido.update(
      {
        payment_provider: "mercado_pago",
        payment_status: "pendente",
        payment_total: Number(pedido.total),
        mp_preference_id: pref.id,
      },
      { transaction: t }
    );

    await t.commit();
    return res.json({
      ok: true,
      preference_id: pref.id,
      init_point: pref.init_point,
      sandbox_init_point: pref.sandbox_init_point,
    });
  } catch (e) {
    await t.rollback();
    console.error(e);
    return res.status(500).json({ error: "Erro ao criar preferência do Mercado Pago.", details: e });
  }
};

// POST /pagamentos/mp/webhook (aceita body novo, legado, ou query)
// Atualiza o pedido para "pago" quando payment.status === "approved"
exports.webhook = async (req, res) => {
  try {
    let paymentId = null;

    // formatos aceitos
    if (req.query?.id && String(req.query?.type).toLowerCase() === "payment") {
      paymentId = req.query.id;
    } else if (req.body?.data?.id && String(req.body?.type).toLowerCase() === "payment") {
      paymentId = req.body.data.id;
    } else if (req.body?.id && String(req.body?.type).toLowerCase() === "payment") {
      paymentId = req.body.id;
    }

    if (!paymentId) {
      // Mesmo sem id retornamos 200 para evitar re-tentativas infinitas do MP
      return res.status(200).json({ ok: true, message: "Webhook recebido, sem payment id." });
    }

    // consulta pagamento no MP
    const pmt = await getPayment(paymentId);

    const status = pmt?.status;              // "approved", "rejected", "pending"...
    const extRef = pmt?.external_reference;  // deve ser o id do pedido que enviamos na preference

    if (!extRef) {
      return res.status(200).json({ ok: true, message: "Pagamento sem external_reference." });
    }

    const pedidoId = Number(extRef);
    const pedido = await Pedido.findByPk(pedidoId);
    if (!pedido) {
      return res.status(200).json({ ok: true, message: "Pedido não encontrado para external_reference." });
    }

    // guarda raw
    const oldRaw = pedido.payment_raw ? JSON.parse(pedido.payment_raw) : {};
    const newRaw = JSON.stringify({ ...oldRaw, last_webhook_payment: pmt });

    // atualiza conforme status
    if (status === "approved") {
      await pedido.update({
        status: "pago",
        payment_provider: "mercado_pago",
        payment_status: status,
        mp_payment_id: String(pmt.id),
        payment_raw: newRaw,
      });
    } else {
      // qualquer outro status: só persiste o raw e o payment_status
      await pedido.update({
        payment_provider: "mercado_pago",
        payment_status: status,
        mp_payment_id: String(pmt.id),
        payment_raw: newRaw,
      });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("[mp.webhook] erro:", e?.response?.data || e);
    // Retorne 200 para o MP não ficar re-tentando sem parar (ou 500 se você quer que ele tente de novo)
    return res.status(200).json({ ok: true, warn: "erro processando webhook", details: e?.message || String(e) });
  }
};
