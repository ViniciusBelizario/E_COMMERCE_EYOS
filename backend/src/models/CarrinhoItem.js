// src/models/CarrinhoItem.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CarrinhoItem = sequelize.define(
  "CarrinhoItem",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    carrinho_id: { type: DataTypes.INTEGER, allowNull: false },
    produto_id:  { type: DataTypes.INTEGER, allowNull: false },
    cor_id:      { type: DataTypes.INTEGER, allowNull: true },
    tamanho_id:  { type: DataTypes.INTEGER, allowNull: true },

    quantidade:  {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 1 },
    },

    // 🔑 Snapshot do preço no momento da adição
    preco_unitario: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
    },

    // ====== OPCIONAL: dimensões/peso p/ cotação de frete (fallback)
    largura:     { type: DataTypes.DECIMAL(10,2), allowNull: true, comment: "cm" },
    altura:      { type: DataTypes.DECIMAL(10,2), allowNull: true, comment: "cm" },
    comprimento: { type: DataTypes.DECIMAL(10,2), allowNull: true, comment: "cm" },
    peso:        { type: DataTypes.DECIMAL(10,3), allowNull: true, comment: "kg" },
  },
  {
    tableName: "CarrinhoItem",
    timestamps: false,
    uniqueKeys: {
      uniq_item_por_variacao: {
        fields: ["carrinho_id", "produto_id", "cor_id", "tamanho_id"],
      },
    },
    indexes: [
      { name: "carrinho_item_carrinho_id", fields: ["carrinho_id"] },
      { name: "carrinho_item_produto_id",  fields: ["produto_id"]  },
    ],
  }
);

module.exports = CarrinhoItem;
