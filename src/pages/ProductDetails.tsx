import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, ShoppingCart, ShieldCheck, Truck, RotateCcw, ArrowLeft, Heart, Share2, MessageSquare } from 'lucide-react';
import { useCart } from '@/src/context/CartContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { useAuth } from '@/src/context/AuthContext';
import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/src/firebase';
import { cn } from '@/src/lib/utils';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      if (!id) return;
      try {
        // Fetch Product
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        }

        // Fetch Reviews
        const reviewsQuery = query(collection(db, 'reviews'), where('productId', '==', id));
        const reviewsSnap = await getDocs(reviewsQuery);
        const fetchedReviews = reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort by newest first
        fetchedReviews.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setReviews(fetchedReviews);

        // Check if user purchased this product
        if (user) {
          const ordersQuery = query(collection(db, 'orders'), where('buyerId', '==', user.uid));
          const ordersSnap = await getDocs(ordersQuery);
          let purchased = false;
          ordersSnap.forEach(orderDoc => {
            const orderData = orderDoc.data();
            if (orderData.items && orderData.items.some((item: any) => item.productId === id)) {
              purchased = true;
            }
          });
          setHasPurchased(purchased);
        }

      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndReviews();
  }, [id, user]);

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Add the selected quantity
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !profile) return;
    
    setSubmittingReview(true);
    try {
      const newReview = {
        productId: id,
        userId: user.uid,
        userName: profile.name || 'User',
        rating: reviewRating,
        text: reviewText,
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'reviews'), newReview);
      
      // Update local reviews
      const updatedReviews = [newReview, ...reviews];
      setReviews(updatedReviews);
      
      // Calculate new average rating
      const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
      const newAverage = Number((totalRating / updatedReviews.length).toFixed(1));
      
      // Update product document
      await updateDoc(doc(db, 'products', id), {
        rating: newAverage,
        reviews: updatedReviews.length
      });
      
      // Update local product state
      setProduct((prev: any) => ({
        ...prev,
        rating: newAverage,
        reviews: updatedReviews.length
      }));
      
      setReviewText('');
      setReviewRating(5);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <button onClick={() => navigate('/explore')} className="text-indigo-600 font-bold hover:underline">
          Back to Explore
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Image Gallery */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="aspect-square overflow-hidden rounded-3xl bg-gray-100 border border-gray-100">
            <img 
              src={product.images?.[0] || product.image || "https://picsum.photos/seed/placeholder/600/600"} 
              alt={product.name} 
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-xl bg-gray-100 overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-600 transition-all">
                <img src={`https://picsum.photos/seed/${product.id + i}/200/200`} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-600">
                {product.category}
              </span>
              <div className="flex gap-2">
                <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                  <Heart className="h-5 w-5 text-gray-400" />
                </button>
                <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                  <Share2 className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={cn("h-4 w-4", i <= Math.floor(product.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-200")} />
                ))}
                <span className="ml-2 text-sm font-bold text-gray-900">{product.rating || 0}</span>
              </div>
              <span className="text-sm text-gray-400">|</span>
              <span className="text-sm text-gray-500 font-medium">{product.reviews || 0} verified reviews</span>
            </div>
            <p className="text-3xl font-black text-indigo-600 mb-8">{product.price} {t('product.price')}</p>
            <p className="text-gray-600 leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Additional Details */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {product.color && (
                <div>
                  <p className="text-sm font-bold text-gray-900">{t('product.color')}</p>
                  <p className="text-sm text-gray-600">{product.color}</p>
                </div>
              )}
              {product.size && (
                <div>
                  <p className="text-sm font-bold text-gray-900">{t('product.size')}</p>
                  <p className="text-sm text-gray-600">{product.size}</p>
                </div>
              )}
              {product.condition && (
                <div>
                  <p className="text-sm font-bold text-gray-900">{t('product.condition')}</p>
                  <p className="text-sm text-gray-600">
                    {product.condition === 'New' ? t('product.condition.new') : 
                     product.condition === 'Used' ? t('product.condition.used') : 
                     t('product.condition.refurbished')}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-gray-900">{t('product.stock')}</p>
                <p className="text-sm text-gray-600">{product.stock > 0 ? `${product.stock} available` : t('product.outOfStock')}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-10">
            {product.stock > 0 && (
              <div className="flex items-center gap-4 mb-4">
                <label className="text-sm font-bold text-gray-900">{t('product.quantity')}:</label>
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-l-lg"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-sm font-bold text-gray-900 border-x border-gray-200">
                    {quantity}
                  </span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-r-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
            <button 
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="w-full rounded-full bg-indigo-600 py-5 text-lg font-bold text-white hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="h-6 w-6" /> {product.stock > 0 ? t('product.addToCart') : t('product.outOfStock')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-gray-100">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center">
                <Truck className="h-5 w-5 text-indigo-600" />
              </div>
              <p className="text-xs font-bold text-gray-900">Fast Delivery</p>
              <p className="text-[10px] text-gray-500">Across Ethiopia</p>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center">
                <RotateCcw className="h-5 w-5 text-indigo-600" />
              </div>
              <p className="text-xs font-bold text-gray-900">Verified Sellers</p>
              <p className="text-[10px] text-gray-500">Quality guaranteed</p>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-indigo-600" />
              </div>
              <p className="text-xs font-bold text-gray-900">Secure Payment</p>
              <p className="text-[10px] text-gray-500">Cash on delivery available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-20 border-t border-gray-100 pt-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-indigo-600" />
            Customer Reviews
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Review Form */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Write a Review</h3>
              
              {!user ? (
                <div className="text-center py-6">
                  <p className="text-gray-600 mb-4">Please log in to leave a review.</p>
                  <button 
                    onClick={() => navigate('/login')}
                    className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition-all"
                  >
                    Log In
                  </button>
                </div>
              ) : !hasPurchased ? (
                <div className="text-center py-6">
                  <p className="text-gray-600">You must purchase this product before leaving a review.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Rating</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star className={cn("h-8 w-8", star <= reviewRating ? "text-yellow-400 fill-current" : "text-gray-300")} />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Your Review</label>
                    <textarea
                      required
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={4}
                      className="w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                      placeholder="What did you like or dislike?"
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={submittingReview}
                    className="w-full rounded-full bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-6">
            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-3xl border border-gray-100">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-500">Be the first to review this product!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={review.id} 
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-bold text-sm">
                          {review.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{review.userName}</p>
                        <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={cn("h-4 w-4", star <= review.rating ? "text-yellow-400 fill-current" : "text-gray-200")} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{review.text}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
