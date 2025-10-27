// src/models/Usuario.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Usuario = sequelize.define(
  "Usuario",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    senha_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    telefone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cpf: {
      type: DataTypes.STRING(14), // formato "000.000.000-00" ou só números
      allowNull: false,
      unique: true,
      validate: {
        len: [11, 14],
        notEmpty: true,
      },
    },
    tipo: {
      type: DataTypes.ENUM("cliente", "administrador"),
      defaultValue: "cliente",
    },
  },
  {
    tableName: "Usuario",
  }
);

module.exports = Usuario;
