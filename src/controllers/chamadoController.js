const chamados = require('../models/chamadoModel');
const comentarios = require('../models/comentarioModel');

function canAccess(ticket, user) {
  return user.role !== 'cliente' || ticket.solicitante_id === user.sub;
}

/**
 * Abre um chamado para o usuário autenticado.
 * @async
 * @param {import('express').Request} req Requisição com título, descrição e prioridade.
 * @param {import('express').Response} res Resposta HTTP.
 * @returns {Promise<void>} Chamado recém-criado.
 * @throws {Error} Quando a persistência falhar.
 */
async function create(req, res, next) {
  try {
    const { titulo, descricao, prioridade = 'Média' } = req.body;
    const result = await chamados.create({ titulo, descricao, prioridade, solicitanteId: req.user.sub });
    return res.status(201).json({ chamado: result.rows[0] });
  } catch (error) { return next(error); }
}

/**
 * Lista chamados visíveis ao papel autenticado.
 * @async
 * @param {import('express').Request} req Requisição opcionalmente filtrada por status.
 * @param {import('express').Response} res Resposta HTTP.
 * @returns {Promise<void>} Coleção de chamados.
 * @throws {Error} Quando a consulta falhar.
 */
async function list(req, res, next) {
  try {
    const result = await chamados.findAll({ userId: req.user.sub, role: req.user.role, status: req.query.status });
    return res.json({ chamados: result.rows });
  } catch (error) { return next(error); }
}

async function getById(req, res, next) {
  try {
    const result = await chamados.findById(req.params.id);
    const chamado = result.rows[0];
    if (!chamado) return res.status(404).json({ message: 'Chamado não encontrado.' });
    if (!canAccess(chamado, req.user)) return res.status(403).json({ message: 'Acesso negado a este chamado.' });
    const commentResult = await comentarios.findByChamadoId(chamado.id);
    return res.json({ chamado: { ...chamado, comentarios: commentResult.rows } });
  } catch (error) { return next(error); }
}

/**
 * Atualiza status e atribuição de um chamado (somente técnicos).
 * @async
 * @param {import('express').Request} req Requisição com status.
 * @param {import('express').Response} res Resposta HTTP.
 * @returns {Promise<void>} Chamado atualizado.
 * @throws {Error} Quando a atualização falhar.
 */
async function update(req, res, next) {
  try {
    const existing = await chamados.findById(req.params.id);
    if (!existing.rowCount) return res.status(404).json({ message: 'Chamado não encontrado.' });
    const tecnicoId = req.body.status === 'Em Atendimento' ? req.user.sub : undefined;
    const result = await chamados.update(req.params.id, { status: req.body.status, tecnicoId });
    return res.json({ chamado: result.rows[0] });
  } catch (error) { return next(error); }
}

async function addComment(req, res, next) {
  try {
    const ticketResult = await chamados.findById(req.params.id);
    const chamado = ticketResult.rows[0];
    if (!chamado) return res.status(404).json({ message: 'Chamado não encontrado.' });
    if (!canAccess(chamado, req.user)) return res.status(403).json({ message: 'Acesso negado a este chamado.' });
    const result = await comentarios.create({ chamadoId: chamado.id, autorId: req.user.sub, mensagem: req.body.mensagem });
    return res.status(201).json({ comentario: result.rows[0] });
  } catch (error) { return next(error); }
}

module.exports = { create, list, getById, update, addComment };
