// src/models/Endereco.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Endereco = sequelize.define(
  "Endereco",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    // campos solicitados
    cidade: { type: DataTypes.STRING, allowNull: false },
    rua: { type: DataTypes.STRING, allowNull: false },
    bairro: { type: DataTypes.STRING, allowNull: false },
    cep: { type: DataTypes.STRING, allowNull: false },
    numero: { type: DataTypes.STRING, allowNull: false },
    complemento: { type: DataTypes.STRING, allowNull: true },

    // opcionais (mantive para compatibilidade se você já usava)
    estado: { type: DataTypes.STRING, allowNull: true },
    pais: { type: DataTypes.STRING, allowNull: true },

    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  { tableName: "Enderecos" }
);

module.exports = Endereco;
