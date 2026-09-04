const logger = require('../config/logger');
const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational !== false;

  if (!isOperational) {
    logger.error({ err, requestId: req.id }, 'Unhandled error');
  } else {
    logger.warn({ err: { message: err.message, statusCode }, requestId: req.id }, 'Operational error');
  }

  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    ...(env.isDevelopment && !isOperational && { stack: err.stack }),
  });
};

module.exports = errorHandler;
