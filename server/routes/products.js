const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const { category, search } = req.query;

  let query = 'SELECT * FROM products WHERE stock > 0';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    // BUG-004: Search returns unrelated products for some search terms
    // The search is case-sensitive and uses LIKE without wildcards
    query += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY name ASC';

  const products = db.prepare(query).all(...params);
  res.json(products);
});

router.get('/categories', authenticateToken, (req, res) => {
  const categories = db.prepare('SELECT DISTINCT category FROM products ORDER BY category ASC').all();
  res.json(categories.map(c => c.category));
});

router.get('/:id', authenticateToken, (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(product);
});

module.exports = router;
