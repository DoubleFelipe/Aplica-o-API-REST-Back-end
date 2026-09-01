const required = ['DATABASE_URL', 'JWT_SECRET'];

/** Valida a configuração de ambiente obrigatória. */
function validateEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Variáveis de ambiente ausentes: ${missing.join(', ')}`);
  }
}

module.exports = { validateEnv };
