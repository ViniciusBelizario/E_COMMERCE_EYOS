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
        "pendente",            // rascunho criado, etiqueta não comprada
        "etiqueta_comprada",   // etiqueta comprada (checkout no ME)
        "postado",             // postado na transportadora
        "em_transporte",       // em trânsito
        "entregue"             // entregue
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

    // IDs específicos do Melhor Envio
    me_shipment_id: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "ID do envio criado no Melhor Envio (rascunho)",
    },
    me_label_id: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "ID/identificador da etiqueta após compra",
    },
  },
  { tableName: "Pedido" }
);

module.exports = Pedido;
