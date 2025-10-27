// src/controllers/PedidoController.js
const sequelize = require("../config/database");
const { Op, literal } = require("sequelize");
const Pedido = require("../models/Pedido");
const PedidoItem = require("../models/PedidoItem");
const Carrinho = require("../models/Carrinho");
const CarrinhoItem = require("../models/CarrinhoItem");
const Produto = require("../models/Produto");
const ProdutoVariacao = require("../models/ProdutoVariacao");
const Cor = require("../models/Cor");
const Tamanho = require("../models/Tamanho");
const Endereco = require("../models/Endereco");
const Usuario = require("../models/Usuario");            // <- IMPORTANTE
const MelhorEnvio = require("../services/melhorEnvio");

// helper simples
const onlyDigits = (v) => String(v || "").replace(/\D/g, "");

// Recalcula estoque total do produto (soma das variações)
async function recalcEstoqueProduto(produtoId, t) {
  const total = await ProdutoVariacao.sum("quantidade", {
    where: { produto_id: produtoId },
    transaction: t,
  });
  await Produto.update(
    { estoque: total || 0 },
    { where: { id: produtoId }, transaction: t }
  );
}

// POST /pedidos/checkout  { endereco_id?, use_default_address?, observacoes? }
exports.checkout = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { endereco_id, use_default_address = false, observacoes } = req.body || {};

    // 0) Endereço obrigatório
    if (!endereco_id && !use_default_address) {
      return res.status(422).json({
        error: "ENDERECO_OBRIGATORIO",
        message: "Informe 'endereco_id' ou use 'use_default_address: true' para finalizar a compra.",
      });
    }

    // 0.1) Buscar usuário para obter CPF/telefones/emails atualizados
    const usuario = await Usuario.findByPk(userId, { transaction: t });
    if (!usuario) {
      await t.rollback();
      return res.status(401).json({ error: "USUARIO_INEXISTENTE", message: "Usuário não encontrado." });
    }
    const cpfCliente = onlyDigits(usuario.cpf || "");
    if (!cpfCliente || cpfCliente.length !== 11) {
      await t.rollback();
      return res.status(422).json({
        error: "CPF_OBRIGATORIO",
        message: "CPF do cliente ausente ou inválido. Atualize seu cadastro para finalizar a compra."
      });
    }

    // 1) Carrinho + itens
    const carrinho = await Carrinho.findOne({
      where: { usuario_id: userId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!carrinho) {
      await t.rollback();
      return res.status(409).json({ error: "CARRINHO_VAZIO", message: "Carrinho não encontrado." });
    }

    const itens = await CarrinhoItem.findAll({
      where: { carrinho_id: carrinho.id },
      include: [{ model: Produto }, { model: Cor }, { model: Tamanho }],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!itens.length) {
      await t.rollback();
      return res.status(409).json({ error: "CARRINHO_VAZIO", message: "Seu carrinho está vazio." });
    }

    // 1.1) Frete obrigatório (após POST /carrinho/frete)
    if (!carrinho.shipping_service_id || carrinho.shipping_price == null) {
      await t.rollback();
      return res.status(422).json({
        error: "FRETE_OBRIGATORIO",
        message: "Selecione um frete antes de finalizar a compra.",
      });
    }
    const shippingServiceId = Number(carrinho.shipping_service_id);
    const shippingPrice = Number(carrinho.shipping_price);

    // 2) Endereço (obrigatório)
    let enderecoEntrega = null;
    if (use_default_address) {
      enderecoEntrega = await Endereco.findOne({
        where: { usuario_id: userId, is_default: true },
        transaction: t,
      });
      if (!enderecoEntrega) {
        await t.rollback();
        return res.status(422).json({
          error: "ENDERECO_OBRIGATORIO",
          message: "Defina um endereço padrão ou informe 'endereco_id'.",
        });
      }
    } else {
      enderecoEntrega = await Endereco.findOne({
        where: { id: endereco_id, usuario_id: userId },
        transaction: t,
      });
      if (!enderecoEntrega) {
        await t.rollback();
        return res.status(404).json({
          error: "ENDERECO_INEXISTENTE",
          message: "Endereço não encontrado para este usuário.",
        });
      }
    }

    // 3) Valida estoque e calcula subtotal
    let subtotal = 0;
    const afetadosPorProduto = new Set();

    for (const it of itens) {
      const variacao = await ProdutoVariacao.findOne({
        where: {
          produto_id: it.produto_id,
          cor_id: it.cor_id,
          tamanho_id: it.tamanho_id,
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!variacao) {
        await t.rollback();
        return res.status(400).json({
          error: "VARIACAO_INDISPONIVEL",
          message: `Variação indisponível (produto ${it.produto_id}, cor ${it.cor_id}, tamanho ${it.tamanho_id}).`,
        });
      }

      if (Number(variacao.quantidade) < Number(it.quantidade)) {
        await t.rollback();
        return res.status(400).json({
          error: "ESTOQUE_INSUFICIENTE",
          message: `Estoque insuficiente para ${
            it.Produto?.nome || "produto"
          } (${it.quantidade} solicitado, ${variacao.quantidade} disponível).`,
        });
      }

      subtotal += Number(it.Produto?.preco ?? 0) * Number(it.quantidade);
    }

    // 3.1) Total com frete
    const total = Number((subtotal + shippingPrice).toFixed(2));

    // 4) Cria pedido (a etiqueta NÃO é comprada aqui)
    const pedido = await Pedido.create(
      {
        usuario_id: userId,
        endereco_entrega_id: enderecoEntrega.id,
        total,
        status: "aguardando_pagamento",
        observacoes: observacoes || null,

        // frete/ME
        shipping_provider: "melhor_envio",
        shipping_service_id: shippingServiceId,
        shipping_price: shippingPrice,
        shipping_status: "pendente",
      },
      { transaction: t }
    );

    // 5) Baixa estoque e cria itens (snapshot)
    for (const it of itens) {
      const [linhasAfetadas] = await ProdutoVariacao.update(
        { quantidade: literal(`quantidade - ${Number(it.quantidade)}`) },
        {
          where: {
            produto_id: it.produto_id,
            cor_id: it.cor_id,
            tamanho_id: it.tamanho_id,
            quantidade: { [Op.gte]: Number(it.quantidade) },
          },
          transaction: t,
          lock: t.LOCK.UPDATE,
        }
      );

      if (!linhasAfetadas) {
        await t.rollback();
        return res.status(400).json({
          error: "ESTOQUE_INSUFICIENTE",
          message: `Falha ao reservar estoque para ${it.Produto?.nome || "produto"}.`,
        });
      }

      afetadosPorProduto.add(it.produto_id);

      await PedidoItem.create(
        {
          pedido_id: pedido.id,
          produto_id: it.produto_id,
          cor_id: it.cor_id,
          tamanho_id: it.tamanho_id,
          quantidade: it.quantidade,
          preco_unitario: Number(it.Produto?.preco ?? 0),

          nome_produto: it.Produto?.nome || "",
          imagem_produto: it.Produto?.imagem_url || null,
          nome_cor: it.Cor?.nome || null,
          codigo_hex_cor: it.Cor?.codigo_hex || null,
          nome_tamanho: it.Tamanho?.nome || null,
        },
        { transaction: t }
      );
    }

    // 6) Recalcula estoque total dos produtos afetados
    for (const produtoId of afetadosPorProduto) {
      await recalcEstoqueProduto(produtoId, t);
    }

    // 7) Inserir frete no carrinho do Melhor Envio (sem comprar)
    try {
      // REMETENTE (pegue do .env)
      const fromDocCPF  = onlyDigits(process.env.FROM_DOCUMENT || "");
const fromDocCNPJ = onlyDigits(process.env.FROM_COMPANY_DOCUMENT || "");

const from = {
  name:  process.env.FROM_NAME  || "Loja Teste",
  phone: process.env.FROM_PHONE || "11999999999",
  email: process.env.FROM_EMAIL || "teste@loja.com",

  // ✅ regra: se houver CNPJ, não mande CPF
  document: fromDocCNPJ ? "" : fromDocCPF,
  company_document: fromDocCNPJ || "",

  state_register: process.env.FROM_STATE_REGISTER || "ISENTO",
  postal_code: onlyDigits(process.env.FROM_ZIPCODE || "01311000"),
  address: process.env.FROM_ADDRESS || "Av. Paulista",
  number: process.env.FROM_NUMBER || "1000",
  district: process.env.FROM_DISTRICT || "Bela Vista",
  city: process.env.FROM_CITY || "São Paulo",
  state_abbr: process.env.FROM_STATE || "SP",
  country_id: "BR"
};

      // DESTINATÁRIO (pega do endereço do usuário + CPF do usuário)
      const to = {
        name:  usuario.nome || "Cliente",
        phone: usuario.telefone || "",
        email: usuario.email || "",
        document: cpfCliente, // <- agora garantido
        postal_code: onlyDigits(enderecoEntrega.cep),
        address: enderecoEntrega.rua || enderecoEntrega.logradouro,
        number: String(enderecoEntrega.numero || ""),
        district: enderecoEntrega.bairro || "",
        city: enderecoEntrega.cidade,
        state_abbr: enderecoEntrega.estado,
        country_id: "BR"
      };

      // Defesa extra para evitar 422 do ME
      if (!to.address) {
        await t.rollback();
        return res.status(422).json({
          error: "ENDERECO_INCOMPLETO",
          message: "Endereço sem logradouro/rua. Preencha o campo 'rua' (ou 'logradouro') no endereço do cliente."
        });
      }
      if (!to.postal_code) {
        await t.rollback();
        return res.status(422).json({
          error: "ENDERECO_INCOMPLETO",
          message: "CEP do destinatário ausente. Preencha 'cep' no endereço do cliente."
        });
      }

      // PACKAGE — 1 pacote consolidado
      const pkg = {
        weight: itens.reduce((acc, i) => acc + Number(i.peso || 0.4) * Number(i.quantidade), 0) || 0.3,
        width:  15,
        height: 5,
        length: 20
      };

      // DECLARAÇÃO DE CONTEÚDO (products)
      const productsForDoc = itens.map(i => ({
        name: i.Produto?.nome || "Item",
        quantity: Number(i.quantidade || 1),
        unitary_value: Number(i.Produto?.preco || 0)
      }));

      const cartPayload = MelhorEnvio.buildCartPayload({
        serviceId: shippingServiceId,
        from,
        to,
        pkg,
        insuranceValue: subtotal,
        platformTag: `PED-${pedido.id}`,
        products: productsForDoc
      });

      const cartResp = await MelhorEnvio.addToCart(cartPayload);

      // pega o id retornado pelo ME
      let meId = null;
      if (Array.isArray(cartResp)) {
        meId = cartResp[0]?.id || cartResp[0]?.shipment_id || cartResp[0]?.shipment?.id || null;
      } else {
        meId = cartResp?.id || cartResp?.shipment_id || cartResp?.shipment?.id || null;
      }

      await pedido.update(
        { me_shipment_id: meId, shipping_raw: JSON.stringify({ cart_insert: cartResp }) },
        { transaction: t }
      );
    } catch (meErr) {
      const details = meErr?.data || meErr?.response?.data || meErr?.message || "Erro ao inserir no carrinho do ME";
      console.error("[ME cart] error:", details);
      await pedido.update(
        { shipping_raw: JSON.stringify({ cart_error: details }) },
        { transaction: t }
      );
    }

    // 8) Limpa itens do carrinho e limpa frete do carrinho (para não reaproveitar cotação)
    await CarrinhoItem.destroy({ where: { carrinho_id: carrinho.id }, transaction: t });
    await carrinho.update(
      { shipping_service_id: null, shipping_price: 0, shipping_quote_json: null },
      { transaction: t }
    );

    await t.commit();

    // 9) Retorna pedido com itens
    const resposta = await Pedido.findByPk(pedido.id, {
      include: [{ model: PedidoItem }],
    });

    const plain = resposta.toJSON();
    plain.total = Number(plain.total);
    plain.shipping_price = Number(plain.shipping_price);
    if (Array.isArray(plain.PedidoItems)) {
      plain.PedidoItems = plain.PedidoItems.map((pi) => ({
        ...pi,
        preco_unitario: Number(pi.preco_unitario),
      }));
    }

    return res.status(201).json(plain);
  } catch (e) {
    await t.rollback();
    console.error(e);
    return res.status(500).json({ error: "Erro no checkout." });
  }
};

// GET /pedidos
exports.listarMeusPedidos = async (req, res) => {
  try {
    const userId = req.user.id;
    const pedidos = await Pedido.findAll({
      where: { usuario_id: userId },
      order: [["id", "DESC"]],
      include: [{ model: PedidoItem }],
    });

    const out = pedidos.map((p) => {
      const j = p.toJSON();
      j.total = Number(j.total);
      j.shipping_price = j.shipping_price != null ? Number(j.shipping_price) : j.shipping_price;
      if (Array.isArray(j.PedidoItems)) {
        j.PedidoItems = j.PedidoItems.map((pi) => ({
          ...pi,
          preco_unitario: Number(pi.preco_unitario),
        }));
      }
      return j;
    });

    return res.json(out);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro ao listar pedidos." });
  }
};

// GET /pedidos/:id
exports.detalharPedido = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const pedido = await Pedido.findOne({
      where: { id, usuario_id: userId },
      include: [{ model: PedidoItem }],
    });
    if (!pedido) return res.status(404).json({ error: "Pedido não encontrado." });

    const j = pedido.toJSON();
    j.total = Number(j.total);
    j.shipping_price = j.shipping_price != null ? Number(j.shipping_price) : j.shipping_price;
    if (Array.isArray(j.PedidoItems)) {
      j.PedidoItems = j.PedidoItems.map((pi) => ({
        ...pi,
        preco_unitario: Number(pi.preco_unitario),
      }));
    }

    return res.json(j);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro ao buscar pedido." });
  }
};
