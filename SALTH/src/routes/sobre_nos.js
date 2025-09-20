const express = require('express');
const router = express.Router();

// Rota para a página Sobre Nós
router.get('/sobre_nos', (req, res) => {
  res.render('sobre_nos_screen', { title: 'Sobre Nós | Salth' });
});

module.exports = router;
