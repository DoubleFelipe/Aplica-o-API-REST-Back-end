const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';
const sslEnabled = process.env.DATABASE_SSL === 'true' || isProduction;
const databaseUrl = new URL(process.env.DATABASE_URL);

// A opção sslmode na URL é interpretada pelo `pg` antes da configuração abaixo
// e pode substituir `rejectUnauthorized`. O controle de TLS desta aplicação é
// centralizado em DATABASE_SSL, portanto removemos a opção da URL.
databaseUrl.searchParams.delete('sslmode');
databaseUrl.searchParams.delete('uselibpqcompat');

const pool = new Pool({
  connectionString: databaseUrl.toString(),
  ssl: sslEnabled ? { rejectUnauthorized: false } : false
});

pool.on('error', (error) => {
  console.error('Erro inesperado no pool PostgreSQL:', error.message);
});

module.exports = pool;
