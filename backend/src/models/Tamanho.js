const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Tamanho = sequelize.define("Tamanho", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nome: { type: DataTypes.STRING, allowNull: false, unique: true }
});

module.exports = Tamanho;
