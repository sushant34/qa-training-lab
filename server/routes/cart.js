const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const { getCartWithProducts, calculateTotal } = require('../services/cartService');
const tryCatch = require('../middleware/tryCatch');

const router = express.Router();

router.get('/', authenticateToken, tryCatch(async (req, res) => {
  const cartItems = getCartWithProducts(req.user.id);
  const total = calculateTotal(cartItems);
  res.json({ items: cartItems, total });
}));

router.post('/add', authenticateToken, tryCatch(async (req, res) => {
  const { product_id, quantity } = req.body;

  if (!product_id) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  // BUG-005 & BUG-006: Cart allows quantity 0 and negative quantity
  const qty = quantity || 1;

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const existingItem = db.prepare(
    'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?'
  ).get(req.user.id, product_id);

  if (existingItem) {
    // BUG-005: When adding same product, quantity can become 0 or negative
    const newQuantity = existingItem.quantity + (qty || 0);
    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(newQuantity, existingItem.id);
  } else {
    db.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)').run(
      req.user.id,
      product_id,
      qty
    );
  }

  const cartItems = getCartWithProducts(req.user.id);
  const total = calculateTotal(cartItems);
  res.json({ items: cartItems, total });
}));

router.put('/update', authenticateToken, tryCatch(async (req, res) => {
  const { product_id, quantity } = req.body;

  if (!product_id || quantity === undefined) {
    return res.status(400).json({ error: 'Product ID and quantity are required' });
  }

  // BUG-006: Cart allows negative quantity
  if (quantity < 0) {
    // This check is intentionally missing - BUG-006
  }

  // BUG-005: Cart allows quantity 0
  // This check is intentionally missing - BUG-005

  const existingItem = db.prepare(
    'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?'
  ).get(req.user.id, product_id);

  if (!existingItem) {
    return res.status(404).json({ error: 'Cart item not found' });
  }

  if (quantity === 0) {
    db.prepare('DELETE FROM cart_items WHERE id = ?').run(existingItem.id);
  } else {
    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(quantity, existingItem.id);
  }

  const cartItems = getCartWithProducts(req.user.id);
  const total = calculateTotal(cartItems);
  res.json({ items: cartItems, total });
}));

router.delete('/remove/:productId', authenticateToken, tryCatch(async (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?').run(
    req.user.id,
    req.params.productId
  );

  const cartItems = getCartWithProducts(req.user.id);
  const total = calculateTotal(cartItems);
  res.json({ items: cartItems, total });
}));

router.delete('/clear', authenticateToken, tryCatch(async (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
  res.json({ items: [], total: 0 });
}));

module.exports = router;
