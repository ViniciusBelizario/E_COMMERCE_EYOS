// Armazenamento em memória (POC)
const db = {
  marcas: [],
  categorias: [],
  cores: [],
  tamanhos: [],
  produtos: [],      // {id, nome, sku, idMarca, idCategoria, descricao}
  variacoes: []      // {id, produtoId, cor, tamanho, preco, estoque}
};

let seq = 1;
const nextId = () => seq++;

// CRUD genérico
function list(entity) {
  return db[entity] || [];
}
function create(entity, data) {
  const item = { id: nextId(), ...data };
  db[entity].push(item);
  return item;
}
function update(entity, id, data) {
  const arr = db[entity];
  const idx = arr.findIndex(i => i.id === Number(id));
  if (idx === -1) return null;
  arr[idx] = { ...arr[idx], ...data };
  return arr[idx];
}
function remove(entity, id) {
  const arr = db[entity];
  const idx = arr.findIndex(i => i.id === Number(id));
  if (idx === -1) return false;
  arr.splice(idx, 1);
  return true;
}
function findById(entity, id) {
  return (db[entity] || []).find(i => i.id === Number(id));
}

module.exports = {
  db,
  list,
  create,
  update,
  remove,
  findById
};
