// src/controllers/CarrinhoController.js
const sequelize = require("../config/database");
const { literal } = require("sequelize");
const Carrinho = require("../models/Carrinho");
const CarrinhoItem = require("../models/CarrinhoItem");
const Produto = require("../models/Produto");
const ProdutoVariacao = require("../models/ProdutoVariacao");
const Cor = require("../models/Cor");
const Tamanho = require("../models/Tamanho");

async function getOrCreateCart(userId, t = null) {
  let carrinho = await Carrinho.findOne({
    where: { usuario_id: userId },
    transaction: t,
    lock: t ? t.LOCK.UPDATE : undefined,
  });
  if (!carrinho) {
    // se seu model tiver status/total, pode iniciar aqui: { usuario_id: userId, status: "aberto" }
    carrinho = await Carrinho.create({ usuario_id: userId }, { transaction: t });
  }
  return carrinho;
}

// GET /carrinho
exports.verCarrinho = async (req, res) => {
  try {
    const userId = req.user.id;
    const carrinho = await getOrCreateCart(userId);

    const itens = await CarrinhoItem.findAll({
      where: { carrinho_id: carrinho.id },
      include: [
        { model: Produto, attributes: ["id", "nome", "preco", "imagem_url"] },
        { model: Cor, attributes: ["id", "nome", "codigo_hex"] },
        { model: Tamanho, attributes: ["id", "nome"] },
      ],
      order: [["id", "DESC"]],
    });

    const resumo = itens.map((i) => ({
      id: i.id,
      produto_id: i.produto_id,
      nome: i.Produto?.nome,
      preco_unitario: Number(i.preco_unitario), // snapshot do preço
      quantidade: Number(i.quantidade),
      subtotal: Number(i.preco_unitario) * Number(i.quantidade),
      cor: i.Cor,
      tamanho: i.Tamanho,
      imagem: i.Produto?.imagem_url,
    }));

    const subtotal = resumo.reduce((acc, r) => acc + r.subtotal, 0);
    const shipping_price = carrinho.shipping_price ? Number(carrinho.shipping_price) : 0;
    const total_com_frete = Number((subtotal + shipping_price).toFixed(2));

    return res.json({
      carrinho_id: carrinho.id,
      shipping_service_id: carrinho.shipping_service_id || null,
      shipping_price,
      itens: resumo,
      subtotal,
      total_com_frete
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro ao carregar carrinho." });
  }
};

// POST /carrinho/itens
// body: { produto_id, cor_id, tamanho_id, quantidade }
exports.adicionarItem = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { produto_id, cor_id, tamanho_id, quantidade } = req.body || {};
    const qtd = parseInt(quantidade, 10);

    if (!produto_id || !cor_id || !tamanho_id || !qtd || qtd <= 0) {
      await t.rollback();
      return res
        .status(400)
        .json({ error: "Campos obrigatórios: produto_id, cor_id, tamanho_id, quantidade>0." });
    }

    // 1) Confere existência da variação
    const variacao = await ProdutoVariacao.findOne({
      where: { produto_id, cor_id, tamanho_id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!variacao) {
      await t.rollback();
      return res.status(404).json({ error: "Variação (produto/cor/tamanho) não encontrada." });
    }

    // 2) Obtém snapshot de preço do produto
    const produto = await Produto.findByPk(produto_id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!produto) {
      await t.rollback();
      return res.status(404).json({ error: "Produto não encontrado." });
    }
    const precoAtual = Number(produto.preco);

    // 3) Garante carrinho do usuário
    const carrinho = await getOrCreateCart(userId, t);

    // 4) Se item idêntico já existe, somar quantidade e garantir preco_unitario
    const existente = await CarrinhoItem.findOne({
      where: {
        carrinho_id: carrinho.id,
        produto_id,
        cor_id,
        tamanho_id,
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (existente) {
      const patch = { quantidade: literal(`quantidade + ${qtd}`) };
      if (existente.preco_unitario == null) patch.preco_unitario = precoAtual;
      await existente.update(patch, { transaction: t });
    } else {
      await CarrinhoItem.create(
        {
          carrinho_id: carrinho.id,
          produto_id,
          cor_id,
          tamanho_id,
          quantidade: qtd,
          preco_unitario: precoAtual, // snapshot
        },
        { transaction: t }
      );
    }

    await t.commit();
    return exports.verCarrinho(req, res);
  } catch (e) {
    await t.rollback();
    console.error(e);
    return res.status(500).json({ error: "Erro ao adicionar item ao carrinho." });
  }
};

// PUT /carrinho/itens/:id  body: { quantidade }
exports.atualizarItem = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantidade } = req.body || {};
    const qtd = parseInt(quantidade, 10);

    const carrinho = await getOrCreateCart(userId, t);
    const item = await CarrinhoItem.findOne({
      where: { id, carrinho_id: carrinho.id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!item) {
      await t.rollback();
      return res.status(404).json({ error: "Item não encontrado no carrinho." });
    }

    if (!qtd || qtd <= 0) {
      await item.destroy({ transaction: t });
    } else {
      await item.update({ quantidade: qtd }, { transaction: t });
    }

    await t.commit();
    return exports.verCarrinho(req, res);
  } catch (e) {
    await t.rollback();
    console.error(e);
    return res.status(500).json({ error: "Erro ao atualizar item do carrinho." });
  }
};

// DELETE /carrinho/itens/:id
exports.removerItem = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const carrinho = await getOrCreateCart(userId, t);
    const item = await CarrinhoItem.findOne({
      where: { id, carrinho_id: carrinho.id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!item) {
      await t.rollback();
      return res.status(404).json({ error: "Item não encontrado no carrinho." });
    }

    await item.destroy({ transaction: t });
    await t.commit();
    return exports.verCarrinho(req, res);
  } catch (e) {
    await t.rollback();
    console.error(e);
    return res.status(500).json({ error: "Erro ao remover item do carrinho." });
  }
};

// DELETE /carrinho
exports.esvaziarCarrinho = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const carrinho = await getOrCreateCart(userId, t);

    await CarrinhoItem.destroy({ where: { carrinho_id: carrinho.id }, transaction: t });

    // opcional: também limpar frete escolhido
    await carrinho.update(
      { shipping_service_id: null, shipping_price: 0, shipping_quote_json: null },
      { transaction: t }
    );

    await t.commit();
    return res.json({ message: "Carrinho esvaziado." });
  } catch (e) {
    await t.rollback();
    console.error(e);
    return res.status(500).json({ error: "Erro ao esvaziar carrinho." });
  }
};

// POST /carrinho/frete
// body: { service_id }
exports.escolherFrete = async (req, res) => {
  try {
    const userId = req.user.id;
    const { service_id } = req.body || {};

    if (!service_id) {
      return res.status(400).json({
        error: "BAD_REQUEST",
        message: "service_id é obrigatório (ex.: { \"service_id\": 2 })."
      });
    }

    const carrinho = await getOrCreateCart(userId);
    const temItens = await CarrinhoItem.count({ where: { carrinho_id: carrinho.id } });
    if (!temItens) {
      return res.status(409).json({ error: "CARRINHO_VAZIO" });
    }

    // precisa ter feito a cotação antes para ter cache
    if (!carrinho.shipping_quote_json) {
      return res.status(428).json({ // 428 Precondition Required
        error: "COTACAO_NECESSARIA",
        message: "Faça a cotação de frete antes de escolher (POST /fretes/cotacao)."
      });
    }

    // parse do cache (salvo pelo FreteController)
    let cotacoes;
    try {
      cotacoes = JSON.parse(carrinho.shipping_quote_json);
    } catch (e) {
      console.error("shipping_quote_json inválido no carrinho:", e);
      return res.status(500).json({
        error: "CACHE_COTACAO_INVALIDO",
        message: "O cache de cotação está inválido. Refazer a cotação."
      });
    }

    // cada item do cache deve ter { service_id, price, ... }
    const op = Array.isArray(cotacoes)
      ? cotacoes.find(x => Number(x.service_id) === Number(service_id))
      : null;

    if (!op) {
      return res.status(404).json({
        error: "SERVICO_NAO_ENCONTRADO",
        message: `Serviço ${service_id} não está disponível na última cotação.`
      });
    }

    const price = Number(op.price ?? 0);

    await carrinho.update({
      shipping_service_id: Number(service_id),
      shipping_price: price
    });

    return res.json({
      ok: true,
      carrinho_id: carrinho.id,
      shipping_service_id: Number(service_id),
      shipping_price: price
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "ERRO_ESCOLHER_FRETE" });
  }
};
