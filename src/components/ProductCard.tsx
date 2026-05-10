import React from 'react';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useCart } from '@/src/context/CartContext';
import { useAuth } from '@/src/context/AuthContext';
import { useLanguage } from '@/src/context/LanguageContext';

interface ProductCardProps {
  product: any;
  key?: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const { user, profile, toggleWishlist } = useAuth();

  const isWishlisted = profile?.wishlist?.includes(String(product.id));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative flex flex-col bg-white rounded-xl border border-gray-100 transition-all hover:shadow-premium hover:border-brand-orange/20 overflow-hidden"
    >
      {/* Image Area */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Link to={`/product/${product.id}`} className="block h-full w-full">
          <img 
            src={product.image} 
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className="bg-white/90 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest text-gray-900 px-2 py-1 rounded shadow-sm border border-gray-100">
            {product.category}
          </span>
        </div>

        {/* Floating Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <button 
            onClick={() => toggleWishlist(String(product.id))}
            className={`p-2 rounded-full shadow-lg border transition-all ${isWishlisted ? 'bg-brand-orange text-white border-brand-orange' : 'bg-white text-gray-600 border-gray-100 hover:text-brand-orange'}`}
              title="Add to Wishlist"
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
          <Link 
            to={`/product/${product.id}`}
            className="p-2 bg-white rounded-full shadow-lg border border-gray-100 text-gray-600 hover:text-brand-orange transition-all"
            title="Quick View"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Info Area */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center text-brand-orange">
            <Star className="h-3 w-3 fill-current" />
          </div>
          <span className="text-[11px] font-bold text-gray-900">{product.rating}</span>
          <span className="text-[11px] text-gray-400">({product.reviews})</span>
        </div>

        <Link to={`/product/${product.id}`} className="mb-2 block">
          <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-brand-orange transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.sellerName && (
          <p className="text-[10px] text-gray-400 mb-3 uppercase tracking-tighter font-medium italic">
            By {product.sellerName}
          </p>
        )}

        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium leading-none mb-1">Price</span>
            <span className="text-lg font-black text-brand-dark">
              {product.price.toLocaleString()} <span className="text-[10px] font-bold text-brand-orange">{t('product.price')}</span>
            </span>
          </div>
          
          <button 
            onClick={() => addToCart(product)}
            className="h-10 w-10 rounded-lg bg-gray-900 flex items-center justify-center text-white hover:bg-brand-orange transition-all shadow-sm active:scale-90"
            title={t('product.addToCart')}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
