const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Marca = require("./Marca");
const Categoria = require("./Categoria");

const Produto = sequelize.define("Produto", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nome: { type: DataTypes.STRING, allowNull: false },
  descricao: { type: DataTypes.TEXT },
  preco: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  estoque: { type: DataTypes.INTEGER, allowNull: false },
  imagem_url: { type: DataTypes.STRING }, // Caminho da imagem do produto
  video_url: { type: DataTypes.STRING },  // Caminho do vídeo do produto
  categoria_id: { type: DataTypes.INTEGER, references: { model: Categoria, key: "id" } },
  marca_id: { type: DataTypes.INTEGER, references: { model: Marca, key: "id" } },
});

module.exports = Produto;
