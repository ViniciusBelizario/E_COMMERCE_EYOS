const express = require('express');
const router = express.Router();

// Rota para a página Política de Privacidade
router.get('/privacidade', (req, res) => {
  res.render('privacidade_screen', { title: 'Política de Privacidade | Salth' });
});

module.exports = router;
