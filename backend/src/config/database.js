const { Sequelize } = require('sequelize');
const path = require('path');

// Carregar as variáveis de ambiente
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: console.log, // Mostra as queries no console
  }
);

(async () => {
  try {
    // Testa a conexão
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
  }
})();

sequelize.sync({force: false, benchmark: true, alter: true})
    .then(() => {
      console.log('Database synchronized');
    })
    .catch((error) => {
      console.error('Failed to synchronize database:', error);
    });

// Verifica se as variáveis foram carregadas corretamente
console.log({
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
});

module.exports = sequelize;
