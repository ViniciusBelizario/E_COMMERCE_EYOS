const express = require('express');
const axios = require('axios');

const router = express.Router();

// GET /auth/login -> redireciona para /login (mantém uma única view)
router.get('/login', (req, res) => res.redirect('/login'));

// POST /auth/login -> proxy para API e grava cookie
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    const { data } = await axios.post('http://localhost:3001/auth/login', {
      email,
      senha
    }, {
      // se sua API exigir cabeçalhos ou tenha CORS restrito, isso não afeta
      timeout: 10000
    });

    // Esperamos: { message: "...", token: "..." }
    if (!data?.token) {
      return res.redirect('/login?msg=Credenciais inválidas');
    }

    // Grava cookie httpOnly com o token
    res.cookie('token', data.token, {
      httpOnly: true,
      sameSite: 'lax',
      // secure: true, // ligue em produção (https)
      maxAge: 1000 * 60 * 60 * 8 // 8h (ajuste ao exp do seu JWT)
    });

    return res.redirect('/?msg=Login bem-sucedido');
  } catch (err) {
    console.error('Erro no login:', err?.response?.data || err.message);
    return res.redirect('/login?msg=Falha no login');
  }
});

// GET /auth/logout -> limpa cookie e volta pro login
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login?msg=Sessão encerrada');
});

module.exports = router;
