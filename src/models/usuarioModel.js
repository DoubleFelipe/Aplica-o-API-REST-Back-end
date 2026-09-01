const pool = require('../config/database');

function create({ nome, email, senhaHash, role }) {
  const query = `INSERT INTO usuarios (nome, email, senha_hash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, nome, email, role, created_at`;
  return pool.query(query, [nome, email, senhaHash, role]);
}

function findByEmail(email) {
  return pool.query('SELECT id, nome, email, senha_hash, role, created_at FROM usuarios WHERE email = $1', [email]);
}

function findById(id) {
  return pool.query('SELECT id, nome, email, role, created_at FROM usuarios WHERE id = $1', [id]);
}

module.exports = { create, findByEmail, findById };
