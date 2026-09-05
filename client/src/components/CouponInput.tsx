import React, { useState } from 'react';
import { Tag, Check, X, Loader2 } from 'lucide-react';
import { validateCoupon } from '../services/api';
import { Coupon } from '../types';
import toast from 'react-hot-toast';

interface CouponInputProps {
  onApply: (coupon: Coupon, discount: number) => void;
  onRemove: () => void;
  appliedCoupon: Coupon | null;
  orderTotal: number;
}

const CouponInput: React.FC<CouponInputProps> = ({ onApply, onRemove, appliedCoupon, orderTotal }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setLoading(true);
    try {
      const coupon = await validateCoupon(code.trim());

      if (orderTotal < coupon.min_order_amount) {
        toast.error(`Minimum order amount is $${coupon.min_order_amount.toFixed(2)}`);
        return;
      }

      let discount = 0;
      if (coupon.discount_type === 'percentage') {
        discount = orderTotal * (coupon.discount_value / 100);
      } else {
        discount = Math.min(coupon.discount_value, orderTotal);
      }

      onApply(coupon, discount);
      setCode('');
      toast.success(`Coupon applied! ${coupon.discount_type === 'percentage' ? `${coupon.discount_value}% off` : `$${coupon.discount_value.toFixed(2)} off`}`);
    } catch (error) {
      toast.error('Invalid coupon code');
    } finally {
      setLoading(false);
    }
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
        <div className="flex items-center gap-2">
          <Check size={18} className="text-emerald-600 dark:text-emerald-400" />
          <span className="font-medium text-emerald-700 dark:text-emerald-300">
            {appliedCoupon.code}
          </span>
          <span className="text-sm text-emerald-600 dark:text-emerald-400">
            {appliedCoupon.discount_type === 'percentage'
              ? `${appliedCoupon.discount_value}% off`
              : `$${appliedCoupon.discount_value.toFixed(2)} off`}
          </span>
        </div>
        <button
          onClick={onRemove}
          className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 rounded-lg transition-colors"
          aria-label="Remove coupon"
        >
          <X size={16} className="text-emerald-600 dark:text-emerald-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Coupon code"
          className="input-field pl-9 py-2 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
        />
      </div>
      <button
        onClick={handleApply}
        disabled={loading || !code.trim()}
        className="btn btn-outline btn-sm"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
      </button>
    </div>
  );
};

export default CouponInput;
