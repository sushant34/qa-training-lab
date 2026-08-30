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
          <p className="text-slate-500 mt-1">
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

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400 hidden sm:block" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field w-full sm:w-auto"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {products.map(product => (
          <div key={product.id} className="card group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
            <div className="aspect-square bg-gradient-to-br from-slate-50 to-indigo-50 rounded-xl mb-4 flex items-center justify-center overflow-hidden group-hover:scale-[1.02] transition-transform">
              {(() => {
                // GT-025: Wireless Mouse (ID 4) shows headphones image
                const imageUrl = product.id === 4
                  ? 'https://placehold.co/400x400/7c3aed/ffffff?text=Headphones'
                  : product.image_url;
                return imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl">📦</span>
                );
              })()}
            </div>
            <div className="space-y-2">
              {/* GT-021: Laptop Backpack (ID 5) shows wrong category */}
              <span className="inline-block px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-full">
                {product.id === 5 ? 'Electronics' : product.category}
              </span>
              <h3 className="font-semibold text-slate-900 line-clamp-2">{product.name}</h3>
              {/* GT-022: Bluetooth Speaker (ID 8) shows wrong description */}
              <p className="text-sm text-slate-500 line-clamp-2">
                {product.id === 8
                  ? 'Compact portable speaker with rich bass and waterproof design.'
                  : product.description
                }
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div>
                  {/* GT-024: Notebook Set (ID 15) shows $0.00 */}
                  <span className="text-lg font-bold text-slate-900">
                    ${product.id === 15 ? '0.00' : product.price.toFixed(2)}
                  </span>
                  <p className="text-xs text-emerald-600">{product.stock} in stock</p>
                </div>
                {/* GT-023: Webcam HD (ID 10) has no Add to Cart button */}
                {product.id !== 10 && (
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="btn btn-primary btn-sm"
                  >
                    <ShoppingCart size={14} />
                    Add
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">No products found</h3>
          <p className="text-slate-500">Try adjusting your search or category filter.</p>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
