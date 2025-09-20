const express = require('express');
const router = express.Router();

// Rota para a página Política de Trocas
router.get('/trocas', (req, res) => {
  res.render('trocas_screen', { title: 'Política de Trocas | Salth' });
});

module.exports = router;
