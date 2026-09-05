import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getProducts, getCategories, addToCart, getWishlist, addToWishlist, removeFromWishlist, getRecentlyViewed } from '../services/api';
import { Product, PaginatedProducts, RecentlyViewedItem } from '../types';
import toast from 'react-hot-toast';
import { ShoppingCart, Search, Filter, Heart, ChevronLeft, ChevronRight, DollarSign, Package } from 'lucide-react';

const ShopPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [debouncedMinPrice, setDebouncedMinPrice] = useState('');
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState('');
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
    loadWishlist();
    loadRecentlyViewed();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, search, debouncedMinPrice, debouncedMaxPrice]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMinPrice(minPrice);
      setDebouncedMaxPrice(maxPrice);
    }, 300);
    return () => clearTimeout(timer);
  }, [minPrice, maxPrice]);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, search, page, debouncedMinPrice, debouncedMaxPrice]);

  const loadCategories = async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadWishlist = async () => {
    try {
      const items = await getWishlist();
      setWishlistIds(new Set(items.map(i => i.product_id)));
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    }
  };

  const loadRecentlyViewed = async () => {
    try {
      const items = await getRecentlyViewed();
      setRecentlyViewed(items);
    } catch (error) {
      console.error('Failed to load recently viewed:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data: PaginatedProducts = await getProducts(
        selectedCategory || undefined,
        search || undefined,
        page,
        12,
        debouncedMinPrice ? parseFloat(debouncedMinPrice) : undefined,
        debouncedMaxPrice ? parseFloat(debouncedMaxPrice) : undefined,
      );
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product.id);
      toast.success(`${product.name} added to cart`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (wishlistIds.has(productId)) {
        await removeFromWishlist(productId);
        setWishlistIds(prev => { const next = new Set(prev); next.delete(productId); return next; });
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(productId);
        setWishlistIds(prev => new Set(prev).add(productId));
        toast.success('Added to wishlist');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update wishlist');
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">E-Commerce Store</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {total} product{total !== 1 ? 's' : ''} found. Browse and test the shopping experience.
          </p>
        </div>
        <button onClick={() => navigate('/ecommerce/cart')} className="btn btn-primary">
          <ShoppingCart size={18} />
          View Cart
        </button>
      </div>

      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400 dark:text-slate-500 hidden sm:block" />
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

        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-slate-400 dark:text-slate-500" />
            <span className="text-sm text-slate-500 dark:text-slate-400">Price:</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="input-field w-24"
              min="0"
            />
            <span className="text-slate-400 dark:text-slate-500">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="input-field w-24"
              min="0"
            />
          </div>
          {(minPrice || maxPrice) && (
            <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {products.map(product => (
          <Link
            key={product.id}
            to={`/ecommerce/products/${product.id}`}
            className="card group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
          >
            <div className="aspect-square bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-700 dark:to-indigo-900/30 rounded-xl mb-4 flex items-center justify-center overflow-hidden group-hover:scale-[1.02] transition-transform relative">
              {(() => {
                const imageUrl = product.id === 4
                  ? 'https://placehold.co/400x400/7c3aed/ffffff?text=Headphones'
                  : product.image_url;
                return imageUrl ? (
                  <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <Package size={48} className="text-slate-300 dark:text-slate-600" />
                );
              })()}
              <button
                onClick={(e) => handleToggleWishlist(e, product.id)}
                className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${wishlistIds.has(product.id) ? 'bg-red-50 dark:bg-red-900/40 text-red-500 dark:text-red-400' : 'bg-white/80 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 hover:text-red-400 dark:hover:text-red-400'}`}
              >
                <Heart size={16} fill={wishlistIds.has(product.id) ? 'currentColor' : 'none'} />
              </button>
              {product.stock === 0 && (
                <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                  Out of Stock
                </span>
              )}
              {product.stock > 0 && product.stock < 5 && (
                <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-medium bg-amber-500 text-white rounded-full">
                  Low Stock
                </span>
              )}
            </div>
            <div className="space-y-2">
              <span className="inline-block px-2 py-0.5 text-xs font-medium bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full">
                {product.id === 5 ? 'Electronics' : product.category}
              </span>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">{product.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                {product.id === 8
                  ? 'Compact portable speaker with rich bass and waterproof design.'
                  : product.description
                }
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                <div>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    ${product.id === 15 ? '0.00' : product.price.toFixed(2)}
                  </span>
                  <p className={`text-xs ${product.stock === 0 ? 'text-red-600 dark:text-red-400' : product.stock < 5 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {product.stock} in stock
                  </p>
                </div>
                {product.id !== 10 && (
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="btn btn-primary btn-sm"
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart size={14} />
                    {product.stock === 0 ? 'Out' : 'Add'}
                  </button>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">No products found</h3>
          <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or filters.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="btn btn-outline btn-sm"
          >
            <ChevronLeft size={16} />
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="btn btn-outline btn-sm"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {recentlyViewed.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Recently Viewed</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {recentlyViewed.map((item) => (
              <Link
                key={item.product_id}
                to={`/ecommerce/products/${item.product_id}`}
                className="flex-shrink-0 w-48 card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
              >
                <div className="aspect-square bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-700 dark:to-indigo-900/30 rounded-xl mb-3 flex items-center justify-center overflow-hidden relative">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package size={36} className="text-slate-300 dark:text-slate-600" />
                  )}
                  {item.stock === 0 && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                      Out of Stock
                    </span>
                  )}
                  {item.stock > 0 && item.stock < 5 && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-medium bg-amber-500 text-white rounded-full">
                      Low Stock
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm text-slate-900 dark:text-slate-100 line-clamp-2">{item.name}</h3>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">${item.price.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
