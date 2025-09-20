const express = require('express');
const cartController = require('../controllers/cartController');

const router = express.Router();

router.post('/', cartController.addToCart); // Adicionar item ao carrinho
router.get('/', cartController.getCartItems); // Obter todos os itens do carrinho
router.put('/:id', cartController.updateCartItem); // Atualizar quantidade de item
router.delete('/:id', cartController.removeCartItem); // Remover item do carrinho
router.post('/finalize', cartController.finalizePurchase); // Rota para finalizar compra

module.exports = router;
