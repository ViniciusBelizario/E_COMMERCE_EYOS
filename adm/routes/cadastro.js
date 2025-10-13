// routes/cadastro.js
const express = require('express');
const FormData = require('form-data');
const { makeApi, apiError } = require('../utils/api');
const multer = require('multer');
const upload = multer(); // memória (buffer)

const router = express.Router();

/* helpers */
async function safeGet(api, url, fallback = []) {
  try {
    const { data } = await api.get(url);
    return Array.isArray(data) ? data : (data?.data || data || fallback);
  } catch (err) {
    console.error('GET error', url, apiError(err));
    return fallback;
  }
}
function redirectWithMsg(res, path, msg) {
  const qs = msg ? `?msg=${encodeURIComponent(msg)}` : '';
  return res.redirect(`${path}${qs}`);
}
// Converte "79,90" -> "79.90" e também remove separador de milhar
function normalizePrecoBR(val) {
  if (val == null) return '';
  return String(val).trim().replace(/\./g, '').replace(',', '.');
}

/* =========================
   MARCA
   ========================= */
router.get('/marca', async (req, res) => {
  const api = makeApi(req);
  const items = await safeGet(api, '/marcas');
  res.render('cadastro/marca', {
    title: 'Cadastro • Marca',
    items
  });
});

router.post('/marca', async (req, res) => {
  const api = makeApi(req);
  const { nome, descricao } = req.body;
  try {
    await api.post('/marcas', { nome, descricao });
    return redirectWithMsg(res, '/cadastro/marca', 'Marca cadastrada!');
  } catch (err) {
    const { msg } = apiError(err);
    return redirectWithMsg(res, '/cadastro/marca', `Erro: ${msg}`);
  }
});

router.delete('/marca/:id', async (req, res) => {
  const api = makeApi(req);
  try {
    await api.delete(`/marcas/${req.params.id}`);
    return redirectWithMsg(res, '/cadastro/marca', 'Marca removida!');
  } catch (err) {
    const { msg } = apiError(err);
    console.warn('DELETE marca falhou (ok se API não suportar):', msg);
    return redirectWithMsg(res, '/cadastro/marca', 'Não foi possível remover (API).');
  }
});

/* =========================
   CATEGORIA
   ========================= */
router.get('/categoria', async (req, res) => {
  const api = makeApi(req);
  const items = await safeGet(api, '/categorias');
  res.render('cadastro/categoria', {
    title: 'Cadastro • Categoria',
    items
  });
});

router.post('/categoria', async (req, res) => {
  const api = makeApi(req);
  const { nome, descricao } = req.body;
  try {
    await api.post('/categorias', { nome, descricao });
    return redirectWithMsg(res, '/cadastro/categoria', 'Categoria cadastrada!');
  } catch (err) {
    const { msg } = apiError(err);
    return redirectWithMsg(res, '/cadastro/categoria', `Erro: ${msg}`);
  }
});

router.delete('/categoria/:id', async (req, res) => {
  const api = makeApi(req);
  try {
    await api.delete(`/categorias/${req.params.id}`);
    return redirectWithMsg(res, '/cadastro/categoria', 'Categoria removida!');
  } catch (err) {
    const { msg } = apiError(err);
    console.warn('DELETE categoria falhou:', msg);
    return redirectWithMsg(res, '/cadastro/categoria', 'Não foi possível remover (API).');
  }
});

/* =========================
   TAMANHO
   ========================= */
router.get('/tamanho', async (req, res) => {
  const api = makeApi(req);
  const items = await safeGet(api, '/tamanhos');
  res.render('cadastro/tamanho', {
    title: 'Cadastro • Tamanho',
    items
  });
});

router.post('/tamanho', async (req, res) => {
  const api = makeApi(req);
  const { nome } = req.body;
  try {
    await api.post('/tamanhos', { nome });
    return redirectWithMsg(res, '/cadastro/tamanho', 'Tamanho cadastrado!');
  } catch (err) {
    const { msg } = apiError(err);
    return redirectWithMsg(res, '/cadastro/tamanho', `Erro: ${msg}`);
  }
});

