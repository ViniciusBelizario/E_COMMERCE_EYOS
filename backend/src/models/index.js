// Importação dos models
const Usuario = require("./Usuario");
const Endereco = require("./Endereco");
const Marca = require("./Marca");
const Cor = require("./Cor");
const Tamanho = require("./Tamanho"); // Novo model de Tamanhos
const Categoria = require("./Categoria");
const Produto = require("./Produto");
const ProdutoVariacao = require("./ProdutoVariacao"); // Novo model de Variações
const Carrinho = require("./Carrinho");
const CarrinhoItem = require("./CarrinhoItem");

// 🔹 Usuário 1:N Endereço
Usuario.hasMany(Endereco, { foreignKey: "usuario_id", onDelete: "CASCADE" });
Endereco.belongsTo(Usuario, { foreignKey: "usuario_id" });

// 🔹 Categoria 1:N Produto
Categoria.hasMany(Produto, { foreignKey: "categoria_id", onDelete: "CASCADE" });
Produto.belongsTo(Categoria, { foreignKey: "categoria_id" });

// 🔹 Marca 1:N Produto
Marca.hasMany(Produto, { foreignKey: "marca_id", onDelete: "CASCADE" });
Produto.belongsTo(Marca, { foreignKey: "marca_id" });

// 🔹 Produto N:N Cor via ProdutoVariacao (intermediário)
Produto.belongsToMany(Cor, { through: ProdutoVariacao, foreignKey: "produto_id" });
Cor.belongsToMany(Produto, { through: ProdutoVariacao, foreignKey: "cor_id" });

// 🔹 Produto N:N Tamanho via ProdutoVariacao (intermediário)
Produto.belongsToMany(Tamanho, { through: ProdutoVariacao, foreignKey: "produto_id" });
Tamanho.belongsToMany(Produto, { through: ProdutoVariacao, foreignKey: "tamanho_id" });

// 🔹 Definição correta das associações de ProdutoVariacao
Produto.hasMany(ProdutoVariacao, { foreignKey: "produto_id", onDelete: "CASCADE" });
ProdutoVariacao.belongsTo(Produto, { foreignKey: "produto_id", onDelete: "CASCADE" });

Cor.hasMany(ProdutoVariacao, { foreignKey: "cor_id", onDelete: "CASCADE" });
ProdutoVariacao.belongsTo(Cor, { foreignKey: "cor_id", onDelete: "CASCADE" });

Tamanho.hasMany(ProdutoVariacao, { foreignKey: "tamanho_id", onDelete: "CASCADE" });
ProdutoVariacao.belongsTo(Tamanho, { foreignKey: "tamanho_id", onDelete: "CASCADE" });

// 🔹 Carrinho e Itens
Carrinho.belongsTo(Usuario, { foreignKey: "usuario_id", onDelete: "CASCADE" });
Usuario.hasMany(Carrinho, { foreignKey: "usuario_id", onDelete: "CASCADE" });

CarrinhoItem.belongsTo(Carrinho, { foreignKey: "carrinho_id", onDelete: "CASCADE" });
Carrinho.hasMany(CarrinhoItem, { foreignKey: "carrinho_id", onDelete: "CASCADE" });

CarrinhoItem.belongsTo(Produto, { foreignKey: "produto_id", onDelete: "CASCADE" });
Produto.hasMany(CarrinhoItem, { foreignKey: "produto_id", onDelete: "CASCADE" });

// 🔹 Exportação dos Models
module.exports = {
  Usuario,
  Endereco,
  Marca,
  Cor,
  Tamanho, // Adicionado o novo model de Tamanhos
  Categoria,
  Produto,
  ProdutoVariacao, // Atualizado para o novo model
  Carrinho,
  CarrinhoItem,
};
