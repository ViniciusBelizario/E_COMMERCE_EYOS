// public/css/js/api.js
const API_BASE = "http://localhost:3001";

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// JSON (GET/POST/PUT/DELETE)
export async function apiJson(url, { method = "GET", body } = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.status === 204 ? null : res.json();
}

// multipart (produtos / produto-variacoes com upload)
export async function apiMultipart(url, formData, { method = "POST" } = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers: { ...authHeader() }, // NÃO setar Content-Type manualmente!
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
