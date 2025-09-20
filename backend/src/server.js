require("dotenv").config();
const express = require("express");
const sequelize = require("./config/database");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(express.json());

// 🔹 Configuração do CORS para aceitar requisições de http://localhost:3000 e http://localhost:3002
app.use(cors({
  origin: [
    "http://localhost:3000", // Admin (exemplo)
    "http://localhost:3002"  // Front-end principal (exemplo)
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 📌 Tornar a pasta 'public/uploads' acessível
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// 🔹 Importar Models
const Usuario = require("./models/Usuario");
const Endereco = require("./models/Endereco");
const Marca = require("./models/Marca");
const Cor = require("./models/Cor");
const Categoria = require("./models/Categoria");
const Produto = require("./models/Produto");
const Tamanho = require("./models/Tamanho");
const ProdutoVariacao = require("./models/ProdutoVariacao");

// 🔹 Definir associações
Usuario.hasMany(Endereco, { foreignKey: "usuario_id", onDelete: "CASCADE" });
Endereco.belongsTo(Usuario, { foreignKey: "usuario_id", onDelete: "CASCADE" });

Categoria.hasMany(Produto, { foreignKey: "categoria_id", onDelete: "CASCADE" });
Produto.belongsTo(Categoria, { foreignKey: "categoria_id", onDelete: "CASCADE" });

Marca.hasMany(Produto, { foreignKey: "marca_id", onDelete: "CASCADE" });
Produto.belongsTo(Marca, { foreignKey: "marca_id", onDelete: "CASCADE" });

Produto.hasMany(ProdutoVariacao, { foreignKey: "produto_id", onDelete: "CASCADE" });
ProdutoVariacao.belongsTo(Produto, { foreignKey: "produto_id", onDelete: "CASCADE" });

ProdutoVariacao.belongsTo(Cor, { foreignKey: "cor_id", onDelete: "CASCADE" });
Cor.hasMany(ProdutoVariacao, { foreignKey: "cor_id", onDelete: "CASCADE" });

ProdutoVariacao.belongsTo(Tamanho, { foreignKey: "tamanho_id", onDelete: "CASCADE" });
Tamanho.hasMany(ProdutoVariacao, { foreignKey: "tamanho_id", onDelete: "CASCADE" });

// 🔹 Rotas
const routes = require("./routes");
app.use("/", routes);

const PORT = process.env.PORT || 3001;

sequelize
  .sync({ force: false }) // 🚨 Lembre-se: apaga e recria todas as tabelas
  .then(() => {
    console.log("Banco de dados recriado com sucesso!");
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erro ao sincronizar banco de dados:", err);
  });
