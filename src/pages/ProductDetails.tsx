import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, ShoppingCart, ShieldCheck, Truck, RotateCcw, ArrowLeft, Heart, Share2 } from 'lucide-react';
import { useCart } from '@/src/context/CartContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/src/firebase';
import { cn } from '@/src/lib/utils';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { t } = useLanguage();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

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
          </div>

          <div className="space-y-4 mb-10">
            <button 
              onClick={() => addToCart(product)}
              className="w-full rounded-full bg-indigo-600 py-5 text-lg font-bold text-white hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <ShoppingCart className="h-6 w-6" /> {t('product.addToCart')}
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
    </div>
  );
}
