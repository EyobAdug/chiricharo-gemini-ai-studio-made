import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, RotateCcw, ShoppingCart, ChevronLeft, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/src/context/CartContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { useAuth } from '@/src/context/AuthContext';

import { DELIVERY_OPTIONS, FREE_DELIVERY_THRESHOLD } from '../constants';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (user) {
      navigate('/checkout');
    } else {
      navigate('/login');
    }
  };

  const isFreeStandard = cartTotal >= FREE_DELIVERY_THRESHOLD;
  const estimatedDelivery = isFreeStandard ? 0 : DELIVERY_OPTIONS[0].price;
  const estimatedTotal = cartTotal + estimatedDelivery;
  const progressToFree = Math.min(100, (cartTotal / FREE_DELIVERY_THRESHOLD) * 100);
  const remainingForFree = Math.max(0, FREE_DELIVERY_THRESHOLD - cartTotal);

  if (cartCount === 0) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-24 text-center bg-brand-light min-h-[80vh] flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center bg-white p-16 rounded-[4rem] border border-gray-100 shadow-premium max-w-2xl mx-auto"
        >
          <div className="h-32 w-32 rounded-[2.5rem] bg-brand-orange/10 flex items-center justify-center mb-10">
            <ShoppingCart className="h-16 w-16 text-brand-orange" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-6 tracking-tighter italic">{t('cart.empty')}</h1>
          <p className="text-gray-500 mb-12 max-w-sm mx-auto leading-relaxed font-medium">
             Your strategic procurement asset is currently inactive. Discover global opportunities in our marketplace.
          </p>
          <Link to="/explore" className="h-16 px-12 bg-brand-dark text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-3 hover:bg-brand-orange transition-all shadow-xl shadow-brand-dark/20 group">
            Consult Marketplace <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-brand-light min-h-screen">
      <div className="mx-auto max-w-[1400px] px-4 py-12 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
           <div>
              <div className="flex items-center gap-2 text-brand-orange font-black text-[10px] uppercase tracking-widest mb-4 italic">
                 <CreditCard className="h-3 w-3" /> Secure Procurement
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter italic">
                {t('cart.title')} <span className="text-brand-orange">({cartCount})</span>
              </h1>
           </div>
           <Link to="/explore" className="flex items-center gap-2 text-gray-400 font-bold hover:text-brand-orange transition-colors">
              <ChevronLeft className="h-4 w-4" /> Continue Sourcing
           </Link>
        </div>
        
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 items-start">
          {/* Cart Items Area */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Free Delivery Promo */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm overflow-hidden relative group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
               <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-900 italic">
                     <Truck className={cn("h-5 w-5", cartTotal >= FREE_DELIVERY_THRESHOLD ? "text-emerald-500" : "text-brand-orange")} />
                     {cartTotal >= FREE_DELIVERY_THRESHOLD 
                       ? "Enterprise Shipping Unlocked: FREE Standard Delivery" 
                       : `Add ${remainingForFree.toLocaleString()} ${t('product.price')} more for FREE Standard Shipping`}
                  </div>
                  <span className="text-xs font-black text-gray-400">{progressToFree.toFixed(0)}%</span>
               </div>
               <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToFree}%` }}
                    className={cn("h-full rounded-full transition-all duration-1000", cartTotal >= FREE_DELIVERY_THRESHOLD ? "bg-emerald-500" : "bg-brand-orange")}
                  />
               </div>
            </div>

            <div className="flex flex-col gap-6">
              <AnimatePresence mode="popLayout">
                {cart.map((item) => (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group flex flex-col md:flex-row items-center gap-8 p-8 rounded-[2.5rem] border border-gray-100 bg-white shadow-sm hover:shadow-premium transition-all"
                  >
                    <div className="h-40 w-40 shrink-0 overflow-hidden rounded-[2rem] bg-gray-50 border border-gray-100 p-2">
                       <Link to={`/product/${item.id}`} className="block h-full w-full">
                          <img 
                            src={item.images?.[0] || item.image || "https://picsum.photos/seed/placeholder/600/600"} 
                            alt={item.name} 
                            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                       </Link>
                    </div>
                    
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                           <Link to={`/product/${item.id}`}>
                              <h3 className="text-xl font-black text-gray-900 group-hover:text-brand-orange transition-colors leading-tight">{item.name}</h3>
                           </Link>
                           <div className="flex items-center gap-3 mt-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Category: {item.category}</span>
                              <span className="h-3 w-px bg-gray-200"></span>
                              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 italic">Verified Asset</span>
                           </div>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="h-10 w-10 flex items-center justify-center rounded-xl text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                          title="Purge Item"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
                        <div className="flex items-center gap-4 bg-brand-light rounded-xl p-1.5 border border-gray-100">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 flex items-center justify-center rounded-lg bg-white text-gray-400 hover:text-brand-orange shadow-sm transition-all active:scale-95"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="text-sm font-black w-8 text-center text-gray-900">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 flex items-center justify-center rounded-lg bg-white text-gray-400 hover:text-brand-orange shadow-sm transition-all active:scale-95"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="text-right">
                           <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Asset Value</span>
                           <p className="text-2xl font-black text-brand-dark">{(item.price * item.quantity).toLocaleString()} <span className="text-xs text-brand-orange font-bold">{t('product.price')}</span></p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Summary Area */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-brand-dark rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               <h2 className="text-3xl font-black mb-10 tracking-tighter italic">Intelligence Summary</h2>
               
               <div className="space-y-6 mb-12">
                  <div className="flex justify-between items-center group/item cursor-default">
                    <span className="text-white/40 text-sm font-bold uppercase tracking-widest group-hover/item:text-white/80 transition-colors">Gross Subtotal</span>
                    <span className="text-lg font-black">{cartTotal.toLocaleString()} {t('product.price')}</span>
                  </div>
                  <div className="flex justify-between items-center group/item cursor-default">
                    <span className="text-white/40 text-sm font-bold uppercase tracking-widest group-hover/item:text-white/80 transition-colors">Logistics Fee</span>
                    <span className={cn("text-lg font-black transition-colors", estimatedDelivery === 0 ? "text-emerald-400" : "")}>
                      {estimatedDelivery === 0 ? 'FREE' : `${estimatedDelivery.toLocaleString()} ETB`}
                    </span>
                  </div>
                  <div className="h-px bg-white/10 my-4"></div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-white text-xl font-black italic">{t('cart.total')}</span>
                    <div className="text-right">
                       <span className="text-3xl font-black text-brand-orange">{estimatedTotal.toLocaleString()}</span>
                       <span className="text-xs font-bold text-white/40 block">ETB (Tax Incl.)</span>
                    </div>
                  </div>
               </div>

               <button 
                 onClick={handleCheckout}
                 className="w-full h-20 bg-brand-orange text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4 shadow-xl shadow-brand-orange/30 hover:bg-brand-orange-hover hover:-translate-y-1 active:scale-95 transition-all"
               >
                 Authorize Sourcing <ArrowRight className="h-5 w-5" />
               </button>

               <div className="mt-12 flex flex-col gap-6">
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
                     <ShieldCheck className="h-6 w-6 text-brand-orange shrink-0" />
                     <div>
                        <p className="text-xs font-black uppercase text-white/90">Asset Protection</p>
                        <p className="text-[10px] text-white/40 font-medium">Encrypted verified procurement layer</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
                     <RotateCcw className="h-6 w-6 text-brand-orange shrink-0" />
                     <div>
                        <p className="text-xs font-black uppercase text-white/90">Trade Assurance</p>
                        <p className="text-[10px] text-white/40 font-medium">Verified regional manufacturing network</p>
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="mt-8 p-6 text-center">
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Merchant Responsibility Disclaimer</p>
               <p className="text-[10px] text-gray-400 mt-2">By proceeding, you authorize global trade protocols and verify enterprise compliance.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
