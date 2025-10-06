// src/models/PedidoItem.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Pedido = require("./Pedido");
const Produto = require("./Produto");
const Cor = require("./Cor");
const Tamanho = require("./Tamanho");

const PedidoItem = sequelize.define("PedidoItem", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  produto_nome: { type: DataTypes.STRING, allowNull: false },   // snapshot
  quantidade: { type: DataTypes.INTEGER, allowNull: false },
  preco_unitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, // snapshot
  imagem_url: { type: DataTypes.STRING, allowNull: true },
  cor_id: { type: DataTypes.INTEGER, allowNull: true },
  tamanho_id: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: "PedidoItem",
});

PedidoItem.belongsTo(Pedido, { foreignKey: "pedido_id", onDelete: "CASCADE" });
Pedido.hasMany(PedidoItem, { foreignKey: "pedido_id", onDelete: "CASCADE" });

PedidoItem.belongsTo(Produto, { foreignKey: "produto_id", onDelete: "SET NULL" });

PedidoItem.belongsTo(Cor, { foreignKey: "cor_id", onDelete: "SET NULL" });
Cor.hasMany(PedidoItem, { foreignKey: "cor_id", onDelete: "SET NULL" });

PedidoItem.belongsTo(Tamanho, { foreignKey: "tamanho_id", onDelete: "SET NULL" });
Tamanho.hasMany(PedidoItem, { foreignKey: "tamanho_id", onDelete: "SET NULL" });

module.exports = PedidoItem;
