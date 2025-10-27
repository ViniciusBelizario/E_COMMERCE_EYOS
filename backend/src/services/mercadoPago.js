const axios = require("axios");

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN; // coloque no .env
const MP_API_BASE = process.env.MP_API_BASE || "https://api.mercadopago.com";

const mp = axios.create({
  baseURL: MP_API_BASE.replace(/\/+$/, ""),
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
  },
});

function parseAxiosError(err) {
  return {
    message: err?.response?.data?.message || err?.message || "Erro na chamada ao Mercado Pago",
    status: err?.response?.status,
    data: err?.response?.data,
    url: err?.config?.url,
    method: err?.config?.method,
  };
}

async function createPreference(payload) {
  try {
    const { data } = await mp.post("/checkout/preferences", payload);
    return data;
  } catch (err) {
    const pe = parseAxiosError(err);
    console.error("[mp.createPreference] erro:", pe);
    throw pe;
  }
}

async function getPayment(paymentId) {
  try {
    const { data } = await mp.get(`/v1/payments/${paymentId}`);
    return data;
  } catch (err) {
    const pe = parseAxiosError(err);
    console.error("[mp.getPayment] erro:", pe);
    throw pe;
  }
}

module.exports = { createPreference, getPayment };
