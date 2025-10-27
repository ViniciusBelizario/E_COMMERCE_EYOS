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

    // ✅ Deixe APENAS uma forma de declarar o UNIQUE composto.
    // Aqui vou usar "uniqueKeys" e NÃO usarei "indexes" para esse UNIQUE.
    uniqueKeys: {
      uniq_produto_cor_tamanho: {
        fields: ["produto_id", "cor_id", "tamanho_id"],
      },
    },

    // ❌ Não declare "indexes" para esses 3 campos de novo (evita duplicar).
    // Se quiser índices NÃO únicos adicionais, pode declarar aqui,
    // mas NÃO repita o trio (produto_id, cor_id, tamanho_id).
    indexes: [
      // Exemplo de índices simples opcionais (não são obrigatórios):
      // { name: "pv_produto_id_idx", fields: ["produto_id"] },
      // { name: "pv_cor_id_idx", fields: ["cor_id"] },
      // { name: "pv_tamanho_id_idx", fields: ["tamanho_id"] },
    ],
  }
);

module.exports = ProdutoVariacao;
