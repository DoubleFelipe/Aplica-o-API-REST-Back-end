const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarios = require('../models/usuarioModel');

function publicUser(user) {
  const { senha_hash: senhaHash, ...safeUser } = user;
  return safeUser;
}

/**
 * Cria uma conta de cliente ou técnico.
 * @async
 * @param {import('express').Request} req Requisição com nome, e-mail, senha e papel.
 * @param {import('express').Response} res Resposta HTTP.
 * @returns {Promise<void>} Usuário criado sem hash de senha.
 * @throws {Error} Quando o e-mail já estiver cadastrado ou ocorrer erro no banco.
 */
async function register(req, res, next) {
  try {
    const { nome, email, senha } = req.body;
    const existing = await usuarios.findByEmail(email);
    if (existing.rowCount) return res.status(409).json({ message: 'E-mail já cadastrado.' });
    const senhaHash = await bcrypt.hash(senha, 12);
    const result = await usuarios.create({ nome, email, senhaHash, role: 'cliente' });
    return res.status(201).json({ user: result.rows[0] });
  } catch (error) { return next(error); }
}

/**
 * Autentica um usuário e gera JWT de acesso.
 * @async
 * @param {import('express').Request} req Requisição com e-mail e senha.
 * @param {import('express').Response} res Resposta HTTP.
 * @returns {Promise<void>} Token JWT e dados públicos do usuário.
 * @throws {Error} Quando o banco de dados não puder ser consultado.
 */
async function login(req, res, next) {
  try {
    const { email, senha } = req.body;
    const result = await usuarios.findByEmail(email);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(senha, user.senha_hash))) {
      return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }
    const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h'
    });
    return res.json({ token, user: publicUser(user) });
  } catch (error) { return next(error); }
}

async function profile(req, res, next) {
  try {
    const result = await usuarios.findById(req.user.sub);
    return res.json({ user: result.rows[0] });
  } catch (error) { return next(error); }
}

module.exports = { register, login, profile };
