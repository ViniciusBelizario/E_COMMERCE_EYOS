const express = require('express');
const router = express.Router();

// Rota para a página Sustentabilidade
router.get('/sustentabilidade', (req, res) => {
  res.render('sustentabilidade_screen', {
    title: 'Sustentabilidade | Salth',
  });
});

module.exports = router;