router.delete('/tamanho/:id', async (req, res) => {
  const api = makeApi(req);
  try {
    await api.delete(`/tamanhos/${req.params.id}`);
    return redirectWithMsg(res, '/cadastro/tamanho', 'Tamanho removido!');
  } catch (err) {
    const { msg } = apiError(err);
    console.warn('DELETE tamanho falhou:', msg);
    return redirectWithMsg(res, '/cadastro/tamanho', 'Não foi possível remover (API).');
  }
});

/* =========================
   CORES
   ========================= */
router.get('/cores', async (req, res) => {
  const api = makeApi(req);
  const items = await safeGet(api, '/cores');
  res.render('cadastro/cores', {
    title: 'Cadastro • Cores',
    items
  });
});

router.post('/cores', async (req, res) => {
  const api = makeApi(req);
  // API espera "codigo_hex"
  const { nome, codigo_hex } = req.body;
  try {
    await api.post('/cores', { nome, codigo_hex });
    return redirectWithMsg(res, '/cadastro/cores', 'Cor cadastrada!');
  } catch (err) {
    const { msg } = apiError(err);
    return redirectWithMsg(res, '/cadastro/cores', `Erro: ${msg}`);
  }
});

router.delete('/cores/:id', async (req, res) => {
  const api = makeApi(req);
  try {
    await api.delete(`/cores/${req.params.id}`);
    return redirectWithMsg(res, '/cadastro/cores', 'Cor removida!');
  } catch (err) {
    const { msg } = apiError(err);
    console.warn('DELETE cor falhou:', msg);
    return redirectWithMsg(res, '/cadastro/cores', 'Não foi possível remover (API).');
  }
});

/* =========================
   PRODUTO
   ========================= */
router.get('/produto', async (req, res) => {
  const api = makeApi(req);
  const [marcas, categorias, produtos, variacoes] = await Promise.all([
    safeGet(api, '/marcas'),
    safeGet(api, '/categorias'),
    safeGet(api, '/produtos'),
    safeGet(api, '/produto-variacoes', [])
  ]);

  // mapa auxiliares
  const marcaNomeById = new Map(marcas.map(m => [m.id, m.nome]));
  const catNomeById   = new Map(categorias.map(c => [c.id, c.nome]));

  // agregações por produto
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

  // normaliza para a tabela
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
      preco: preco,                  // número (ex.: 79.9)
      estoqueTotal: agg.estoqueTotal // inteiro
    };
  });

  res.render('cadastro/produto', {
    title: 'Cadastro • Produto',
    items,
    marcas,
    categorias
  });
});

// multipart: imagem e vídeo
router.post('/produto', upload.fields([
  { name: 'imagem', maxCount: 1 },
  { name: 'video',  maxCount: 1 }
]), async (req, res) => {
  const api = makeApi(req);
  const { nome, descricao, preco, idMarca, idCategoria } = req.body;

  try {
    const fd = new FormData();
    fd.append('nome', nome || '');
    fd.append('descricao', descricao || '');
    if (preco)       fd.append('preco', String(normalizePrecoBR(preco)));
    if (idCategoria) fd.append('categoria_id', String(idCategoria));
    if (idMarca)     fd.append('marca_id', String(idMarca));

    // Arquivos: imagem e vídeo (se enviados)
    const img = req.files?.imagem?.[0];
    if (img) {
      fd.append('imagem', img.buffer, {
        filename: img.originalname || 'imagem.jpg',
        contentType: img.mimetype || 'image/jpeg'
      });
    }
    const vid = req.files?.video?.[0];
    if (vid) {
      fd.append('video', vid.buffer, {
        filename: vid.originalname || 'video.mp4',
        contentType: vid.mimetype || 'video/mp4'
      });
    }

    await api.post('/produtos', fd, { headers: fd.getHeaders() });
    return res.redirect('/cadastro/produto?msg=Produto cadastrado!');
  } catch (err) {
    const { msg } = apiError(err);
    return res.redirect('/cadastro/produto?msg=' + encodeURIComponent(`Erro: ${msg}`));
  }
});

router.delete('/produto/:id', async (req, res) => {
  const api = makeApi(req);
  try {
    await api.delete(`/produtos/${req.params.id}`);
    return redirectWithMsg(res, '/cadastro/produto', 'Produto removido!');
  } catch (err) {
    const { msg } = apiError(err);
    console.warn('DELETE produto falhou:', msg);
    return redirectWithMsg(res, '/cadastro/produto', 'Não foi possível remover (API).');
  }
});

