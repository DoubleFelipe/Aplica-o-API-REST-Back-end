const express = require('express');
const { body } = require('express-validator');
const auth = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/errorMiddleware');

const router = express.Router();

router.post('/register', [
  body('nome').trim().isLength({ min: 3, max: 120 }).withMessage('Nome deve ter entre 3 e 120 caracteres.'),
  body('email').trim().isEmail().normalizeEmail().withMessage('E-mail inválido.'),
  body('senha').isString().isLength({ min: 8, max: 72 }).withMessage('Senha deve ter entre 8 e 72 caracteres.'),
  validateRequest
], auth.register);
router.post('/login', [body('email').trim().isEmail().normalizeEmail(), body('senha').isString().notEmpty(), validateRequest], auth.login);
router.get('/me', authenticate, auth.profile);

module.exports = router;
