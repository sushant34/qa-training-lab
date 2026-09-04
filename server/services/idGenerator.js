const db = require('../models/database');

const generateSequentialId = (prefix, table, userId) => {
  const lastRecord = db.prepare(
    `SELECT ${prefix === 'TC' ? 'tc_id' : 'bug_id'} as last_id FROM ${table} WHERE user_id = ? ORDER BY id DESC LIMIT 1`
  ).get(userId);

  let nextNumber = 1;
  if (lastRecord && lastRecord.last_id) {
    const match = lastRecord.last_id.match(new RegExp(`${prefix}-(\\d+)`));
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  return `${prefix}-${String(nextNumber).padStart(3, '0')}`;
};

module.exports = { generateSequentialId };
