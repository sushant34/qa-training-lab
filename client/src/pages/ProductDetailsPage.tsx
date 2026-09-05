import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProduct, addToCart, getRelatedProducts, checkWishlist, addToWishlist, removeFromWishlist, getProductReviews, createProductReview } from '../services/api';
import { Product, Review, ReviewStats } from '../types';
import toast from 'react-hot-toast';
import { ShoppingCart, Heart, ChevronRight, Star, Package } from 'lucide-react';

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({ count: 0, average: 0 });
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct(parseInt(id));
    }
  }, [id]);

  const loadProduct = async (productId: number) => {
    try {
      setLoading(true);
      const [prod, relatedProd, wishlistStatus, reviewData] = await Promise.all([
        getProduct(productId),
        getRelatedProducts(productId),
        checkWishlist(productId).catch(() => ({ isWishlisted: false })),
        getProductReviews(productId).catch(() => ({ reviews: [], stats: { count: 0, average: 0 } })),
      ]);
      setProduct(prod);
      setRelated(relatedProd);
      setIsWishlisted(wishlistStatus.isWishlisted);
      setReviews(reviewData.reviews);
      setReviewStats(reviewData.stats);
    } catch (error) {
      toast.error('Product not found');
      navigate('/ecommerce/shop');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart(product.id, quantity);
      toast.success(`${product.name} added to cart`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    try {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(product.id);
        setIsWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update wishlist');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSubmittingReview(true);
    try {
      const review = await createProductReview(product.id, reviewForm);
      setReviews(prev => [review, ...prev]);
      setReviewStats(prev => ({
        count: prev.count + 1,
        average: (prev.average * prev.count + reviewForm.rating) / (prev.count + 1),
      }));
      setReviewForm({ rating: 5, title: '', comment: '' });
      toast.success('Review submitted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="space-y-8">
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link to="/ecommerce/shop" className="hover:text-indigo-600">Shop</Link>
        <ChevronRight size={14} />
        <span className="text-slate-900 dark:text-slate-100">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-800/50 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center overflow-hidden">
          {/* GT-032: Broken image not handled with fallback */}
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <Package size={80} className="text-slate-300 dark:text-slate-600" />
          )}
        </div>

        <div className="space-y-6">
          <div>
            <span className="inline-block px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-full mb-3">
              {product.category}
            </span>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{product.name}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">{product.description}</p>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">${product.price.toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-2">
            {product.stock > 0 ? (
              <span className="text-sm text-emerald-600 font-medium">{product.stock} in stock</span>
            ) : (
              <span className="text-sm text-red-600 font-medium">Out of stock</span>
            )}
          </div>

          {reviewStats.count > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} size={16} className={star <= Math.round(reviewStats.average) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'} />
                ))}
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">{reviewStats.average.toFixed(1)} ({reviewStats.count} reviews)</span>
            </div>
          )}

          {product.stock > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">-</button>
                <span className="px-4 py-2 font-semibold min-w-[48px] text-center">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">+</button>
              </div>
              <button onClick={handleAddToCart} className="btn btn-primary flex-1">
                <ShoppingCart size={18} />
                Add to Cart
              </button>
              <button onClick={handleToggleWishlist} className={`p-3 rounded-xl border transition-colors ${isWishlisted ? 'bg-red-50 border-red-200 text-red-500' : 'border-slate-300 dark:border-slate-600 text-slate-400 hover:text-red-400'}`}>
                <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="card">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Customer Reviews</h2>

        <form onSubmit={handleSubmitReview} className="mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-4">
          <div>
            <label className="label">Rating *</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: star })}>
                  <Star size={24} className={star <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Title</label>
            <input type="text" value={reviewForm.title} onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })} className="input-field" placeholder="Review title (optional)" />
          </div>
          <div>
            <label className="label">Comment</label>
            <textarea value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} className="input-field" rows={3} placeholder="Write your review (optional)" />
          </div>
          <button type="submit" disabled={submittingReview} className="btn btn-primary btn-sm">
            {submittingReview ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>

        {reviews.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-8">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="border-b border-slate-100 dark:border-slate-700 pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} size={14} className={star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'} />
                    ))}
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{review.author_name}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
                {review.title && <p className="font-medium text-slate-900 dark:text-slate-100">{review.title}</p>}
                {review.comment && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map(item => (
              <Link key={item.id} to={`/ecommerce/products/${item.id}`} className="card hover:shadow-lg transition-all hover:-translate-y-0.5 overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-800/50 dark:to-indigo-900/30 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package size={32} className="text-slate-300 dark:text-slate-600" />
                  )}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm line-clamp-2">{item.name}</h3>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">${item.price.toFixed(2)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;
