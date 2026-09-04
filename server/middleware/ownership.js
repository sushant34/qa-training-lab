const db = require('../models/database');
const AppError = require('./AppError');

const ownershipChecks = {
  testCase: {
    table: 'test_cases',
    ownerField: 'user_id',
  },
  bugReport: {
    table: 'bug_reports',
    ownerField: 'user_id',
  },
};

const requireOwnershipOrTrainer = (entityType) => {
  return (req, res, next) => {
    const config = ownershipChecks[entityType];
    if (!config) {
      return next(new AppError(`Unknown entity type: ${entityType}`, 500));
    }

    const entityId = req.params.id;
    const entity = db.prepare(`SELECT * FROM ${config.table} WHERE id = ?`).get(entityId);

    if (!entity) {
      return next(new AppError(`${entityType} not found`, 404));
    }

    if (req.user.role === 'TRAINER') {
      req.entity = entity;
      return next();
    }

    if (entity[config.ownerField] !== req.user.id) {
      return next(new AppError('Access denied', 403));
    }

    req.entity = entity;
    next();
  };
};

module.exports = { requireOwnershipOrTrainer };
