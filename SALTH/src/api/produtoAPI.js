const API_URL = "http://localhost:3001/produtos";


/**
 * Busca todos os produtos da API
 * @returns {Promise<Array>} Lista de produtos
 */
async function fetchProducts() {
    try {
        const response = await fetch(API_URL); // Agora usa o fetch nativo do Node.js
        if (!response.ok) {
            throw new Error(`Erro ao buscar produtos: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Erro ao conectar com a API:", error);
        return [];
    }
}

module.exports = { fetchProducts };
