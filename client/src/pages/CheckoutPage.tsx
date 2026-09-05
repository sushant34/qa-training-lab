import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, checkout } from '../services/api';
import { Cart, Coupon } from '../types';
import toast from 'react-hot-toast';
import { CheckCircle } from 'lucide-react';
import CouponInput from '../components/CouponInput';

const CheckoutPage: React.FC = () => {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discount, setDiscount] = useState(0);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const data = await getCart();
      setCart(data);
      if (data.items.length === 0) {
        navigate('/cart');
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCouponApply = (coupon: Coupon, discountAmount: number) => {
    setAppliedCoupon(coupon);
    setDiscount(discountAmount);
  };

  const handleCouponRemove = () => {
    setAppliedCoupon(null);
    setDiscount(0);
  };

  const finalTotal = Math.max(cart.total - discount, 0);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // BUG-008: Phone validation is missing (intentional)
    // Should require phone but doesn't

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      const result = await checkout({
        ...formData,
        coupon_code: appliedCoupon?.code,
      });
      setOrderId(result.order.id);
      setOrderComplete(true);
      toast.success('Order placed successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5 shadow-inner">
          <CheckCircle size={40} className="text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Order Confirmed! 🎉</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Your order <span className="font-mono font-semibold text-indigo-600">#{orderId}</span> has been placed successfully.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          Total: <span className="font-bold text-slate-800 dark:text-slate-200">${finalTotal.toFixed(2)}</span>
        </p>
        <button
          onClick={() => navigate('/ecommerce/shop')}
          className="btn btn-primary"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Checkout</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Enter your shipping information to complete your order.
        </p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Order Summary</h2>
        <div className="space-y-3">
          {cart.items.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                {item.name} x {item.quantity}
              </span>
              <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          {discount > 0 && (
            <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
              <span>Discount ({appliedCoupon?.code})</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t pt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span>${finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="card space-y-3">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl">
          <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium mb-1">Available Coupons</p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-800/50 text-indigo-700 dark:text-indigo-300 rounded text-xs font-mono">SAVE10</span>
            <span className="text-xs text-indigo-500 dark:text-indigo-400">10% off (min $25)</span>
            <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-800/50 text-indigo-700 dark:text-indigo-300 rounded text-xs font-mono">FLAT5</span>
            <span className="text-xs text-indigo-500 dark:text-indigo-400">$5 off (min $20)</span>
          </div>
        </div>
        <CouponInput
          onApply={handleCouponApply}
          onRemove={handleCouponRemove}
          appliedCoupon={appliedCoupon}
          orderTotal={cart.total}
        />
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Shipping Information</h2>

        <div className="form-group">
          <label className="label">Full Name *</label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className={`input-field ${errors.full_name ? 'input-error' : ''}`}
            placeholder="Enter your full name"
          />
          {errors.full_name && <p className="form-error">{errors.full_name}</p>}
        </div>

        <div className="form-group">
          <label className="label">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`input-field ${errors.email ? 'input-error' : ''}`}
            placeholder="Enter your email"
          />
          {errors.email && <p className="form-error">{errors.email}</p>}
        </div>

        <div className="form-group">
          <label className="label">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="input-field"
            placeholder="Enter your phone number (optional)"
          />
        </div>

        <div className="form-group">
          <label className="label">Address *</label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className={`input-field ${errors.address ? 'input-error' : ''}`}
            rows={3}
            placeholder="Enter your shipping address"
          />
          {errors.address && <p className="form-error">{errors.address}</p>}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/ecommerce/cart')}
            className="btn btn-outline flex-1"
          >
            Back to Cart
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary flex-1"
          >
            {submitting ? 'Processing...' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
