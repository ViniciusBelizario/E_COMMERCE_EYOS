// models/CarrinhoItem.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Carrinho = require("./Carrinho");
const Produto = require("./Produto");

const CarrinhoItem = sequelize.define("CarrinhoItem", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  quantidade: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false,
  },
});

// Associação com Carrinho e Produto
CarrinhoItem.belongsTo(Carrinho, { foreignKey: "carrinho_id" });
Carrinho.hasMany(CarrinhoItem, { foreignKey: "carrinho_id" });

CarrinhoItem.belongsTo(Produto, { foreignKey: "produto_id" });
Produto.hasMany(CarrinhoItem, { foreignKey: "produto_id" });

module.exports = CarrinhoItem;
