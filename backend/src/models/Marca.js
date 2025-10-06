const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Marca = sequelize.define("Marca", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING, allowNull: false, unique: true },
  descricao: { type: DataTypes.TEXT },
}, {
  tableName: "Marca",
});

module.exports = Marca;
