// models/Carrinho.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Usuario = require("./Usuario");

const Carrinho = sequelize.define("Carrinho", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  status: {
    type: DataTypes.ENUM("aberto", "finalizado"),
    defaultValue: "aberto",
  },
});

// Associação com o usuário:
// A tabela `Carrinho` terá uma coluna `usuario_id` para saber de quem é o carrinho
Carrinho.belongsTo(Usuario, { foreignKey: "usuario_id" });
Usuario.hasMany(Carrinho, { foreignKey: "usuario_id" });

module.exports = Carrinho;
