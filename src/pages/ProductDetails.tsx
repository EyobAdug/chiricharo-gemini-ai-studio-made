import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, ShoppingCart, ShieldCheck, Truck, RotateCcw, ArrowLeft, Heart, Share2, MessageSquare, Award, Clock, Globe, Zap, CheckCircle2 } from 'lucide-react';
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
  const { user, profile, toggleWishlist } = useAuth();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewPhoto, setReviewPhoto] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        }

        const reviewsQuery = query(collection(db, 'reviews'), where('productId', '==', id));
        const reviewsSnap = await getDocs(reviewsQuery);
        const fetchedReviews = reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        fetchedReviews.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setReviews(fetchedReviews);

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

  const isWishlisted = profile?.wishlist?.includes(id || '');

  const handleFavorite = async () => {
    if (!user || !id) {
      navigate('/login');
      return;
    }
    await toggleWishlist(id);
  };

  const handleShare = async () => {
    const shareData = {
      title: product?.name || 'Chiricharo Product',
      text: `Check out ${product?.name} on Chiricharo!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
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
        photo: reviewPhoto,
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'reviews'), newReview);
      const updatedReviews = [newReview, ...reviews];
      setReviews(updatedReviews);
      
      const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
      const newAverage = Number((totalRating / updatedReviews.length).toFixed(1));
      
      await updateDoc(doc(db, 'products', id), {
        rating: newAverage,
        reviews: updatedReviews.length
      });
      
      setProduct((prev: any) => ({
        ...prev,
        rating: newAverage,
        reviews: updatedReviews.length
      }));
      
      setReviewText('');
      setReviewPhoto('');
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-brand-light">
        <div className="h-12 w-12 rounded-full border-4 border-brand-orange/30 border-t-brand-orange animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center bg-brand-light">
        <h1 className="text-4xl font-black text-gray-900 mb-4 italic">Product Not Documented</h1>
        <button onClick={() => navigate('/explore')} className="bg-brand-dark text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-brand-orange transition-all">
          Explore All Assets
        </button>
      </div>
    );
  }

  const galleryImages = [
    product.images?.[0] || product.image || "https://picsum.photos/seed/placeholder/600/600",
    `https://picsum.photos/seed/${product.id}a/600/600`,
    `https://picsum.photos/seed/${product.id}b/600/600`,
    `https://picsum.photos/seed/${product.id}c/600/600`,
  ];

  return (
    <div className="bg-brand-light min-h-screen pb-24">
      <div className="mx-auto max-w-[1400px] px-4 py-8 md:py-12">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-10 overflow-x-auto whitespace-nowrap pb-2">
           <Link to="/" className="hover:text-brand-orange">Home</Link>
           <ArrowLeft className="h-3 w-3 rotate-180" />
           <Link to="/explore" className="hover:text-brand-orange">Explore</Link>
           <ArrowLeft className="h-3 w-3 rotate-180" />
           <span className="text-gray-900 line-clamp-1">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Image Section */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-6">
            <div className="hidden md:flex flex-col gap-4 w-24 shrink-0">
               {galleryImages.map((img, i) => (
                 <button 
                   key={i} 
                   onClick={() => setActiveImage(i)}
                   className={cn(
                     "aspect-square rounded-2xl overflow-hidden bg-white border-2 transition-all p-1",
                     activeImage === i ? "border-brand-orange shadow-lg" : "border-gray-100 hover:border-gray-300"
                   )}
                 >
                    <img src={img} className="w-full h-full object-cover rounded-xl" alt="thumb" />
                 </button>
               ))}
            </div>
            
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="flex-1 aspect-square rounded-[3rem] bg-white border border-gray-100 shadow-premium overflow-hidden p-8"
            >
               <img 
                 src={galleryImages[activeImage]} 
                 alt={product.name} 
                 className="w-full h-full object-contain"
               />
            </motion.div>

            {/* Mobile Thumbnails */}
            <div className="flex md:hidden gap-3 overflow-x-auto pb-4">
              {galleryImages.map((img, i) => (
                 <button 
                   key={i} 
                   onClick={() => setActiveImage(i)}
                   className={cn("h-20 w-20 rounded-xl bg-white border p-1 shrink-0", activeImage === i ? "border-brand-orange" : "border-gray-200")}
                 >
                    <img src={img} className="w-full h-full object-cover rounded-lg" alt="thumb" />
                 </button>
               ))}
            </div>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-5 flex flex-col">
             <div className="sticky top-24">
               <div className="flex items-center justify-between mb-6">
                 <div className="px-4 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/10 text-brand-orange text-[10px] font-black uppercase tracking-widest">
                    Verified Global Asset
                 </div>
                 <div className="flex gap-2">
                    <button 
                      onClick={handleFavorite}
                      className={cn("p-3 rounded-full border transition-all", isWishlisted ? "bg-brand-orange text-white border-brand-orange shadow-lg" : "bg-white text-gray-400 border-gray-100 hover:text-brand-orange")}
                    >
                       <Heart className={cn("h-5 w-5", isWishlisted ? "fill-current" : "")} />
                    </button>
                    <button 
                      onClick={handleShare}
                      className="p-3 bg-white text-gray-400 border border-gray-100 rounded-full hover:text-brand-orange transition-all"
                    >
                       <Share2 className="h-5 w-5" />
                    </button>
                 </div>
               </div>

               <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-6 leading-[1.1]">{product.name}</h1>
               
               <div className="flex flex-wrap items-center gap-6 mb-10">
                  <div className="flex items-center gap-2">
                     <div className="flex text-brand-orange">
                        {[1, 2, 3, 4, 5].map((i) => (
                           <Star key={i} className={cn("h-4 w-4", i <= Math.floor(product.rating) ? "fill-current" : "opacity-20")} />
                        ))}
                     </div>
                     <span className="text-sm font-bold text-gray-900">{product.rating}</span>
                     <span className="text-sm text-gray-400">({product.reviews} Reports)</span>
                  </div>
                  <div className="h-4 w-px bg-gray-200"></div>
                  <div className="flex items-center gap-2">
                     <Award className="h-4 w-4 text-emerald-600" />
                     <span className="text-sm font-bold text-gray-900 uppercase tracking-widest text-[10px]">Best Seller in {product.category}</span>
                  </div>
               </div>

               <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm mb-10">
                  <div className="flex items-end justify-between mb-8">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Unit Price</span>
                        <span className="text-4xl font-black text-brand-dark">
                          {product.price.toLocaleString()} <span className="text-sm text-brand-orange font-bold">{t('product.price')}</span>
                        </span>
                     </div>
                     <div className="text-right">
                        <span className="text-[10px] font-black uppercase text-emerald-600 mb-1 block">In Stock</span>
                        <span className="text-sm font-bold text-gray-900">{product.stock} Units Available</span>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="flex items-center gap-4">
                        <div className="flex-1 flex items-center bg-gray-50 rounded-2xl p-2">
                           <button 
                             onClick={() => setQuantity(Math.max(1, quantity - 1))}
                             className="h-10 w-10 flex items-center justify-center rounded-xl bg-white text-gray-400 hover:text-brand-orange transition-all font-bold"
                           > - </button>
                           <span className="flex-1 text-center font-black text-gray-900">{quantity}</span>
                           <button 
                             onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                             className="h-10 w-10 flex items-center justify-center rounded-xl bg-white text-gray-400 hover:text-brand-orange transition-all font-bold"
                           > + </button>
                        </div>
                     </div>
                     
                     <div className="flex gap-4">
                        <button 
                          onClick={handleAddToCart}
                          disabled={product.stock <= 0}
                          className="flex-1 h-16 bg-brand-orange text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-xl shadow-brand-orange/30 hover:bg-brand-orange-hover active:scale-95 transition-all disabled:opacity-50"
                        >
                           <ShoppingCart className="h-5 w-5" />
                           {product.stock > 0 ? t('product.addToCart') : t('product.outOfStock')}
                        </button>
                        <button className="h-16 w-16 bg-brand-dark text-white rounded-2xl flex items-center justify-center hover:bg-brand-orange transition-all active:scale-95">
                           <MessageSquare className="h-6 w-6" />
                        </button>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-gray-100 flex items-center gap-3">
                     <Truck className="h-6 w-6 text-brand-orange" />
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-gray-400">Global Shipping</span>
                        <span className="text-xs font-bold text-gray-900">Standard & Express</span>
                     </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-gray-100 flex items-center gap-3">
                     <ShieldCheck className="h-6 w-6 text-brand-orange" />
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-gray-400">Trade Assurance</span>
                        <span className="text-xs font-bold text-gray-900">Payment Protection</span>
                     </div>
                  </div>
               </div>
             </div>
          </div>
        </div>

        {/* Extended Details Tabs */}
        <div className="mt-24">
           <div className="flex border-b border-gray-200 gap-12 mb-12">
              <button className="pb-6 border-b-2 border-brand-orange font-black text-lg text-gray-900 uppercase tracking-widest italic">Product Overview</button>
              <button className="pb-6 text-gray-400 font-bold text-lg uppercase tracking-widest hover:text-gray-900 transition-colors italic">Specifications</button>
              <button className="pb-6 text-gray-400 font-bold text-lg uppercase tracking-widest hover:text-gray-900 transition-colors italic">Shipping & Payment</button>
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              <div className="lg:col-span-8 space-y-12">
                 <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-6 italic">Strategic Advantages</h3>
                    <p className="text-gray-600 leading-[1.8] text-lg mb-8 max-w-4xl">
                       {product.description}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                          <p className="text-gray-600 text-sm font-medium">Enterprise-grade durability for professional workspaces.</p>
                       </div>
                       <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                          <p className="text-gray-600 text-sm font-medium">Compliant with global quality standards and certifications.</p>
                       </div>
                       <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                          <p className="text-gray-600 text-sm font-medium">Verified supply chain with 99% manufacturing accuracy.</p>
                       </div>
                       <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                          <p className="text-gray-600 text-sm font-medium">Premium materials sourced from elite regional providers.</p>
                       </div>
                    </div>
                 </div>

                 {/* Specifications Grid */}
                 <div className="bg-white rounded-[2rem] p-10 border border-gray-100 shadow-sm">
                    <h4 className="text-xl font-black text-gray-900 mb-8 italic">Technical Specifications</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                       {Object.entries({
                          "Product ID": product.id.slice(0, 8).toUpperCase(),
                          "Category": product.category,
                          "Material": "Industrial Strength Polymer / Metal",
                          "Origin": "Addis Ababa Hub",
                          "Warranty": "24 Months Global",
                          "Compliance": "ISO 9001 Certified",
                          ... (product.color ? { "Color": product.color } : {}),
                          ... (product.size ? { "Dimensions": product.size } : {})
                       }).map(([key, val], i) => (
                          <div key={i} className="flex justify-between items-center py-4 border-b border-gray-50 last:border-0">
                             <span className="text-xs font-black uppercase text-gray-400 tracking-widest">{key}</span>
                             <span className="text-sm font-bold text-gray-900 italic">{val}</span>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Sidebar Info */}
              <div className="lg:col-span-4 space-y-8">
                 <div className="bg-brand-dark rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <h4 className="text-2xl font-black mb-6 italic">Secure Your Order</h4>
                    <div className="space-y-6 mb-10">
                       <div className="flex items-start gap-4">
                          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                             <Clock className="h-5 w-5 text-brand-orange" />
                          </div>
                          <div>
                             <p className="font-bold text-sm">Dispatches within 24h</p>
                             <p className="text-white/40 text-xs">Priority global logistics</p>
                          </div>
                       </div>
                       <div className="flex items-start gap-4">
                          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                             <ShieldCheck className="h-5 w-5 text-brand-orange" />
                          </div>
                          <div>
                             <p className="font-bold text-sm">Payment Protection</p>
                             <p className="text-white/40 text-xs">Secure enterprise escrow</p>
                          </div>
                       </div>
                    </div>
                    <button className="w-full h-14 bg-white text-brand-dark rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-brand-orange hover:text-white transition-all transform group-hover:-translate-y-1">
                       Contact Expert
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* Reviews Redesign */}
        <div className="mt-32">
           <div className="flex items-center justify-between mb-16">
              <div>
                 <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter italic">Intelligence Reports</h2>
                 <p className="text-gray-500 font-medium mt-2">Authentic feedback from verified corporate buyers.</p>
              </div>
              <div className="hidden md:flex flex-col items-end">
                 <div className="text-4xl font-black text-brand-dark">{product.rating}</div>
                 <div className="flex text-brand-orange">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className={cn("h-3 w-3", i <= Math.floor(product.rating) ? "fill-current" : "opacity-20")} />
                    ))}
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              {/* Review Sidebar */}
              <div className="lg:col-span-4 h-fit">
                 <div className="bg-white rounded-[2rem] p-10 border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-black mb-6 italic">Submit Intelligence</h3>
                    {!user ? (
                      <button onClick={() => navigate('/login')} className="w-full h-12 bg-gray-900 text-white rounded-xl font-bold text-sm">Login to Authorize</button>
                    ) : !hasPurchased ? (
                      <p className="text-gray-500 text-sm font-medium leading-relaxed bg-brand-light p-4 rounded-xl border border-gray-100">Only verified purchasers of this asset can submit intelligence reports.</p>
                    ) : (
                      <form onSubmit={handleSubmitReview} className="space-y-6">
                         <div>
                            <div className="flex gap-2">
                               {[1, 2, 3, 4, 5].map(s => (
                                 <button key={s} type="button" onClick={() => setReviewRating(s)}>
                                    <Star className={cn("h-6 w-6", s <= reviewRating ? "text-brand-orange fill-current" : "text-gray-200")} />
                                 </button>
                               ))}
                            </div>
                         </div>
                         <textarea 
                           className="w-full bg-brand-light border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-brand-orange/20 outline-none min-h-[120px]"
                           placeholder="Describe your operational experience..."
                           value={reviewText}
                           onChange={(e) => setReviewText(e.target.value)}
                         />
                         <input 
                           type="text" 
                           placeholder="Optional Intelligence Image URL"
                           className="w-full bg-brand-light border-none rounded-xl p-4 text-xs font-medium focus:ring-2 focus:ring-brand-orange/20 outline-none"
                           value={reviewPhoto}
                           onChange={(e) => setReviewPhoto(e.target.value)}
                         />
                         <button 
                           type="submit" 
                           disabled={submittingReview}
                           className="w-full h-14 bg-brand-orange text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-orange/20"
                         >
                            {submittingReview ? "Processing..." : "Deploy Report"}
                         </button>
                      </form>
                    )}
                 </div>
              </div>

              {/* Review List */}
              <div className="lg:col-span-8 space-y-8">
                 {reviews.length === 0 ? (
                    <div className="p-20 text-center bg-white rounded-[3rem] border border-gray-100 italic font-medium text-gray-400">
                       No field intelligence reports currently available for this asset.
                    </div>
                 ) : (
                    reviews.map((rev, i) => (
                       <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={i} 
                        className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm group hover:shadow-premium transition-all"
                       >
                          <div className="flex items-center justify-between mb-8">
                             <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center font-black text-gray-400">
                                   {rev.userName.slice(0, 1).toUpperCase()}
                                </div>
                                <div>
                                   <h4 className="font-black text-gray-900 italic">{rev.userName}</h4>
                                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Verified Logistics Partner</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <div className="flex text-brand-orange mb-1">
                                   {[1, 2, 3, 4, 5].map(s => <Star key={s} className={cn("h-3 w-3", s <= rev.rating ? "fill-current" : "opacity-20")} />)}
                                </div>
                                <time className="text-[10px] font-bold text-gray-300">{new Date(rev.createdAt).toLocaleDateString()}</time>
                             </div>
                          </div>
                          <p className="text-gray-600 leading-relaxed text-lg italic">"{rev.text}"</p>
                          {rev.photo && (
                             <img src={rev.photo} className="mt-8 rounded-3xl h-64 w-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Intel" />
                          )}
                       </motion.div>
                    ))
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
