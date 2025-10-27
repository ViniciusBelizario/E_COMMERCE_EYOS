// src/controllers/AdminPedidoController.js
const sequelize = require("../config/database");
const Pedido = require("../models/Pedido");
const PedidoItem = require("../models/PedidoItem");
const MelhorEnvio = require("../services/melhorEnvio");

// util para guardar pedaços no shipping_raw
function appendShippingRaw(current, patch) {
  try {
    const base = current ? JSON.parse(current) : {};
    return JSON.stringify({ ...base, ...patch });
  } catch {
    return JSON.stringify(patch);
  }
}

exports.listarTodos = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      order: [["id", "DESC"]],
      include: [{ model: PedidoItem }],
    });
    // normaliza números
    const out = pedidos.map((p) => {
      const j = p.toJSON();
      j.total = Number(j.total);
      if (j.shipping_price != null) j.shipping_price = Number(j.shipping_price);
      if (Array.isArray(j.PedidoItems)) {
        j.PedidoItems = j.PedidoItems.map((pi) => ({ ...pi, preco_unitario: Number(pi.preco_unitario) }));
      }
      return j;
    });
    return res.json(out);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro ao listar pedidos (admin)." });
  }
};

exports.detalhar = async (req, res) => {
  try {
    const { id } = req.params;
    const pedido = await Pedido.findOne({
      where: { id },
      include: [{ model: PedidoItem }],
    });
    if (!pedido) return res.status(404).json({ error: "Pedido não encontrado." });

    const j = pedido.toJSON();
    j.total = Number(j.total);
    if (j.shipping_price != null) j.shipping_price = Number(j.shipping_price);
    if (Array.isArray(j.PedidoItems)) {
      j.PedidoItems = j.PedidoItems.map((pi) => ({ ...pi, preco_unitario: Number(pi.preco_unitario) }));
    }
    return res.json(j);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro ao detalhar pedido (admin)." });
  }
};

/**
 * POST /admin/pedidos/:id/etiqueta/comprar
 * Compra etiqueta(s) no ME para o shipment já inserido no carrinho.
 * Requisitos:
 * - pedido.me_shipment_id presente
 * - pedido.status adequado (ex: "pago") -> aqui só validamos se quiser
 */
exports.comprarEtiqueta = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const pedido = await Pedido.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!pedido) {
      await t.rollback();
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    if (!pedido.me_shipment_id) {
      await t.rollback();
      return res.status(422).json({ error: "ME_SHIPMENT_AUSENTE", message: "Pedido não possui envio no carrinho do Melhor Envio." });
    }

    // (opcional) Impor regra: só compra etiqueta se o pedido estiver "pago"
    // if (pedido.status !== "pago") {
    //   await t.rollback();
    //   return res.status(422).json({ error: "PEDIDO_NAO_PAGO", message: "Só é possível comprar etiqueta para pedidos pagos." });
    // }

    // Compra (checkout) no Melhor Envio
    const resp = await MelhorEnvio.buyLabels([pedido.me_shipment_id]);

    // ME costuma devolver uma estrutura; guardamos no raw
    const newRaw = appendShippingRaw(pedido.shipping_raw, { checkout: resp });

    // Marcar status interno
    await pedido.update(
      {
        shipping_status: "etiqueta_comprada",
        shipping_raw: newRaw
      },
      { transaction: t }
    );

    await t.commit();
    return res.json({ ok: true, message: "Etiqueta comprada com sucesso.", checkout: resp });
  } catch (e) {
    await t.rollback();
    console.error("[admin comprarEtiqueta] erro:", e?.response?.data || e);
    return res.status(500).json({
      error: "ERRO_COMPRAR_ETIQUETA",
      details: e?.response?.data || e?.data || e?.message || String(e),
    });
  }
};

/**
 * POST /admin/pedidos/:id/etiqueta/gerar
 * Gera a etiqueta após a compra (alguns fluxos do ME exigem)
 */
exports.gerarEtiqueta = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const pedido = await Pedido.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!pedido) {
      await t.rollback();
      return res.status(404).json({ error: "Pedido não encontrado." });
    }
    if (!pedido.me_shipment_id) {
      await t.rollback();
      return res.status(422).json({ error: "ME_SHIPMENT_AUSENTE", message: "Pedido não possui envio no carrinho do Melhor Envio." });
    }

    const resp = await MelhorEnvio.generateLabel(pedido.me_shipment_id);
    const newRaw = appendShippingRaw(pedido.shipping_raw, { generate: resp });

    // se o ME devolver um id/uuid de label, salve
    const possibleLabelId =
      resp?.id || resp?.label_id || resp?.shipment_id || resp?.data?.id || null;

    await pedido.update(
      {
        me_label_id: possibleLabelId || pedido.me_label_id,
        shipping_raw: newRaw
      },
      { transaction: t }
    );

    await t.commit();
    return res.json({ ok: true, message: "Etiqueta gerada.", generate: resp, me_label_id: possibleLabelId });
  } catch (e) {
    await t.rollback();
    console.error("[admin gerarEtiqueta] erro:", e?.response?.data || e);
    return res.status(500).json({
      error: "ERRO_GERAR_ETIQUETA",
      details: e?.response?.data || e?.data || e?.message || String(e),
    });
  }
};

/**
 * POST /admin/pedidos/:id/etiqueta/imprimir
 * Retorna link (PDF) para impressão da etiqueta.
 * Alguns ambientes retornam `url`, outros binário. Aqui retornamos a `url` se existir.
 */
exports.imprimirEtiqueta = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const pedido = await Pedido.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!pedido) {
      await t.rollback();
      return res.status(404).json({ error: "Pedido não encontrado." });
    }
    if (!pedido.me_shipment_id) {
      await t.rollback();
      return res.status(422).json({ error: "ME_SHIPMENT_AUSENTE", message: "Pedido não possui envio no carrinho do Melhor Envio." });
    }

    const resp = await MelhorEnvio.printLabel(pedido.me_shipment_id, "private");
    const newRaw = appendShippingRaw(pedido.shipping_raw, { print: resp });

    // tentar pegar tracking ou link
    const printUrl = resp?.url || resp?.links?.[0]?.href || null;
    const tracking =
      resp?.tracking_code ||
      resp?.tracking ||
      resp?.data?.tracking ||
      pedido.shipping_tracking_code ||
      null;

    await pedido.update(
      {
        shipping_raw: newRaw,
        shipping_tracking_code: tracking
      },
      { transaction: t }
    );

    await t.commit();
    return res.json({
      ok: true,
      message: "Etiqueta pronta para impressão.",
      print_url: printUrl,
      tracking_code: tracking,
      raw: resp
    });
  } catch (e) {
    await t.rollback();
    console.error("[admin imprimirEtiqueta] erro:", e?.response?.data || e);
    return res.status(500).json({
      error: "ERRO_IMPRIMIR_ETIQUETA",
      details: e?.response?.data || e?.data || e?.message || String(e),
    });
  }
};
