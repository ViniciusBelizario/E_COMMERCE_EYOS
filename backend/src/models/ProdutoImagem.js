// models/ProdutoImagem.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Produto = require("./Produto");

const ProdutoImagem = sequelize.define("ProdutoImagem", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  caminho: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Associação: 1 Produto -> N ProdutoImagem
Produto.hasMany(ProdutoImagem, { foreignKey: "produto_id", as: "imagens" });
ProdutoImagem.belongsTo(Produto, { foreignKey: "produto_id" });

module.exports = ProdutoImagem;
