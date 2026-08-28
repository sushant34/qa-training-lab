import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, getCategories, addToCart } from '../services/api';
import { Product } from '../types';
import toast from 'react-hot-toast';
import { ShoppingCart, Search, Filter } from 'lucide-react';

const ShopPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, search]);

  const loadData = async () => {
    try {
      const [prods, cats] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const prods = await getProducts(selectedCategory || undefined, search || undefined);
      setProducts(prods);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product.id);
      toast.success(`${product.name} added to cart`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">E-Commerce Store</h1>
          <p className="text-slate-600 mt-1">
            Browse products and test the shopping experience.
          </p>
        </div>
        <button
          onClick={() => navigate('/ecommerce/cart')}
          className="btn btn-primary"
        >
          <ShoppingCart size={18} />
          View Cart
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input-field w-auto"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map(product => (
          <div key={product.id} className="card hover:shadow-md transition-shadow">
            <div className="aspect-square bg-slate-100 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-4xl">📦</span>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-medium text-blue-600">{product.category}</span>
              <h3 className="font-medium text-slate-900 line-clamp-2">{product.name}</h3>
              <p className="text-sm text-slate-500 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-lg font-bold text-slate-900">${product.price.toFixed(2)}</span>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="btn btn-primary btn-sm"
                >
                  <ShoppingCart size={14} />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500">No products found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