/* =========================
   VARIAÇÃO (lista + criação)
   ========================= */
router.get('/variacao', async (req, res) => {
  const api = makeApi(req);

  const [produtos, cores, tamanhos, variacoesApi] = await Promise.all([
    safeGet(api, '/produtos'),
    safeGet(api, '/cores'),
    safeGet(api, '/tamanhos'),
    safeGet(api, '/produto-variacoes', [])
  ]);

  // mapas para nome por id
  const corNomeById  = new Map(cores.map(c => [c.id ?? c.cor_id, c.nome ?? c.cor_nome]));
  const tamNomeById  = new Map(tamanhos.map(t => [t.id ?? t.tamanho_id, t.nome ?? t.tamanho_nome]));
  const prodNomeById = new Map(produtos.map(p => [p.id, p.nome]));

  const items = (variacoesApi || []).map(v => ({
    id: v.id,
    produtoNome: prodNomeById.get(v.produto_id) || '—',
    corNome: corNomeById.get(v.cor_id) || v.cor || '—',
    tamanhoNome: tamNomeById.get(v.tamanho_id) || v.tamanho || '—',
    preco: v.preco ?? '—',
    estoque: v.estoque ?? v.quantidade ?? 0
  }));

  const produtosItems = produtos.map(p => ({ value: p.id, text: p.nome }));
  const coresItems    = cores.map(c => ({ value: c.id ?? c.cor_id, text: c.nome ?? c.cor_nome }));
  const tamanhosItems = tamanhos.map(t => ({ value: t.id ?? t.tamanho_id, text: t.nome ?? t.tamanho_nome }));

  res.render('cadastro/variacao', {
    title: 'Cadastro • Produto Variação',
    items,
    produtosItems,
    coresItems,
    tamanhosItems
  });
});

// cria variação (com imagem) e aceita preço com vírgula
router.post('/variacao', upload.fields([{ name: 'imagem', maxCount: 1 }]), async (req, res) => {
  const api = makeApi(req);
  try {
    const { produtoId, corId, tamanhoId, estoque } = req.body;

    const fd = new FormData();
    fd.append('produto_id', String(produtoId));
    fd.append('cor_id', String(corId));
    fd.append('tamanho_id', String(tamanhoId));

    if (typeof estoque !== 'undefined' && estoque !== '') {
      fd.append('estoque', String(estoque));
      fd.append('quantidade', String(estoque)); // compatibilidade com APIs que usam "quantidade"
    }

    const img = req.files?.imagem?.[0];
    if (img) {
      fd.append('imagem', img.buffer, {
        filename: img.originalname || 'variacao.jpg',
        contentType: img.mimetype || 'image/jpeg'
      });
    }

    // tenta endpoint direto; se 404/405 cai pro aninhado
    try {
      await api.post('/produto-variacoes', fd, { headers: fd.getHeaders() });
    } catch (e1) {
      const status = e1?.response?.status;
      if (status === 404 || status === 405) {
        await api.post(`/produtos/${produtoId}/variacoes`, fd, { headers: fd.getHeaders() });
      } else {
        throw e1;
      }
    }

    return res.redirect('/cadastro/variacao?msg=Variação cadastrada!');
  } catch (err) {
    const { msg } = apiError(err);
    return res.redirect('/cadastro/variacao?msg=' + encodeURIComponent(`Erro: ${msg}`));
  }
});

router.delete('/variacao/:id', async (req, res) => {
  const api = makeApi(req);
  try {
    await api.delete(`/produto-variacoes/${req.params.id}`);
    return redirectWithMsg(res, '/cadastro/variacao', 'Variação removida!');
  } catch (err) {
    // fallback: algumas APIs usam /variacoes/:id
    try {
      await api.delete(`/variacoes/${req.params.id}`);
      return redirectWithMsg(res, '/cadastro/variacao', 'Variação removida!');
    } catch (err2) {
      const { msg } = apiError(err2);
      console.warn('DELETE variacao falhou:', msg);
      return redirectWithMsg(res, '/cadastro/variacao', 'Não foi possível remover (API).');
    }
  }
});

module.exports = router;
