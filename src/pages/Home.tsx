import { motion } from 'motion/react';
import { ArrowRight, Star, Shield, Zap, TrendingUp, ShoppingBag, ShieldCheck } from 'lucide-react';
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

import { CATEGORIES as CONST_CATEGORIES } from '@/src/constants';

const CATEGORIES = [
  { name: CONST_CATEGORIES[0].name, icon: Zap, color: "bg-emerald-50 text-emerald-600" },
  { name: CONST_CATEGORIES[2].name, icon: TrendingUp, color: "bg-yellow-50 text-yellow-600" },
  { name: CONST_CATEGORIES[4].name, icon: Star, color: "bg-red-50 text-red-600" },
  { name: CONST_CATEGORIES[1].name, icon: Shield, color: "bg-emerald-50 text-emerald-600" },
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-stone-50 pt-16 lg:pt-24 pb-16">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-5">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-600 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-yellow-500 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-red-600 rounded-full blur-3xl"></div>
        </div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
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
              <p className="text-lg text-gray-600 mb-10 leading-relaxed font-medium">
                {t('home.hero.subtitle')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/explore" className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-8 py-4 text-base font-bold text-white hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-200 hover:-translate-y-1">
                  {t('home.hero.cta')} <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                {!user && (
                  <Link to="/register?role=seller" className="inline-flex items-center justify-center rounded-full bg-white border-2 border-emerald-100 px-8 py-4 text-base font-bold text-emerald-800 hover:border-emerald-600 hover:text-emerald-700 transition-all hover:-translate-y-1 shadow-sm">
                    Become a Seller
                  </Link>
                )}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500 rounded-[2rem] opacity-20 blur-lg"></div>
              <img 
                src="https://picsum.photos/seed/ethiopian-market/800/800" 
                alt="Marketplace Hero" 
                className="relative rounded-[2rem] shadow-2xl object-cover aspect-square border-4 border-white"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-10 flex flex-col items-center text-center border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-16 w-16 bg-yellow-50 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Curated Selection</h3>
            <p className="text-gray-600">Every product is reviewed and approved by our team.</p>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-10 flex flex-col items-center text-center border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
              <ShieldCheck className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Secure Purchases</h3>
            <p className="text-gray-600">Your transactions are protected with industry-standard security.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Shop by Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Shop by Categories</h2>
        </div>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <motion.div key={category.name} variants={itemVariants}>
                <Link 
                  to={`/explore?category=${category.name}`}
                  className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-gray-100 bg-white p-8 hover:border-emerald-200 hover:shadow-lg transition-all group h-full"
                >
                  <div className={cn("rounded-2xl p-4 transition-transform group-hover:scale-110", category.color)}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <span className="font-bold text-gray-900 text-center">{category.name}</span>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Trending Products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Trending Products</h2>
          </div>
          <Link to="/explore" className="text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
            Browse All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {FEATURED_PRODUCTS.map((product) => (
            <motion.div 
              key={product.id}
              variants={itemVariants}
              className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white p-3 transition-all hover:shadow-xl hover:border-emerald-100"
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
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1">{product.name}</h3>
                  </Link>
                  <p className="text-sm font-black text-emerald-700">{product.price} {t('product.price')}</p>
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
                  className="mt-4 w-full rounded-xl bg-gray-900 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-700 active:scale-95"
                >
                  {t('product.addToCart')}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
