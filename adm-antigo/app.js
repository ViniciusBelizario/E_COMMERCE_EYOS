//app.js
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const expressLayouts = require("express-ejs-layouts");

const authMiddleware = require("./middlewares/authMiddleware");

// Importação das rotas
const authRoutes = require("./routes/authRoutes");
const categoriaRoutes = require("./routes/categoriaRoutes");
const produtoRoutes = require("./routes/produtoRoutes");
const corRoutes = require("./routes/corRoutes");
const marcaRoutes = require("./routes/marcaRoutes");
const tamanhoRoutes = require("./routes/tamanhoRoutes");
const produtoVariacaoRoutes = require("./routes/produtoVariacaoRoutes");

const app = express();
const PORT = 3002;

// Configuração do Express
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({ secret: "chave-secreta", resave: false, saveUninitialized: true }));

// Configuração da View Engine EJS com layouts
app.use(expressLayouts);
app.set("layout", "layout"); // Define que "views/layout.ejs" será o layout principal
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Servir arquivos estáticos (CSS, JS, Imagens)
app.use(express.static(path.join(__dirname, "public"), { 
    extensions: ['html', 'css', 'js'],
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// 🔹 Rotas de Autenticação (Acesso Livre)
app.use("/auth", authRoutes);

// 🔹 Middleware de Autenticação (Protegendo Rotas Administrativas)
app.use(authMiddleware);

// 🔹 Rota Principal após Login (Painel Administrativo)
app.get("/", (req, res) => {
    res.render("partials/dashboard", { title: "Painel Administrativo" });
});

// 🔹 Rotas Administrativas (Protegidas pelo Middleware)
app.use("/categorias", categoriaRoutes);
app.use("/produtos", produtoRoutes);
app.use("/cores", corRoutes);
app.use("/marcas", marcaRoutes);
app.use("/tamanhos", tamanhoRoutes);
app.use("/produto-variacoes", produtoVariacaoRoutes);

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`✅ Admin rodando em http://localhost:${PORT}`);
});
