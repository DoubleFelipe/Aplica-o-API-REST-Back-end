const express = require('express');
const { body, param, query } = require('express-validator');
const controller = require('../controllers/chamadoController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/errorMiddleware');

const router = express.Router();
const statuses = ['Aberto', 'Em Atendimento', 'Concluído'];
const priorities = ['Baixa', 'Média', 'Alta'];
const id = param('id').isInt({ min: 1 }).toInt();

router.use(authenticate);
router.post('/', [body('titulo').trim().isLength({ min: 3, max: 160 }), body('descricao').trim().isLength({ min: 5, max: 5000 }), body('prioridade').optional().isIn(priorities), validateRequest], controller.create);
router.get('/', [query('status').optional().isIn(statuses), validateRequest], controller.list);
router.get('/:id', [id, validateRequest], controller.getById);
router.patch('/:id', [id, body('status').isIn(statuses), validateRequest, authorize('tecnico')], controller.update);
router.post('/:id/comentarios', [id, body('mensagem').trim().isLength({ min: 1, max: 3000 }), validateRequest], controller.addComment);

module.exports = router;
