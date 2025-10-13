const express = require('express');
const { makeApi, apiError } = require('../utils/api');

const router = express.Router();

/* helpers */
async function safeGet(api, url, cfg = {}, fallback = []) {
  try {
    const { data } = await api.get(url, cfg);
    return Array.isArray(data) ? data : (data?.data || data || fallback);
  } catch (err) {
    console.error('GET error', url, apiError(err));
    return fallback;
  }
}

/* =========================
   Listagens simples
   ========================= */
router.get('/marcas', async (req, res) => {
  const api = makeApi(req);
  const items = await safeGet(api, '/marcas');
  res.render('produto/marcas', { title: 'Produto (API) • Marcas', items });
});

router.get('/categorias', async (req, res) => {
  const api = makeApi(req);
  const items = await safeGet(api, '/categorias');
  res.render('produto/categorias', { title: 'Produto (API) • Categorias', items });
});

router.get('/tamanhos', async (req, res) => {
  const api = makeApi(req);
  const items = await safeGet(api, '/tamanhos');
  res.render('produto/tamanhos', { title: 'Produto (API) • Tamanhos', items });
});

router.get('/cores', async (req, res) => {
  const api = makeApi(req);
  const items = await safeGet(api, '/cores');
  res.render('produto/cores', { title: 'Produto (API) • Cores', items });
});

router.get('/produtos', async (req, res) => {
  const api = makeApi(req);
  const [produtos, marcas, categorias, variacoes] = await Promise.all([
    safeGet(api, '/produtos'),
    safeGet(api, '/marcas'),
    safeGet(api, '/categorias'),
    safeGet(api, '/produto-variacoes', [])
  ]);

  const marcaNomeById = new Map(marcas.map(m => [m.id, m.nome]));
  const catNomeById   = new Map(categorias.map(c => [c.id, c.nome]));

  const varPorProd = new Map(); // produto_id -> { estoqueTotal, menorPreco }
  (variacoes || []).forEach(v => {
    const pid = v.produto_id;
    const est = Number(v.estoque ?? v.quantidade ?? 0);
    const p   = Number(v.preco ?? NaN);

    if (!varPorProd.has(pid)) varPorProd.set(pid, { estoqueTotal: 0, menorPreco: Number.POSITIVE_INFINITY });
    const agg = varPorProd.get(pid);
    agg.estoqueTotal += isNaN(est) ? 0 : est;
    if (!isNaN(p) && p < agg.menorPreco) agg.menorPreco = p;
  });

  const items = produtos.map(p => {
    const agg = varPorProd.get(p.id) || { estoqueTotal: 0, menorPreco: Number.POSITIVE_INFINITY };
    const preco = (typeof p.preco !== 'undefined' && p.preco !== null)
      ? p.preco
      : (agg.menorPreco !== Number.POSITIVE_INFINITY ? agg.menorPreco : null);

    return {
      id: p.id,
      nome: p.nome,
      sku: p.sku || '',
      marcaNome: marcaNomeById.get(p.marca_id) || '—',
      categoriaNome: catNomeById.get(p.categoria_id) || '—',
      preco: preco,
      estoqueTotal: agg.estoqueTotal
    };
  });

  res.render('produto/produtos', { title: 'Produto (API) • Produtos', items });
});

router.get('/produto-variacoes', async (req, res) => {
  const api = makeApi(req);
  const [variacoes, produtos, cores, tamanhos] = await Promise.all([
    safeGet(api, '/produto-variacoes', {}, []),
    safeGet(api, '/produtos'),
    safeGet(api, '/cores'),
    safeGet(api, '/tamanhos')
  ]);

  const prodNomeById = new Map(produtos.map(p => [p.id, p.nome]));
  const corNomeById  = new Map(cores.map(c => [c.id ?? c.cor_id, c.nome ?? c.cor_nome]));
  const tamNomeById  = new Map(tamanhos.map(t => [t.id ?? t.tamanho_id, t.nome ?? t.tamanho_nome]));

  const items = (variacoes || []).map(v => ({
    id: v.id,
    produtoNome: prodNomeById.get(v.produto_id) || '—',
    corNome: corNomeById.get(v.cor_id) || v.cor || '—',
    tamanhoNome: tamNomeById.get(v.tamanho_id) || v.tamanho || '—',
    preco: v.preco ?? '—',
    estoque: v.estoque ?? v.quantidade ?? 0
  }));

  res.render('produto/variacoes', { title: 'Produto (API) • Produto Variações', items });
});

/* =========================
   Buscas
   ========================= */

/** Produto por nome: /produto/busca/produtos?q=camisa */
router.get('/busca/produtos', async (req, res) => {
  const api = makeApi(req);
  const q = (req.query.q || '').trim();
  const items = q
    ? await safeGet(api, '/produtos/busca/texto', { params: { q } })
    : [];
  res.render('produto/busca_produtos', { title: 'Busca • Produto por nome', q, items });
});

/** Produto nome + marca: /produto/busca/produtos-marca?q=camiseta&marca=nike */
router.get('/busca/produtos-marca', async (req, res) => {
  const api = makeApi(req);
  const q = (req.query.q || '').trim();
  const marca = (req.query.marca || '').trim();
  const items = (q || marca)
    ? await safeGet(api, '/produtos/busca/texto', { params: { q, marca } })
    : [];
  res.render('produto/busca_produtos_marca', { title: 'Busca • Produto nome + marca', q, marca, items });
});

/** Marcas por nome parcial: /produto/busca/marcas-parcial?nome=adi */
router.get('/busca/marcas-parcial', async (req, res) => {
  const api = makeApi(req);
  const nome = (req.query.nome || '').trim();
  const items = nome
    ? await safeGet(api, '/marcas/busca', { params: { nome } })
    : [];
  res.render('produto/busca_marcas_parcial', { title: 'Busca • Marca parcial', nome, items });
});

/** Marca + id produto(s): /produto/busca/marcas-com-produtos?nome=adi&comProdutos=1 */
router.get('/busca/marcas-com-produtos', async (req, res) => {
  const api = makeApi(req);
  const nome = (req.query.nome || '').trim();
  const comProdutos = req.query.comProdutos || '';
  const items = nome
    ? await safeGet(api, '/marcas/busca', { params: { nome, comProdutos } })
    : [];
  res.render('produto/busca_marcas_com_produtos', { title: 'Busca • Marca + comProdutos', nome, comProdutos, items });
});

module.exports = router;
