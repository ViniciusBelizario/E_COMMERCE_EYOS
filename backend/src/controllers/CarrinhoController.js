// src/controllers/CarrinhoController.js
const sequelize = require("../config/database");
const Carrinho = require("../models/Carrinho");
const CarrinhoItem = require("../models/CarrinhoItem");
const Produto = require("../models/Produto");
const ProdutoVariacao = require("../models/ProdutoVariacao");
const Cor = require("../models/Cor");
const Tamanho = require("../models/Tamanho");
const Pedido = require("../models/Pedido");
const PedidoItem = require("../models/PedidoItem");

// Obtém o carrinho do usuário (cria se não existir) e inclui os itens com Produto, Cor e Tamanho
const obterCarrinho = async (req, res) => {
  try {
    const usuario_id = req.user.id;
    let carrinho = await Carrinho.findOne({ where: { usuario_id, status: "aberto" } });

    if (!carrinho) {
      carrinho = await Carrinho.create({ usuario_id });
    }

    const itens = await CarrinhoItem.findAll({
      where: { carrinho_id: carrinho.id },
      include: [
        { model: Produto },
        { model: Cor },
        { model: Tamanho }
      ]
    });

    return res.json({ carrinho, itens });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao obter carrinho" });
  }
};

// Adiciona um item ao carrinho, validando variação e preenchendo snapshot de preço
const adicionarItem = async (req, res) => {
  try {
    const { produto_id, quantidade = 1, cor_id = null, tamanho_id = null } = req.body;
    const usuario_id = req.user.id;

    // Encontra ou cria o carrinho aberto do usuário
    let carrinho = await Carrinho.findOne({ where: { usuario_id, status: "aberto" } });
    if (!carrinho) {
      carrinho = await Carrinho.create({ usuario_id });
    }

    // Busca o produto e variação
    const produto = await Produto.findByPk(produto_id);
    if (!produto) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    // Validação de variação/estoque
    const variacao = await ProdutoVariacao.findOne({
      where: { produto_id, cor_id, tamanho_id },
    });

    if (!variacao) {
      return res.status(400).json({ error: "Variação do produto não encontrada (cor/tamanho)." });
    }
    if (quantidade < 1) {
      return res.status(400).json({ error: "Quantidade inválida." });
    }
    if (variacao.quantidade < quantidade) {
      return res.status(400).json({ error: "Estoque insuficiente para esta variação." });
    }

    // Cria o item do carrinho com snapshot do preço
    const item = await CarrinhoItem.create({
      carrinho_id: carrinho.id,
      produto_id,
      quantidade,
      cor_id,
      tamanho_id,
      preco_unitario: produto.preco,
    });

    return res.status(201).json(item);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao adicionar item ao carrinho" });
  }
};

// Atualiza somente a quantidade (mantém cor/tamanho)
const atualizarItem = async (req, res) => {
  try {
    const { quantidade } = req.body;
    const { id } = req.params;

    const item = await CarrinhoItem.findByPk(id);
    if (!item) return res.status(404).json({ error: "Item do carrinho não encontrado" });

    if (!Number.isInteger(quantidade) || quantidade < 1) {
      return res.status(400).json({ error: "Quantidade inválida." });
    }

    // valida estoque da variação
    const variacao = await ProdutoVariacao.findOne({
      where: {
        produto_id: item.produto_id,
        cor_id: item.cor_id,
        tamanho_id: item.tamanho_id,
      },
    });
    if (!variacao) {
      return res.status(400).json({ error: "Variação do produto não encontrada." });
    }
    if (variacao.quantidade < quantidade) {
      return res.status(400).json({ error: "Estoque insuficiente para esta variação." });
    }

    await item.update({ quantidade });
    return res.json({ message: "Quantidade atualizada", item });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao atualizar item do carrinho" });
  }
};

// Remove um item do carrinho
const removerItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await CarrinhoItem.findByPk(id);
    if (!item) return res.status(404).json({ error: "Item do carrinho não encontrado" });

    await item.destroy();
    return res.json({ message: "Item removido do carrinho" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao remover item do carrinho" });
  }
};

// Finaliza o carrinho: transação, baixa estoque, cria Pedido/PedidoItem e fecha carrinho
const finalizarCarrinho = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const usuario_id = req.user.id;
    const { endereco_entrega_id = null, metodo_pagamento = null } = req.body || {};

    const carrinho = await Carrinho.findOne({
      where: { usuario_id, status: "aberto" },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!carrinho) return res.status(404).json({ error: "Nenhum carrinho aberto encontrado" });

    const itens = await CarrinhoItem.findAll({
      where: { carrinho_id: carrinho.id },
      include: [{ model: Produto }, { model: Cor }, { model: Tamanho }],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!itens.length) return res.status(400).json({ error: "Carrinho vazio" });

    // Validar e abater estoque por variação (com lock pessimista)
    for (const item of itens) {
      const variacao = await ProdutoVariacao.findOne({
        where: {
          produto_id: item.produto_id,
          cor_id: item.cor_id,
          tamanho_id: item.tamanho_id,
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!variacao) throw new Error(`Variação do produto ${item.Produto?.nome || item.produto_id} não encontrada`);
      if (variacao.quantidade < item.quantidade) {
        throw new Error(`Estoque insuficiente para o produto ${item.Produto?.nome || item.produto_id}`);
      }
      await variacao.update(
        { quantidade: variacao.quantidade - item.quantidade },
        { transaction: t }
      );
    }

    // Total do pedido com snapshots
    const total = itens.reduce(
      (acc, it) => acc + Number(it.preco_unitario) * Number(it.quantidade),
      0
    );

    // Cria pedido
    const pedido = await Pedido.create(
      {
        usuario_id,
        total,
        status: "novo",
        endereco_entrega_id,
        metodo_pagamento,
      },
      { transaction: t }
    );

    // Cria itens do pedido (snapshots)
    for (const item of itens) {
      await PedidoItem.create(
        {
          pedido_id: pedido.id,
          produto_id: item.produto_id,
          produto_nome: item.Produto?.nome || `Produto ${item.produto_id}`,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          imagem_url: item.Produto?.imagem_url || null,
          cor_id: item.cor_id || null,
          tamanho_id: item.tamanho_id || null,
        },
        { transaction: t }
      );
    }

    // Fecha carrinho
    await carrinho.update({ status: "finalizado" }, { transaction: t });

    await t.commit();
    return res.json({ message: "Compra finalizada com sucesso", pedido_id: pedido.id, total });
  } catch (error) {
    await t.rollback();
    console.error(error);
    return res.status(500).json({ error: error.message || "Erro ao finalizar carrinho" });
  }
};

module.exports = {
  obterCarrinho,
  adicionarItem,
  atualizarItem,
  removerItem,
  finalizarCarrinho,
};
