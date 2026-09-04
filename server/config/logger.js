const pino = require('pino');
const env = require('./env');

const logger = pino({
  level: env.LOG_LEVEL,
  redact: ['req.headers.authorization', 'req.body.password', 'req.body.new_password', 'req.body.current_password'],
  transport: env.isDevelopment
    ? { target: 'pino/file', options: { destination: 1 } }
    : undefined,
});

module.exports = logger;
