const express = require('express');
const router = express.Router();

// Rota para a página Fabric Xperience
router.get('/fabric_xperience', (req, res) => {
  res.render('fabric_xperience_screen', { title: 'Fabric Xperience | Salth' });
});

module.exports = router;
