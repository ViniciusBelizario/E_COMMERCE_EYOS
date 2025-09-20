const express = require('express');
const router = express.Router();

// Rota para a tela de login (user_screen)
router.get('/user_screen', (req, res) => {
  res.render('user_screen', { title: 'Login Salth' });
});

module.exports = router;
