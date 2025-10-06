// src/server.js
require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const sequelize = require("./config/database");

// ✅ Apenas importa os models para registrá-los e aplicar as associações centralizadas
require("./models");

const app = express();

app.use(express.json());

// CORS
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3002"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Arquivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// Rotas
const routes = require("./routes");
app.use("/", routes);

const PORT = process.env.PORT || 3001;

(async () => {
  try {
    console.log({
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
    });

    await sequelize.authenticate();
    console.log("Conexão com o banco de dados estabelecida com sucesso!");

    // ❌ NÃO usar alter aqui para evitar recriações/queda de FKs em duplicidade
    await sequelize.sync();
    console.log("Banco sincronizado com sucesso!");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error("Falha ao iniciar:", err);
    process.exit(1);
  }
})();
