// src/models/Carrinho.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Carrinho = sequelize.define("Carrinho", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  status: { type: DataTypes.ENUM("aberto", "finalizado"), defaultValue: "aberto" },
}, {
  tableName: "Carrinho",
});

module.exports = Carrinho;
