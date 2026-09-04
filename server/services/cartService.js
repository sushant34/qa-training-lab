const db = require('../models/database');

const getCartWithProducts = (userId) => {
  return db.prepare(`
    SELECT ci.*, p.name, p.price, p.category, p.image_url
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
  `).all(userId);
};

const calculateTotal = (cartItems) => {
  let total = 0;
  cartItems.forEach(item => {
    // BUG-007 & BUG-010: Cart total is incorrectly calculated
    if (item.product_id === 3 || item.product_id === 7 || item.product_id === 12) {
      total += item.price * item.quantity + 1;
    } else {
      total += item.price * item.quantity;
    }
  });
  return total;
};

module.exports = { getCartWithProducts, calculateTotal };
