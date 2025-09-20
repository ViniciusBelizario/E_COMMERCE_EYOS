const express = require("express");
const axios = require("axios");
const router = express.Router();

const API_URL = "http://localhost:3001/produtos"; // URL da API real

// Rota para buscar um único produto pelo ID
router.get("/produto/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Fazendo a requisição para o backend para buscar o produto
    const response = await axios.get(`${API_URL}/${id}`);
    const produto = response.data;

    // Se o produto não existir, exibe a página de erro 404
    if (!produto) {
      return res.status(404).render("404", { title: "Produto Não Encontrado" });
    }

    // Renderiza a página do produto com os dados obtidos
    res.render("produto_screen", {
      title: `Detalhes - ${produto.nome}`,
      produto,
    });
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    res.status(500).render("500", { title: "Erro Interno no Servidor" });
  }
});

module.exports = router;
