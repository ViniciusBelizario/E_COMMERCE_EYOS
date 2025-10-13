const express = require('express');
const { db } = require('../controllers/store');
const router = express.Router();

router.get('/', (req, res) => {
  // Exemplo simples de KPIs
  const totalProdutos = db.produtos.length;
  const totalVariacoes = db.variacoes.length;
  const estoqueTotal = db.variacoes.reduce((s, v) => s + Number(v.estoque || 0), 0);

  res.render('relatorio', {
    title: 'Relatório',
    kpis: { totalProdutos, totalVariacoes, estoqueTotal }
  });
});

module.exports = router;
