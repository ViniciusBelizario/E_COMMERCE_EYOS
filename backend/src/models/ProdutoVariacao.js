// src/models/ProdutoVariacao.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProdutoVariacao = sequelize.define(
  "ProdutoVariacao",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    produto_id: { type: DataTypes.INTEGER, allowNull: false },
    cor_id: { type: DataTypes.INTEGER, allowNull: false },
    tamanho_id: { type: DataTypes.INTEGER, allowNull: false },

    quantidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    imagem_url: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: "ProdutoVariacao",
    timestamps: false,

    // ✅ Defina a UNIQUE apenas uma vez aqui
    uniqueKeys: {
      produto_variacao_produto_id_cor_id_tamanho_id: {
        fields: ["produto_id", "cor_id", "tamanho_id"],
      },
    },

    // Índices normais (sem unique) para acelerar buscas
    indexes: [
      { name: "produto_variacao_produto_id", fields: ["produto_id"] },
      { name: "produto_variacao_cor_id", fields: ["cor_id"] },
      { name: "produto_variacao_tamanho_id", fields: ["tamanho_id"] },
    ],
  }
);

module.exports = ProdutoVariacao;
