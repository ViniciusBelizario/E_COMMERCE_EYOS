const axios = require("axios");

const ME_API_BASE = process.env.ME_API_BASE || "https://sandbox.melhorenvio.com.br/api/v2";
const ME_TOKEN    = process.env.ME_TOKEN;

const api = axios.create({
  baseURL: ME_API_BASE.replace(/\/+$/, ""),
  timeout: 20000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${ME_TOKEN}`,
    "User-Agent": "E_COMMERCE_EYOS/1.0"
  }
});

function parseAxiosError(err) {
  return {
    message: err?.response?.data?.message || err?.message || "Erro na chamada ao Melhor Envio",
    status: err?.response?.status,
    data: err?.response?.data,
    url: err?.config?.url,
    method: err?.config?.method
  };
}

function setToken(token) { api.defaults.headers.Authorization = `Bearer ${token}`; }

/* ---------- COTAÇÃO ---------- */
function buildQuotePayload({ toPostalCode, products }) {
  return {
    from: { postal_code: String(process.env.FROM_ZIPCODE || "") },
    to:   { postal_code: String(toPostalCode || "") },
    products: products.map(p => ({
      width:  Number(p.width  || 20),
      height: Number(p.height || 5),
      length: Number(p.length || 25),
      weight: Number(p.weight || 0.4),
      insurance_value: Number(p.insurance_value || 0),
      quantity: Number(p.quantity || 1)
    }))
  };
}

async function quote(payload) {
  try {
    const { data } = await api.post("/me/shipment/calculate", payload);
    return data;
  } catch (err) {
    const pe = parseAxiosError(err);
    console.error("[melhorEnvio.quote] erro:", pe);
    throw pe;
  }
}

/* ---------- CART (INSERIR FRETE) ---------- */
// Monta o payload EXATO do v2 (service/from/to/package/options/products)
function buildCartPayload({ serviceId, from, to, pkg, insuranceValue, platformTag, products }) {
  return {
    service: Number(serviceId),
    from: {
      name:  from.name,
      phone: from.phone || "",
      email: from.email || "",
      document: from.document || "",
      company_document: from.company_document || "",
      state_register: from.state_register || "ISENTO",
      postal_code: String(from.postal_code),
      address: from.address,
      number: String(from.number || ""),
      district: from.district || "",
      city: from.city,
      state_abbr: from.state_abbr,
      country_id: from.country_id || "BR"
    },
    to: {
      name:  to.name,
      phone: to.phone || "",
      email: to.email || "",
      document: to.document || "",
      postal_code: String(to.postal_code),
      address: to.address,
      number: String(to.number || ""),
      district: to.district || "",
      city: to.city,
      state_abbr: to.state_abbr,
      country_id: to.country_id || "BR"
    },
    package: {
      weight: Number(pkg.weight || 0.3),
      width:  Number(pkg.width  || 15),
      height: Number(pkg.height || 5),
      length: Number(pkg.length || 20)
    },
    options: {
      insurance_value: Number(insuranceValue || 0),
      receipt: false,
      own_hand: false,
      non_commercial: true,
      platform: "E_COMMERCE_EYOS",
      tags: platformTag ? [{ tag: String(platformTag) }] : []
    },
    products: (products || []).map(p => ({
      name: String(p.name || "Item"),
      quantity: Number(p.quantity || 1),
      unitary_value: Number(p.unitary_value || 0)
    }))
  };
}

async function addToCart(cartPayload) {
  try {
    const { data } = await api.post("/me/cart", cartPayload);
    return data;
  } catch (err) {
    const pe = parseAxiosError(err);
    console.error("[melhorEnvio.addToCart] erro:", pe);
    throw pe;
  }
}

/* ---------- CHECKOUT / LABELS / TRACK ---------- */
async function buyLabels(shipmentIds) {
  if (!Array.isArray(shipmentIds) || shipmentIds.length === 0) {
    throw new Error("buyLabels: informe ao menos um shipmentId.");
  }

  try {
    // ✅ Rota correta p/ seu ambiente:
    // POST /api/v2/me/shipment/checkout  { orders: [uuid, ...] }
    const { data } = await api.post("/me/shipment/checkout", { orders: shipmentIds });
    return data;
  } catch (err) {
    // Fallbacks comuns se a conta tiver variação:
    try {
      // às vezes aceitam "shipments"
      const { data } = await api.post("/me/shipment/checkout", { shipments: shipmentIds });
      return data;
    } catch (err2) {
      // ou rota antiga (raríssimo hoje)
      try {
        const { data } = await api.post("/me/checkout", { shipments: shipmentIds });
        return data;
      } catch (err3) {
        const pe = parseAxiosError(err3);
        console.error("[melhorEnvio.buyLabels] erro:", pe);
        throw pe;
      }
    }
  }
}

function _asArrayIds(input) {
  if (Array.isArray(input)) return input.filter(Boolean);
  if (input) return [input];
  throw new Error("Nenhum shipmentId informado.");
}

async function generateLabel(shipmentIds) {
  const orders = _asArrayIds(shipmentIds);
  try {
    // ✅ seu sandbox usa a rota por shipment
    // POST /me/shipment/generate { orders: [uuid, ...] }
    const { data } = await api.post("/me/shipment/generate", { orders });
    return data;
  } catch (err) {
    // fallback com "shipments" (algumas contas usam essa chave)
    try {
      const { data } = await api.post("/me/shipment/generate", { shipments: orders });
      return data;
    } catch (err2) {
      const pe2 = parseAxiosError(err2);
      console.error("[melhorEnvio.generateLabel] erro:", pe2);
      throw pe2;
    }
  }
}

async function printLabel(shipmentIds, mode = "private") {
  const orders = _asArrayIds(shipmentIds);
  try {
    // ✅ idem: POST /me/shipment/print { mode, orders: [uuid, ...] }
    const { data } = await api.post("/me/shipment/print", { mode, orders });
    return data;
  } catch (err) {
    // fallback com "shipments"
    try {
      const { data } = await api.post("/me/shipment/print", { mode, shipments: orders });
      return data;
    } catch (err2) {
      const pe2 = parseAxiosError(err2);
      console.error("[melhorEnvio.printLabel] erro:", pe2);
      throw pe2;
    }
  }
}

module.exports = {
  setToken,
  buildQuotePayload,
  quote,
  buildCartPayload,  // <-- GARANTA que está exportado
  addToCart,
  buyLabels,
  generateLabel,
  printLabel
};
