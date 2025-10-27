// src/models/index.js

// Importa apenas as definições dos models (sem associações internas)
const Usuario = require("./Usuario");
const Endereco = require("./Endereco");
const Marca = require("./Marca");
const Cor = require("./Cor");
const Tamanho = require("./Tamanho");
const Categoria = require("./Categoria");
const Produto = require("./Produto");
const ProdutoVariacao = require("./ProdutoVariacao");
const Carrinho = require("./Carrinho");
const CarrinhoItem = require("./CarrinhoItem");

// (Opcional) Pedido/PedidoItem, se já existirem no projeto
let Pedido, PedidoItem;
try {
  Pedido = require("./Pedido");
  PedidoItem = require("./PedidoItem");
} catch (_) {
  // Se ainda não existem, seguimos sem eles
}

/* ==============================
 *  Usuário 1:N Endereço
 * ============================== */
Usuario.hasMany(Endereco, {
  foreignKey: "usuario_id",
  onDelete: "CASCADE",
});
Endereco.belongsTo(Usuario, {
  foreignKey: "usuario_id",
  onDelete: "CASCADE",
});

/* ==============================
 *  Categoria/Marca 1:N Produto
 * ============================== */
Categoria.hasMany(Produto, {
  foreignKey: "categoria_id",
  onDelete: "CASCADE",
});
Produto.belongsTo(Categoria, {
  foreignKey: "categoria_id",
  onDelete: "CASCADE",
});

Marca.hasMany(Produto, {
  foreignKey: "marca_id",
  onDelete: "CASCADE",
});
Produto.belongsTo(Marca, {
  foreignKey: "marca_id",
  onDelete: "CASCADE",
});

/* ==============================
 *  Produto 1:N ProdutoVariacao
 *  + Variações referenciam Cor/Tamanho
 * ============================== */
Produto.hasMany(ProdutoVariacao, {
  foreignKey: "produto_id",
  onDelete: "CASCADE",
});
ProdutoVariacao.belongsTo(Produto, {
  foreignKey: "produto_id",
  onDelete: "CASCADE",
});

Cor.hasMany(ProdutoVariacao, {
  foreignKey: "cor_id",
  onDelete: "CASCADE",
});
ProdutoVariacao.belongsTo(Cor, {
  foreignKey: "cor_id",
  onDelete: "CASCADE",
});

Tamanho.hasMany(ProdutoVariacao, {
  foreignKey: "tamanho_id",
  onDelete: "CASCADE",
});
ProdutoVariacao.belongsTo(Tamanho, {
  foreignKey: "tamanho_id",
  onDelete: "CASCADE",
});

/* ==============================
 *  Carrinho e Itens
 * ============================== */
Carrinho.belongsTo(Usuario, {
  foreignKey: "usuario_id",
  onDelete: "CASCADE",
});
Usuario.hasMany(Carrinho, {
  foreignKey: "usuario_id",
  onDelete: "CASCADE",
});

Carrinho.hasMany(CarrinhoItem, {
  foreignKey: "carrinho_id",
  onDelete: "CASCADE",
});
CarrinhoItem.belongsTo(Carrinho, {
  foreignKey: "carrinho_id",
  onDelete: "CASCADE",
});

Produto.hasMany(CarrinhoItem, {
  foreignKey: "produto_id",
  onDelete: "CASCADE",
});
CarrinhoItem.belongsTo(Produto, {
  foreignKey: "produto_id",
  onDelete: "CASCADE",
});

// Cor/Tamanho no item do carrinho (opcionais)
// Mantém o item mesmo se a cor/tamanho forem removidos
Cor.hasMany(CarrinhoItem, {
  foreignKey: "cor_id",
  onDelete: "SET NULL",
});
CarrinhoItem.belongsTo(Cor, {
  foreignKey: "cor_id",
  onDelete: "SET NULL",
});

Tamanho.hasMany(CarrinhoItem, {
  foreignKey: "tamanho_id",
  onDelete: "SET NULL",
});
CarrinhoItem.belongsTo(Tamanho, {
  foreignKey: "tamanho_id",
  onDelete: "SET NULL",
});

/* ==============================
 *  Pedido e Itens (se existirem)
 * ============================== */
if (Pedido && PedidoItem) {
  Pedido.belongsTo(Usuario, {
    foreignKey: "usuario_id",
    onDelete: "CASCADE",
  });
  Usuario.hasMany(Pedido, {
    foreignKey: "usuario_id",
    onDelete: "CASCADE",
  });

  // Endereço de entrega opcional
  Pedido.belongsTo(Endereco, {
    foreignKey: "endereco_entrega_id",
    onDelete: "SET NULL",
  });
  Endereco.hasMany(Pedido, {
    foreignKey: "endereco_entrega_id",
    onDelete: "SET NULL",
  });

  Pedido.hasMany(PedidoItem, {
    foreignKey: "pedido_id",
    onDelete: "CASCADE",
  });
  PedidoItem.belongsTo(Pedido, {
    foreignKey: "pedido_id",
    onDelete: "CASCADE",
  });

  // Snapshots de produto/cor/tamanho podem virar NULL sem quebrar o histórico
  Produto.hasMany(PedidoItem, {
    foreignKey: "produto_id",
    onDelete: "SET NULL",
  });
  PedidoItem.belongsTo(Produto, {
    foreignKey: "produto_id",
    onDelete: "SET NULL",
  });

  Cor.hasMany(PedidoItem, {
    foreignKey: "cor_id",
    onDelete: "SET NULL",
  });
  PedidoItem.belongsTo(Cor, {
    foreignKey: "cor_id",
    onDelete: "SET NULL",
  });

  Tamanho.hasMany(PedidoItem, {
    foreignKey: "tamanho_id",
    onDelete: "SET NULL",
  });
  PedidoItem.belongsTo(Tamanho, {
    foreignKey: "tamanho_id",
    onDelete: "SET NULL",
  });
}

// Exporta todos os models
module.exports = {
  Usuario,
  Endereco,
  Marca,
  Cor,
  Tamanho,
  Categoria,
  Produto,
  ProdutoVariacao,
  Carrinho,
  CarrinhoItem,
  ...(Pedido ? { Pedido } : {}),
  ...(PedidoItem ? { PedidoItem } : {}),
};
