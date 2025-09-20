// models/Cor.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Cor = sequelize.define("Cor", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  codigo_hex: {
    type: DataTypes.STRING(7), // Exemplo: #FF0000
  },
});

module.exports = Cor;
