const express = require('express');
const router = express.Router();

// Rota para a central do usuário
router.get('/central_usuario', (req, res) => {
  res.render('central_usuario_screen', { title: 'Central do Usuário | Salth' });
});

module.exports = router;
