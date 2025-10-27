// src/models/PedidoItem.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PedidoItem = sequelize.define(
  "PedidoItem",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    pedido_id: { type: DataTypes.INTEGER, allowNull: false },
    produto_id: { type: DataTypes.INTEGER, allowNull: true }, // snapshot pode ficar NULL depois
    cor_id: { type: DataTypes.INTEGER, allowNull: true },
    tamanho_id: { type: DataTypes.INTEGER, allowNull: true },
    quantidade: { type: DataTypes.INTEGER, allowNull: false },
    preco_unitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },

    // snapshots para histórico
    nome_produto: { type: DataTypes.STRING, allowNull: false },
    imagem_produto: { type: DataTypes.STRING, allowNull: true },
    nome_cor: { type: DataTypes.STRING, allowNull: true },
    codigo_hex_cor: { type: DataTypes.STRING, allowNull: true },
    nome_tamanho: { type: DataTypes.STRING, allowNull: true },
  },
  { tableName: "PedidoItem" }
);

module.exports = PedidoItem;
