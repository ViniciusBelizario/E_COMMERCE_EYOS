// models/Categoria.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Categoria = sequelize.define("Categoria", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  descricao: {
    type: DataTypes.TEXT,
  },
  pai_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    // Caso queira associar self reference, pode-se adicionar depois
  },
});

module.exports = Categoria;
