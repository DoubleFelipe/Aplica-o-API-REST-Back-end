require('dotenv').config();
const app = require('./app');
const pool = require('./config/database');
const { validateEnv } = require('./config/env');

async function start() {
  validateEnv();
  await pool.query('SELECT 1');
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => console.log(`HelpDesk API escutando na porta ${port}`));
}

start().catch((error) => {
  console.error(`Falha ao iniciar a API: ${error.message}`);
  process.exit(1);
});
