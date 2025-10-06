// src/models/CarrinhoItem.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CarrinhoItem = sequelize.define("CarrinhoItem", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quantidade: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, validate: { min: 1 } },
  preco_unitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } },
  // FKs serão associadas no models/index.js
  // carrinho_id, produto_id, cor_id, tamanho_id
  cor_id: { type: DataTypes.INTEGER, allowNull: true },
  tamanho_id: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: "CarrinhoItem",
  indexes: [
    { fields: ["carrinho_id"] },
    { fields: ["produto_id"] },
    { fields: ["cor_id"] },
    { fields: ["tamanho_id"] },
  ]
});

module.exports = CarrinhoItem;
