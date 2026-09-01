const { validationResult } = require('express-validator');

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: 'Dados de entrada inválidos.', errors: errors.array() });
  }
  return next();
}

function notFound(req, res) {
  return res.status(404).json({ message: 'Rota não encontrada.' });
}

function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(error);
  const status = error.status || 500;
  const message = status >= 500 && process.env.NODE_ENV === 'production'
    ? 'Erro interno do servidor.'
    : error.message || 'Erro interno do servidor.';
  return res.status(status).json({ message });
}

module.exports = { validateRequest, notFound, errorHandler };
