const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Produto = require("./Produto");
const Cor = require("./Cor");

const ProdutoCor = sequelize.define("ProdutoCor", {
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
  quantidade: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    defaultValue: 0 
  },
  imagem_url: { 
    type: DataTypes.STRING, 
    allowNull: true 
  }
});

// Definição das associações
Produto.belongsToMany(Cor, { through: ProdutoCor, foreignKey: "produto_id" });
Cor.belongsToMany(Produto, { through: ProdutoCor, foreignKey: "cor_id" });

ProdutoCor.belongsTo(Produto, { foreignKey: "produto_id" });
Produto.hasMany(ProdutoCor, { foreignKey: "produto_id" });

ProdutoCor.belongsTo(Cor, { foreignKey: "cor_id" });
Cor.hasMany(ProdutoCor, { foreignKey: "cor_id" });

module.exports = ProdutoCor;
