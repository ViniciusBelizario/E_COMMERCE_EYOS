const express = require('express');
const path = require('path');
const morgan = require('morgan');
const methodOverride = require('method-override');
const engine = require('ejs-mate');
const cookieParser = require('cookie-parser');

const indexRoutes = require('./routes/index');
const cadastroRoutes = require('./routes/cadastro');
const relatorioRoutes = require('./routes/relatorio');
const authRoutes = require('./routes/auth');
const produtoRoutes = require('./routes/produto');

const app = express();

// Engine/views
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(cookieParser());

// Flash simples
app.use((req, res, next) => {
  res.locals.msg = req.query.msg || null;
  next();
});

// Deixa o path disponível nas views
app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});

// Rotas públicas
app.use('/auth', authRoutes);           // /auth/login (GET form, POST efetivo)
app.get('/login', (req, res) => {       // URL amigável
  // se já estiver logado, manda pra home
  if (req.cookies?.token) return res.redirect('/');
  res.render('login', { title: 'Login' });
});

// Middleware de proteção (após rotas públicas)
app.use((req, res, next) => {
  // libera a própria página de login e arquivos estáticos
  const publicPaths = ['/login', '/auth/login', '/public'];
  if (publicPaths.some(p => req.path.startsWith(p))) return next();

  const token = req.cookies?.token;
  if (!token) {
    return res.redirect('/login?msg=Faça login para continuar');
  }
  // opcional: validar formato do JWT rapidamente (não obrigatório aqui)
  res.locals.token = token;
  next();
});

// Rotas protegidas
app.use('/', indexRoutes);
app.use('/cadastro', cadastroRoutes);
app.use('/relatorio', relatorioRoutes);
app.use('/produto', produtoRoutes);

// 404
app.use((req, res) => {
  res.status(404).render('home', { title: 'Não encontrado' });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`✅ Server on http://localhost:${PORT}`));
