const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

// =========================
// Carregar Variáveis de Ambiente
// =========================
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// =========================
// Configuração do Template Engine (EJS)
// =========================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

// =========================
// Configuração de Arquivos Estáticos
// =========================
app.use(express.static(path.join(__dirname, "public")));
app.use("/src/api", express.static(path.join(__dirname, "src", "api"))); // Para servir os arquivos JS de API

// =========================
// Importação de APIs e Funções
// =========================
const { fetchProducts } = require("./src/api/produtoAPI"); // Importação da API de produtos

// =========================
// Rotas Principais
// =========================
app.get("/", async (req, res) => {
  try {
    const products = await fetchProducts(); // Busca os produtos da API
    console.log("Produtos carregados do backend:", products); // Log para depuração
    res.render("home_screen", { products }); // Passa os produtos para o EJS
  } catch (error) {
    console.error("Erro ao carregar a Home:", error);
    res.render("home_screen", { products: [] });
  }
});

app.get("/vitrine", async (req, res) => {
  try {
    const products = await fetchProducts(); // Busca os produtos da API
    res.render("vitrine_screen", { products }); // Passa os produtos para a view
  } catch (error) {
    console.error("Erro ao carregar a Vitrine:", error);
    res.render("vitrine_screen", { products: [] });
  }
});

// =========================
// Importação de Rotas
// =========================
const homeRoutes = require("./src/routes/home");
const produtoRoutes = require("./src/routes/produto");
const vitrineRoutes = require("./src/routes/vitrine");
const userRoutes = require("./src/routes/user");
const userCentralRoutes = require("./src/routes/central_usuario");
const fabricXperienceRoutes = require("./src/routes/fabric_xperience"); // Rota Fabric Xperience
const trocasRoutes = require("./src/routes/trocas"); // Rota Política de Trocas
const privacidadeRoutes = require("./src/routes/privacidade"); // Rota Política de Privacidade
const sobreNosRoutes = require("./src/routes/sobre_nos");
const pagamentosRoutes = require("./src/routes/pagamentos"); // Rota Pagamentos
const sustentabilidadeRoutes = require("./src/routes/sustentabilidade"); // Rota Sustentabilidade
const adminRoutes = require("./src/routes/central_admin"); // Rota Painel Administrativo

// =========================
// Uso das Rotas
// =========================
app.use(homeRoutes);
app.use(produtoRoutes);
app.use(vitrineRoutes);
app.use(userRoutes);
app.use(userCentralRoutes); // Rota da Central do Usuário
app.use(fabricXperienceRoutes); // Rota Fabric Xperience
app.use(trocasRoutes); // Rota Política de Trocas
app.use(privacidadeRoutes); // Rota Política de Privacidade
app.use(sobreNosRoutes);
app.use(pagamentosRoutes); // Rota Pagamentos
app.use(sustentabilidadeRoutes); // Rota Sustentabilidade
app.use(adminRoutes); // Rota Painel Administrativo

// =========================
// Inicialização do Servidor
// =========================
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
