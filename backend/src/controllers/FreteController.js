// src/controllers/FreteController.js
const Carrinho = require("../models/Carrinho");
const CarrinhoItem = require("../models/CarrinhoItem");
const Endereco = require("../models/Endereco");
const MelhorEnvio = require("../services/melhorEnvio");

const SERVICES_ALLOWED = [1, 2];         // <-- só PAC/SEDEX (exemplo)
const SERVICES_PARAM = "1,2";             // <-- enviar para a API (quando suportado)

exports.cotar = async (req, res) => {
  try {
    const userId = req.user.id;
    const { address_id } = req.body || {};

    if (!address_id) {
      return res.status(400).json({ error: "BAD_REQUEST", message: "address_id é obrigatório." });
    }

    const address = await Endereco.findOne({ where: { id: address_id, usuario_id: userId } });
    if (!address) {
      return res.status(404).json({ error: "ENDERECO_INEXISTENTE", message: "Endereço não encontrado." });
    }

    const carrinho = await Carrinho.findOne({ where: { usuario_id: userId, status: "aberto" } });
    if (!carrinho) return res.status(409).json({ error: "CARRINHO_VAZIO" });

    const itens = await CarrinhoItem.findAll({ where: { carrinho_id: carrinho.id } });
    if (!itens.length) return res.status(409).json({ error: "CARRINHO_VAZIO" });

    // monta products a partir do carrinho
    const products = itens.map(i => ({
      width: Number(i.largura || 20),
      height: Number(i.altura || 5),
      length: Number(i.comprimento || 25),
      weight: Number(i.peso || 0.4),
      insurance_value: Number(i.preco_unitario) * Number(i.quantidade),
      quantity: Number(i.quantidade)
    }));

    // payload base
    const payload = MelhorEnvio.buildQuotePayload({
      toPostalCode: address.cep,
      products
    });

    // alguns ambientes do ME aceitam restringir serviços pelo campo "services"
    // enviamos isso e, por segurança, ainda filtramos depois
    payload.services = SERVICES_PARAM;

    const raw = await MelhorEnvio.quote(payload);

    // normalizar + FILTRAR só os services 1 e 2
    const list = Array.isArray(raw) ? raw : (raw?.results || []);
    const opcoes = list
      .filter(op => SERVICES_ALLOWED.includes(Number(op.service_id ?? op.service ?? op.id)))
      .map(op => ({
        service_id: Number(op.service_id ?? op.service ?? op.id),
        name: op.name || op.service_name || "Serviço",
        price: Number(op.price ?? op.cost ?? op.price_total ?? 0),
        delivery_time: op.delivery_time || op.delivery || null,
        raw: op
      }));

    // cache no carrinho (opcional)
    await carrinho.update({ shipping_quote_json: JSON.stringify(opcoes) });

    return res.json(opcoes);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "ERRO_COTACAO_FRETE" });
  }
};
