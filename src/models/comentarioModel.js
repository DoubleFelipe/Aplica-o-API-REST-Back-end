const pool = require('../config/database');

function create({ chamadoId, autorId, mensagem }) {
  const query = `INSERT INTO comentarios_chamado (chamado_id, autor_id, mensagem)
    VALUES ($1, $2, $3) RETURNING *`;
  return pool.query(query, [chamadoId, autorId, mensagem]);
}

function findByChamadoId(chamadoId) {
  const query = `SELECT cc.*, u.nome AS autor_nome, u.role AS autor_role
    FROM comentarios_chamado cc JOIN usuarios u ON u.id = cc.autor_id
    WHERE cc.chamado_id = $1 ORDER BY cc.created_at ASC`;
  return pool.query(query, [chamadoId]);
}

module.exports = { create, findByChamadoId };
