import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeFromCart } from '../services/api';
import { Cart } from '../types';
import toast from 'react-hot-toast';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

const CartPage: React.FC = () => {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const data = await getCart();
      setCart(data);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId: number, newQuantity: number) => {
    try {
      const data = await updateCartItem(productId, newQuantity);
      setCart(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update cart');
    }
  };

  const handleRemove = async (productId: number) => {
    try {
      const data = await removeFromCart(productId);
      setCart(data);
      toast.success('Item removed from cart');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove item');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Shopping Cart</h1>
        <p className="text-slate-600 mt-1">
          Review your items and proceed to checkout.
        </p>
      </div>

      {cart.items.length === 0 ? (
        <div className="card text-center py-12">
          <ShoppingBag size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">Your cart is empty</p>
          <button
            onClick={() => navigate('/ecommerce/shop')}
            className="btn btn-primary mt-4"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cart.items.map(item => (
              <div key={item.id} className="card flex items-center gap-4">
                <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900">{item.name}</h3>
                  <p className="text-sm text-slate-500">{item.category}</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                    className="p-1 hover:bg-slate-100 rounded"
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                  <button
                    onClick={() => handleRemove(item.product_id)}
                    className="text-red-600 hover:text-red-700 mt-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold text-slate-900">Total:</span>
              <span className="font-bold text-slate-900">${cart.total.toFixed(2)}</span>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => navigate('/ecommerce/shop')}
                className="btn btn-outline flex-1"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => navigate('/ecommerce/checkout')}
                className="btn btn-primary flex-1"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
