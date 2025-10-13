// utils/api.js
const axios = require('axios');

const API_BASE = process.env.API_BASE || 'http://localhost:3001';

function makeApi(req) {
  const token = req.cookies?.token;
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const instance = axios.create({
    baseURL: API_BASE,
    headers,
    timeout: 10000
  });

  return instance;
}

function apiError(err) {
  const status = err?.response?.status;
  const data = err?.response?.data;
  const msg   = data?.message || data?.error || err.message || 'Erro na API';
  return { status, data, msg };
}

module.exports = { makeApi, apiError, API_BASE };
