// src/models/Pedido.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Usuario = require("./Usuario");

const Pedido = sequelize.define("Pedido", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  status: {
    type: DataTypes.ENUM("novo", "pago", "enviado", "concluido", "cancelado"),
    defaultValue: "novo",
  },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  endereco_entrega_id: { type: DataTypes.INTEGER, allowNull: true },
  metodo_pagamento: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: "Pedido",
});

Pedido.belongsTo(Usuario, { foreignKey: "usuario_id", onDelete: "CASCADE" });
Usuario.hasMany(Pedido, { foreignKey: "usuario_id", onDelete: "CASCADE" });

module.exports = Pedido;
