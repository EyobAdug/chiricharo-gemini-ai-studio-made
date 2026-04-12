import { motion } from 'motion/react';
import { ArrowRight, Star, Shield, Zap, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/src/context/CartContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { useAuth } from '@/src/context/AuthContext';
import { cn } from '@/src/lib/utils';

const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    price: 299.99,
    rating: 4.8,
    reviews: 124,
    image: "https://picsum.photos/seed/headphones/600/600",
    category: "Electronics"
  },
  {
    id: 2,
    name: "Minimalist Leather Backpack",
    price: 145.00,
    rating: 4.9,
    reviews: 89,
    image: "https://picsum.photos/seed/backpack/600/600",
    category: "Fashion"
  },
  {
    id: 3,
    name: "Smart Home Security Camera",
    price: 199.00,
    rating: 4.7,
    reviews: 215,
    image: "https://picsum.photos/seed/camera/600/600",
    category: "Home Tech"
  },
  {
    id: 4,
    name: "Mechanical Gaming Keyboard",
    price: 129.99,
    rating: 4.6,
    reviews: 156,
    image: "https://picsum.photos/seed/keyboard/600/600",
    category: "Gaming"
  }
];

const CATEGORIES = [
  { name: "Electronics", icon: Zap, color: "bg-blue-50 text-blue-600" },
  { name: "Fashion", icon: TrendingUp, color: "bg-pink-50 text-pink-600" },
  { name: "Home & Garden", icon: Star, color: "bg-yellow-50 text-yellow-600" },
  { name: "Collectibles", icon: Shield, color: "bg-indigo-50 text-indigo-600" },
];

export default function Home() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const { user } = useAuth();

  const handleAddToCart = (product: any) => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(product);
  };

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-16 lg:pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl mb-6 leading-tight">
                {t('home.hero.title')}
              </h1>
              <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                {t('home.hero.subtitle')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/explore" className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-8 py-4 text-base font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:-translate-y-1">
                  {t('home.hero.cta')} <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="absolute -top-4 -left-4 h-72 w-72 rounded-full bg-indigo-100/50 blur-3xl"></div>
              <div className="absolute -bottom-4 -right-4 h-72 w-72 rounded-full bg-purple-100/50 blur-3xl"></div>
              <img 
                src="https://picsum.photos/seed/shopping/800/800" 
                alt="Marketplace Hero" 
                className="relative rounded-3xl shadow-2xl object-cover aspect-square"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('home.featured')}</h2>
          </div>
          <Link to="/explore" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            Browse All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_PRODUCTS.map((product) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white p-3 transition-all hover:shadow-xl hover:border-indigo-100"
            >
              <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 block">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-3 left-3">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-900 backdrop-blur-sm shadow-sm">
                    {product.category}
                  </span>
                </div>
              </Link>
              <div className="mt-4 px-2 pb-2">
                <div className="flex items-center justify-between mb-1">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{product.name}</h3>
                  </Link>
                  <p className="text-sm font-black text-indigo-600">{product.price} {t('product.price')}</p>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex items-center text-yellow-400">
                    <Star className="h-3 w-3 fill-current" />
                  </div>
                  <span className="text-xs font-bold text-gray-900">{product.rating}</span>
                  <span className="text-xs text-gray-400">({product.reviews} reviews)</span>
                </div>
                <button 
                  onClick={() => handleAddToCart(product)}
                  className="mt-4 w-full rounded-xl bg-gray-900 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-600 active:scale-95"
                >
                  {t('product.addToCart')}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
