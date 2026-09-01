const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const authRoutes = require('./routes/authRoutes');
const chamadoRoutes = require('./routes/chamadoRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();
const allowedOrigin = process.env.FRONTEND_URL;

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || (allowedOrigin && origin === allowedOrigin)) return callback(null, true);
    return callback(new Error('Origem não permitida por CORS.'));
  },
  methods: ['GET', 'POST', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '100kb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 200, standardHeaders: 'draft-8', legacyHeaders: false }));

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/chamados', chamadoRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
