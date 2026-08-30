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
        <div className="card text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={40} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Your cart is empty</h3>
          <p className="text-slate-500 mb-6">Add some products to get started.</p>
          <button
            onClick={() => navigate('/ecommerce/shop')}
            className="btn btn-primary"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map(item => (
              <div key={item.id} className="card flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-50 to-indigo-50 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">📦</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{item.name}</h3>
                  <p className="text-sm text-slate-500">{item.category}</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-2 py-1">
                  <button
                    onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-lg transition-colors"
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={15} />
                  </button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-lg transition-colors"
                  >
                    <Plus size={15} />
                  </button>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                  <button
                    onClick={() => handleRemove(item.product_id)}
                    className="text-red-500 hover:text-red-700 mt-1 p-1 -mr-1"
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="card h-fit lg:sticky lg:top-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm mb-4">
              {cart.items.map(item => (
                <div key={item.id} className="flex justify-between text-slate-600">
                  <span className="truncate pr-2">{item.name} × {item.quantity}</span>
                  <span className="font-medium shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="text-2xl font-bold text-indigo-600">${cart.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate('/ecommerce/shop')}
                className="btn btn-outline w-full"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => navigate('/ecommerce/checkout')}
                className="btn btn-primary w-full py-3"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
