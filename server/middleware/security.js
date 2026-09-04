const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const securityMiddleware = (app) => {
  app.use(helmet());

  const generalLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later' },
  });
  app.use('/api', generalLimiter);

  const authLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.AUTH_RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts, please try again later' },
  });
  app.use('/api/auth', authLimiter);
  app.use('/api/ecommerce/auth', authLimiter);
};

module.exports = securityMiddleware;
