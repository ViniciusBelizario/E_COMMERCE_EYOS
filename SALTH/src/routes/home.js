// src/routes/home.js

const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
  try {
    // Buscar produtos
    const productsResponse = await axios.get('http://localhost:3001/api/products');
    const products = productsResponse.data;

    // Buscar categorias
    const categoriesResponse = await axios.get('http://localhost:3001/api/categories');
    const categories = categoriesResponse.data;

    // Renderizar a view com os dois arrays
    return res.render('home_screen', { products, categories });
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    // Em caso de erro, passar arrays vazios (ou o que quiser)
    return res.render('home_screen', { products: [], categories: [] });
  }
});

module.exports = router;
