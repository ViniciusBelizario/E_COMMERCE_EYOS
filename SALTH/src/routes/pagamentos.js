const express = require('express');
const router = express.Router();

// Middleware para garantir que o Express possa processar os dados do formulário
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// POST /pagamentos - recebe os dados do produto enviados pelo formulário
router.post('/pagamentos', async (req, res) => {
  try {
    console.log("🔹 Dados Recebidos no Servidor:", req.body); // Debug

    // Verifica se os campos obrigatórios existem
    if (!req.body.produtoId || !req.body.nome || !req.body.preco) {
      return res.status(400).send("❌ Dados inválidos. Produto não encontrado.");
    }

    // Desestrutura os dados recebidos do formulário "Comprar Agora"
    const {
      produtoId,
      nome,
      preco,
      corSelecionada,
      tamanhoSelecionado,
      quantidade,
      imagem_url
    } = req.body;

    // Converte valores para os tipos corretos
    const parsedPreco = parseFloat(preco) || 0;
    const parsedQtd = parseInt(quantidade, 10) || 1;

    // Monta o item do pedido
    const item = {
      produtoId,
      nome,
      preco: parsedPreco,
      cor: corSelecionada || "Não informado",
      tamanho: tamanhoSelecionado || "Não informado",
      quantidade: parsedQtd,
      imagem_url: imagem_url || "/images/default-placeholder.png"
    };

    // Cálculo do total da compra
    const subtotal = item.preco * item.quantidade;
    const frete = 15; // Frete fixo (pode ser calculado dinamicamente)
    const total = subtotal + frete;

    // Renderiza a view de pagamento (pagamentos_screen.ejs)
    res.render('pagamentos_screen', {
      title: 'Checkout - SALTH',
      user: req.user || null, // Se houver login, passa os dados do usuário
      items: [item], // Enviamos um array de itens
      subtotal,
      frete,
      total
    });

  } catch (error) {
    console.error("🚨 Erro ao processar pagamento:", error);
    res.status(500).send("❌ Erro interno ao processar pagamento.");
  }
});

// GET /pagamentos - Caso alguém tente acessar a página diretamente sem passar um produto
router.get('/pagamentos', (req, res) => {
  res.redirect("/"); // Redireciona para a home da loja
});

module.exports = router;
