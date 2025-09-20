const express = require('express');
const router = express.Router();
const axios = require('axios');

const API_URL = 'http://localhost:3001/produtos';
const categoriasValidas = ['sale', 'kits', 'pima', 'tshirts', 'nova-colecao', 'catalogo'];

router.get(['/vitrine', '/vitrine/:categoria'], async (req, res) => {
  try {
    let categoria = req.params.categoria || 'catalogo'; // Agora "catalogo" é o padrão
    const { tipo, cor, tamanho, tecido } = req.query;

    const response = await axios.get(API_URL);
    let produtos = response.data;

    if (!Array.isArray(produtos)) {
      produtos = [];
    }

    if (categoria && categoriasValidas.includes(categoria) && categoria !== 'catalogo') {
      produtos = produtos.filter((produto) => produto.categoria?.toLowerCase() === categoria.toLowerCase());
    }

    if (tipo) {
      produtos = produtos.filter((produto) => produto.tipo?.toLowerCase() === tipo.toLowerCase());
    }
    if (cor) {
      const coresSelecionadas = cor.toLowerCase().split(',');
      produtos = produtos.filter((produto) => coresSelecionadas.includes(produto.cor?.toLowerCase()));
    }
    if (tamanho) {
      const tamanhosSelecionados = tamanho.toLowerCase().split(',');
      produtos = produtos.filter((produto) => tamanhosSelecionados.includes(produto.tamanho?.toLowerCase()));
    }
    if (tecido) {
      const tecidosSelecionados = tecido.toLowerCase().split(',');
      produtos = produtos.filter((produto) => tecidosSelecionados.includes(produto.tecido?.toLowerCase()));
    }

    const categories = [...new Set(produtos.map((produto) => produto.categoria).filter(Boolean))];

    console.log("Produtos carregados para a view:", produtos.length, "itens");

    res.render('vitrine_screen', {
      title: categoria !== 'catalogo' ? `Vitrine - ${categoria}` : 'Catálogo de Produtos SALTH',
      categoria,
      tipo: tipo || null,
      cor: cor || null,
      tamanho: tamanho || null,
      tecido: tecido || null,
      produtos,
      categories,
      mensagem: 'Explore nossa coleção completa de moda masculina!'
    });
  } catch (error) {
    console.error("Erro ao buscar produtos da API:", error.message);
    res.render('vitrine_screen', {
      title: 'Erro ao carregar a vitrine',
      categoria: null,
      tipo: null,
      cor: null,
      tamanho: null,
      tecido: null,
      produtos: [],
      categories: [],
      mensagem: 'Erro ao carregar os produtos. Tente novamente mais tarde.'
    });
  }
});

module.exports = router;
