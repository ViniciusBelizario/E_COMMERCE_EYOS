//src\utils\jwt.js
const jwt = require('jsonwebtoken');

// Chave secreta (idealmente, mova para o arquivo .env)
const SECRET_KEY = process.env.JWT_SECRET || 'sua_chave_secreta';

// Gerar um token
const generateToken = (payload, expiresIn = '1h') => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
};

// Verificar um token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    throw new Error('Token inválido');
  }
};

module.exports = { generateToken, verifyToken };
