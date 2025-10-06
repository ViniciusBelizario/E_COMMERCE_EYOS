const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Cor = sequelize.define("Cor", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING, allowNull: false, unique: true },
  codigo_hex: { type: DataTypes.STRING(7), allowNull: true, unique: true }, // e.g. #FF0000
}, {
  tableName: "Cor",
});

module.exports = Cor;
