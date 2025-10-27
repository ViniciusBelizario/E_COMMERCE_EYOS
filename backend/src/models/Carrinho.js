// src/models/Carrinho.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Carrinho = sequelize.define(
  "Carrinho",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // seus controllers usam where: { usuario_id: userId }
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },

    status: {
      type: DataTypes.ENUM("aberto", "finalizado"),
      defaultValue: "aberto",
    },

    // ====== FRETE ESCOLHIDO PELO CLIENTE ======
    shipping_service_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "service_id escolhido na cotação (ex.: Melhor Envio)",
    },
    shipping_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      comment: "Valor do frete escolhido no carrinho",
    },
    shipping_quote_json: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Cache das opções de cotação (JSON) para exibir/validar no front",
    },
  },
  {
    tableName: "Carrinho",
  }
);

module.exports = Carrinho;
