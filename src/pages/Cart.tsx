import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
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

  if (cartCount === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <div className="h-24 w-24 rounded-full bg-indigo-50 flex items-center justify-center mb-8">
            <ShoppingBag className="h-12 w-12 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{t('cart.empty')}</h1>
          <p className="text-gray-600 mb-10 max-w-md mx-auto leading-relaxed">
            Looks like you haven't added anything to your cart yet. Explore our marketplace to find amazing deals!
          </p>
          <Link to="/explore" className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-10 py-4 text-base font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            Start Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-10">{t('cart.title')} ({cartCount})</h1>
      
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="popLayout">
            {cart.map((item) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-32 w-32 shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-100">
                  <img 
                    src={item.images?.[0] || item.image || "https://picsum.photos/seed/placeholder/600/600"} 
                    alt={item.name} 
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.category}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-full px-3 py-1 border border-gray-100">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-gray-600 hover:text-indigo-600"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-gray-600 hover:text-indigo-600"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-lg font-black text-indigo-600">{(item.price * item.quantity).toFixed(2)} {t('product.price')}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{cartTotal.toFixed(2)} {t('product.price')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Estimated Delivery</span>
                <span className={estimatedDelivery === 0 ? "text-green-600 font-bold" : ""}>
                  {estimatedDelivery === 0 ? 'FREE' : `${estimatedDelivery.toFixed(2)} ETB`}
                </span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between text-xl font-black text-gray-900">
                <span>{t('cart.total')}</span>
                <span>{estimatedTotal.toFixed(2)} {t('product.price')}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              className="w-full rounded-full bg-indigo-600 py-4 text-base font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 mb-6"
            >
              {t('cart.checkout')} <ArrowRight className="h-5 w-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <ShieldCheck className="h-4 w-4 text-indigo-600" />
                <span>Secure SSL encrypted payment</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <Truck className="h-4 w-4 text-indigo-600" />
                <span>Fast delivery on all orders</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
