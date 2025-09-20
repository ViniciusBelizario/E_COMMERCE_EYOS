// models/Marca.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Marca = sequelize.define("Marca", {
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
  descricao: {
    type: DataTypes.TEXT,
  },
});

module.exports = Marca;
