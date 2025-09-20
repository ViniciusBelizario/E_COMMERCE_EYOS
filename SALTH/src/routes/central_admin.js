const express = require('express');
const router = express.Router();

// Rota para renderizar a central administrativa
router.get('/central_admin', (req, res) => {
  res.render('central_admin', {
    title: 'Painel Administrativo - SALTH',
    sections: ['Insights', 'Cadastrar Produto', 'Produtos'],
    mensagem: 'Bem-vindo à Central Administrativa. Gerencie seu estoque e produtos aqui!'
  });
});

module.exports = router;
