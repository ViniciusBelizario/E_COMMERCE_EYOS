// src/models/Pedido.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Pedido = sequelize.define(
  "Pedido",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    endereco_entrega_id: { type: DataTypes.INTEGER, allowNull: true },

    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },

    status: {
      type: DataTypes.ENUM(
        "aguardando_pagamento",
        "pago",
        "cancelado",
        "enviado",
        "concluido"
      ),
      defaultValue: "aguardando_pagamento",
      allowNull: false,
      comment: "Status geral do pedido (negócio)."
    },

    observacoes: { type: DataTypes.TEXT, allowNull: true },

    // ====== FRETE / MELHOR ENVIO ======
    shipping_provider: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "melhor_envio",
      comment: "Provedor de frete. Ex.: melhor_envio",
    },
    shipping_service_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ID do serviço escolhido no provedor (ex.: service_id do Melhor Envio)",
    },
    shipping_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      comment: "Valor do frete somado ao total",
    },
    shipping_status: {
      type: DataTypes.ENUM(
        "pendente",
        "etiqueta_comprada",
        "postado",
        "em_transporte",
        "entregue"
      ),
      allowNull: true,
      defaultValue: "pendente",
    },
    shipping_tracking_code: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Código de rastreio retornado pelo provedor",
    },
    shipping_raw: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "JSON bruto de respostas do provedor (checkout/label/track)",
    },
    me_shipment_id: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "ID do envio criado no Melhor Envio (rascunho/carrinho)",
    },
    me_label_id: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "ID/identificador da etiqueta após compra/geração",
    },

    // ====== PAGAMENTO / MERCADO PAGO ======
    payment_provider: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Provedor de pagamento. Ex.: mercado_pago",
    },
    payment_status: {
      type: DataTypes.ENUM(
        "pending",
        "approved",
        "authorized",
        "in_process",
        "in_mediation",
        "rejected",
        "cancelled",
        "refunded",
        "charged_back"
      ),
      allowNull: true,
      comment: "Status retornado pelo provedor (MP)."
    },
    payment_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Valor total cobrado pelo provedor (quando aplicável).",
    },
    mp_preference_id: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "ID da Preference do Mercado Pago (Checkout Pro).",
    },
    mp_payment_id: {
      type: DataTypes.STRING, // <- corrigido aqui
      allowNull: true,
      comment: "ID do pagamento no Mercado Pago (payments/{id}).",
    },
    payment_raw: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "JSON bruto de notificações/consultas do provedor de pagamento.",
    },
  },
  { tableName: "Pedido" }
);

module.exports = Pedido;
