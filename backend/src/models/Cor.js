// src/models/Cor.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Cor = sequelize.define("Cor", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING, allowNull: false, unique: true },
  codigo_hex: { type: DataTypes.STRING(7), allowNull: true, unique: true }, // #RRGGBB
}, {
  tableName: "Cor",
  // IMPORTANTE: não defina aqui "indexes" que dupliquem os de cima
  // indexes: []  <-- deixe vazio ou simplesmente não declare
});

module.exports = Cor;
