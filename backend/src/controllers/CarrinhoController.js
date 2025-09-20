const Carrinho = require("../models/Carrinho");
const CarrinhoItem = require("../models/CarrinhoItem");
const Produto = require("../models/Produto");
const Cor = require("../models/Cor");         // Certifique-se de importar o modelo Cor
const Tamanho = require("../models/Tamanho");   // Certifique-se de importar o modelo Tamanho

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

// Adiciona um item ao carrinho, agora com produto, cor, tamanho e quantidade
const adicionarItem = async (req, res) => {
  try {
    const { produto_id, quantidade, cor_id, tamanho_id } = req.body;
    const usuario_id = req.user.id;

    // Encontra ou cria o carrinho aberto do usuário
    let carrinho = await Carrinho.findOne({ where: { usuario_id, status: "aberto" } });
    if (!carrinho) {
      carrinho = await Carrinho.create({ usuario_id });
    }

    // Cria o item do carrinho incluindo cor e tamanho
    const item = await CarrinhoItem.create({
      carrinho_id: carrinho.id,
      produto_id,
      quantidade,
      cor_id,
      tamanho_id
    });

    return res.status(201).json(item);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao adicionar item ao carrinho" });
  }
};

// Atualiza a quantidade de um item do carrinho (mantém os campos de cor e tamanho inalterados)
const atualizarItem = async (req, res) => {
  try {
    const { quantidade } = req.body;
    const { id } = req.params;

    const item = await CarrinhoItem.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: "Item do carrinho não encontrado" });
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
    if (!item) {
      return res.status(404).json({ error: "Item do carrinho não encontrado" });
    }

    await item.destroy();
    return res.json({ message: "Item removido do carrinho" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao remover item do carrinho" });
  }
};

// Finaliza o carrinho do usuário
const finalizarCarrinho = async (req, res) => {
  try {
    const usuario_id = req.user.id;
    let carrinho = await Carrinho.findOne({ where: { usuario_id, status: "aberto" } });

    if (!carrinho) {
      return res.status(404).json({ error: "Nenhum carrinho aberto encontrado" });
    }

    await carrinho.update({ status: "finalizado" });
    return res.json({ message: "Carrinho finalizado com sucesso" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao finalizar carrinho" });
  }
};

module.exports = {
  obterCarrinho,
  adicionarItem,
  atualizarItem,
  removerItem,
  finalizarCarrinho
};
