const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Produto = require("./Produto");
const Cor = require("./Cor");
const Tamanho = require("./Tamanho");

const ProdutoVariacao = sequelize.define(
  "ProdutoVariacao", // Nome correto do modelo
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    produto_id: { 
      type: DataTypes.INTEGER, 
      references: { model: Produto, key: "id" }, 
      allowNull: false 
    },
    cor_id: { 
      type: DataTypes.INTEGER, 
      references: { model: Cor, key: "id" }, 
      allowNull: false 
    },
    tamanho_id: { 
      type: DataTypes.INTEGER, 
      references: { model: Tamanho, key: "id" }, 
      allowNull: false 
    },
    quantidade: { 
      type: DataTypes.INTEGER, 
      allowNull: false, 
      defaultValue: 0 
    },
    imagem_url: { 
      type: DataTypes.STRING, 
      allowNull: true 
    }
  },
  {
    tableName: "ProdutoVariacao", // ✅ Garante que o nome da tabela será correto
    timestamps: false
  }
);

// Definição das associações
Produto.hasMany(ProdutoVariacao, { foreignKey: "produto_id" });
ProdutoVariacao.belongsTo(Produto, { foreignKey: "produto_id" });

ProdutoVariacao.belongsTo(Cor, { foreignKey: "cor_id" });
Cor.hasMany(ProdutoVariacao, { foreignKey: "cor_id" });

ProdutoVariacao.belongsTo(Tamanho, { foreignKey: "tamanho_id" });
Tamanho.hasMany(ProdutoVariacao, { foreignKey: "tamanho_id" });

module.exports = ProdutoVariacao;
