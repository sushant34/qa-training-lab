const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const pinoHttp = require('pino-http');
const db = require('./models/database');
const env = require('./config/env');
const logger = require('./config/logger');
const securityMiddleware = require('./middleware/security');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./middleware/AppError');

dotenv.config();

const app = express();
const PORT = env.PORT;

const httpLogger = pinoHttp({
  logger,
  redact: ['req.headers.authorization'],
});

securityMiddleware(app);

app.use(httpLogger);
app.use(cors({
  origin: env.CORS_ORIGINS,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const requirementRoutes = require('./routes/requirements');
const testCaseRoutes = require('./routes/testCases');
const executionRoutes = require('./routes/executions');
const bugReportRoutes = require('./routes/bugReports');
const groundTruthRoutes = require('./routes/groundTruth');
const evaluationRoutes = require('./routes/evaluations');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout');
const ecommerceAuthRoutes = require('./routes/ecommerceAuth');
const wishlistRoutes = require('./routes/wishlist');
const reviewRoutes = require('./routes/reviews');
const couponRoutes = require('./routes/coupons');
const savedRoutes = require('./routes/saved');
const traceabilityRoutes = require('./routes/traceability');
const coverageRoutes = require('./routes/coverage');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/requirements', requirementRoutes);
app.use('/api/test-cases', testCaseRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/bug-reports', bugReportRoutes);
app.use('/api/ground-truth', groundTruthRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/ecommerce/auth', ecommerceAuthRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/traceability', traceabilityRoutes);
app.use('/api/coverage', coverageRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
});

app.use(errorHandler);

if (env.isProduction) {
  app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
  });
}

const server = app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  if (env.isDevelopment) {
    logger.info('Demo accounts:');
    logger.info('  Trainer: trainer / April@2025');
    logger.info('  Intern: intern / intern123');
  }
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    db.close();
    logger.info('Database connection closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    db.close();
    logger.info('Database connection closed.');
    process.exit(0);
  });
});

module.exports = app;
