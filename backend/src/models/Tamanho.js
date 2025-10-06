const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Tamanho = sequelize.define("Tamanho", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING, allowNull: false, unique: true },
}, {
  tableName: "Tamanho",
});

module.exports = Tamanho;
