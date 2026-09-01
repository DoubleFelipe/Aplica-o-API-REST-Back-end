const pool = require('../config/database');

function create({ titulo, descricao, prioridade, solicitanteId }) {
  const query = `INSERT INTO chamados (titulo, descricao, prioridade, solicitante_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *`;
  return pool.query(query, [titulo, descricao, prioridade, solicitanteId]);
}

function findAll({ userId, role, status }) {
  const values = [];
  const conditions = [];
  if (role === 'cliente') {
    values.push(userId);
    conditions.push(`c.solicitante_id = $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`c.status = $${values.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const query = `SELECT c.*, s.nome AS solicitante_nome, t.nome AS tecnico_nome
    FROM chamados c
    JOIN usuarios s ON s.id = c.solicitante_id
    LEFT JOIN usuarios t ON t.id = c.tecnico_id
    ${where}
    ORDER BY c.created_at DESC`;
  return pool.query(query, values);
}

function findById(id) {
  const query = `SELECT c.*, s.nome AS solicitante_nome, t.nome AS tecnico_nome
    FROM chamados c
    JOIN usuarios s ON s.id = c.solicitante_id
    LEFT JOIN usuarios t ON t.id = c.tecnico_id
    WHERE c.id = $1`;
  return pool.query(query, [id]);
}

function update(id, { status, tecnicoId }) {
  const query = `UPDATE chamados
    SET status = COALESCE($1, status), tecnico_id = COALESCE($2, tecnico_id), updated_at = NOW(),
        closed_at = CASE WHEN $1 = 'Concluído' THEN NOW() ELSE closed_at END
    WHERE id = $3 RETURNING *`;
  return pool.query(query, [status || null, tecnicoId || null, id]);
}

module.exports = { create, findAll, findById, update };
