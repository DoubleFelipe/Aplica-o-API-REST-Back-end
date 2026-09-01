const jwt = require('jsonwebtoken');

/** Exige um JWT Bearer válido e expõe seu conteúdo em req.user. */
function authenticate(req, res, next) {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token de autenticação não informado.' });
  }

  try {
    req.user = jwt.verify(authorization.slice(7), process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
}

/** Restringe uma rota aos papéis informados. */
function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Você não possui permissão para esta ação.' });
    }
    return next();
  };
}

module.exports = { authenticate, authorize };
