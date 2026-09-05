import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWishlist, removeFromWishlist, addToCart } from '../services/api';
import { WishlistItem } from '../types';
import toast from 'react-hot-toast';
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react';

const WishlistPage: React.FC = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const data = await getWishlist();
      setItems(data);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: number) => {
    try {
      await removeFromWishlist(productId);
      setItems(prev => prev.filter(item => item.product_id !== productId));
      toast.success('Removed from wishlist');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove');
    }
  };

  const handleAddToCart = async (product: WishlistItem) => {
    try {
      await addToCart(product.product_id);
      toast.success(`${product.name} added to cart`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">My Wishlist</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Products you've saved for later.</p>
      </div>

      {items.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
            <Heart size={40} className="text-slate-300 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">Your wishlist is empty</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Save products you love for later.</p>
          <Link to="/ecommerce/shop" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="card hover:shadow-md transition-shadow">
              <Link to={`/ecommerce/products/${item.product_id}`}>
                <div className="aspect-square bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-800/50 dark:to-indigo-900/50 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package size={32} className="text-slate-300 dark:text-slate-600" />
                  )}
                </div>
              </Link>
              <div className="space-y-2">
                <span className="inline-block px-2 py-0.5 text-xs font-medium bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full">{item.category}</span>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">{item.name}</h3>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">${item.price.toFixed(2)}</p>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => handleAddToCart(item)} className="btn btn-primary btn-sm flex-1" disabled={item.stock === 0}>
                    <ShoppingCart size={14} />
                    {item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                  <button onClick={() => handleRemove(item.product_id)} className="btn btn-outline btn-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-200 dark:hover:border-red-800">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
