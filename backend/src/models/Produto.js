const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Produto = sequelize.define(
  "Produto",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nome: { type: DataTypes.STRING, allowNull: false },                // sem indexes aqui
    descricao: { type: DataTypes.TEXT, allowNull: true },
    preco: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    estoque: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    imagem_url: { type: DataTypes.STRING, allowNull: true },
    video_url: { type: DataTypes.STRING, allowNull: true },

    // As FKs podem ficar declaradas como colunas (ok),
    // mas os índices NÃO precisam ser declarados manualmente.
    categoria_id: { type: DataTypes.INTEGER, allowNull: true },
    marca_id: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "Produto",
    // ❌ Removido: nada de { indexes: [...] } aqui
  }
);

module.exports = Produto;
