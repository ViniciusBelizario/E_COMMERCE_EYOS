// src/models/Usuario.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Usuario = sequelize.define("Usuario", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  nome: { type: DataTypes.STRING, allowNull: false },

  email: { 
    type: DataTypes.STRING(255), 
    allowNull: false, 
    unique: true,                // deixa o Sequelize criar o índice único automático
    validate: { isEmail: true }
  },

  senha_hash: { type: DataTypes.STRING, allowNull: false },

  telefone: { type: DataTypes.STRING, allowNull: true },

  tipo: {
    type: DataTypes.ENUM("cliente", "administrador"),
    defaultValue: "cliente",
    allowNull: false,
  },

  // CPF armazenado só com dígitos (11). Se quiser permitir máscara, troque para STRING(14).
  cpf: {
    type: DataTypes.STRING(11),
    allowNull: false,
    unique: true,                // índice único automático para o CPF
    comment: "Apenas dígitos (11)."
  },
}, {
  tableName: "Usuario",
  // IMPORTANTE: não defina indexes duplicando os unique acima
  // indexes: []  // (deixa vazio/omitido)
});

module.exports = Usuario;
