import { motion } from 'motion/react';
import { ArrowRight, Star, Shield, Zap, TrendingUp, ShoppingBag, ShieldCheck, Search, Globe, Truck, Award } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/src/context/CartContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { useAuth } from '@/src/context/AuthContext';
import ProductCard from '@/src/components/ProductCard';
import { cn } from '@/src/lib/utils';

const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: "Premium Wireless Noise-Cancelling Headphones",
    price: 15450,
    rating: 4.8,
    reviews: 124,
    image: "https://picsum.photos/seed/headphones/600/600",
    category: "Electronics",
    sellerName: "Sony Official"
  },
  {
    id: 2,
    name: "Executive Minimalist Leather Portfolio Backpack",
    price: 8900,
    rating: 4.9,
    reviews: 89,
    image: "https://picsum.photos/seed/backpack/600/600",
    category: "Fashion",
    sellerName: "Ethio Leather"
  },
  {
    id: 3,
    name: "Ultra HD Smart Home Security System - 4K",
    price: 24000,
    rating: 4.7,
    reviews: 215,
    image: "https://picsum.photos/seed/camera/600/600",
    category: "Home Tech",
    sellerName: "Security Pro"
  },
  {
    id: 4,
    name: "High-Performance Mechanical Gaming Keyboard",
    price: 6200,
    rating: 4.6,
    reviews: 156,
    image: "https://picsum.photos/seed/keyboard/600/600",
    category: "Gaming",
    sellerName: "TechHub"
  }
];

import { CATEGORIES as CONST_CATEGORIES } from '@/src/constants';

const CATEGORIES = [
  { name: CONST_CATEGORIES[0].name, icon: Zap, color: "text-brand-orange", bg: "bg-brand-orange/5" },
  { name: CONST_CATEGORIES[2].name, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
  { name: CONST_CATEGORIES[4].name, icon: Star, color: "text-purple-600", bg: "bg-purple-50" },
  { name: CONST_CATEGORIES[1].name, icon: Shield, color: "text-brand-green", bg: "bg-brand-green/5" },
];

const TRUST_BADGES = [
  { icon: ShieldCheck, title: "Trade Assurance", desc: "Protecting your orders from payment to delivery" },
  { icon: Award, title: "Verified Suppliers", desc: "Work with manufacturers inspected by third parties" },
  { icon: Truck, title: "Logistics Solutions", desc: "Reliable shipping options across Ethiopia" },
  { icon: Globe, title: "Global Standards", desc: "A world-class marketplace feel in every transaction" }
];

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="flex flex-col gap-24 pb-24 bg-brand-light">
      
      {/* Hero Section - Luxury Enterprise Style */}
      <section className="relative min-h-[85vh] flex items-center pt-8 md:pt-0 overflow-hidden bg-brand-dark">
        {/* Abstract Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-orange/20 to-transparent"></div>
          <div className="absolute -bottom-48 -left-48 w-[600px] h-[600px] bg-brand-orange/10 rounded-full blur-[120px]"></div>
          <img 
             src="https://picsum.photos/seed/luxury-market/1600/900"
             className="absolute inset-0 w-full h-full object-cover opacity-20 contrast-125 brightness-50"
             alt="Luxury Hero"
          />
        </div>

        <div className="mx-auto max-w-[1400px] w-full px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/90 text-xs font-bold uppercase tracking-widest mb-8">
                 <Award className="h-3 w-3 text-brand-orange" />
                 Ethiopia's Leading B2B Marketplace
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-8">
                {t('home.hero.title').split(' ').map((word, i) => i === 2 ? <span key={i} className="text-brand-orange">{word} </span> : word + ' ')}
              </h1>
              <p className="text-xl md:text-2xl text-white/70 font-medium leading-relaxed mb-10 max-w-xl">
                 Discover millions of business opportunities and products from verified suppliers across the region.
              </p>

              {/* Central Search Card */}
              <div className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 max-w-2xl group focus-within:ring-4 focus-within:ring-brand-orange/20 transition-all">
                <div className="flex-1 flex items-center px-4 gap-3">
                  <Search className="h-6 w-6 text-gray-400 group-focus-within:text-brand-orange" />
                  <input 
                    type="text" 
                    placeholder="Search by keywords (e.g. leather bags...)"
                    className="w-full h-12 bg-transparent text-gray-900 font-medium focus:outline-none placeholder:text-gray-400"
                  />
                </div>
                <button className="bg-brand-orange hover:bg-brand-orange-hover text-white px-10 py-4 rounded-xl font-black uppercase tracking-wider text-sm transition-all shadow-lg shadow-brand-orange/30">
                  Search
                </button>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4 text-white/60 text-sm font-bold">
                 <div className="flex items-center gap-2 italic">
                    <span className="text-brand-orange">●</span> Frequently Search:
                 </div>
                 <Link to="/explore?category=Electronics" className="hover:text-white transition-colors">Smart Watches</Link>
                 <Link to="/explore?category=Fashion" className="hover:text-white transition-colors">Leather Jackets</Link>
                 <Link to="/explore?category=Home Tech" className="hover:text-white transition-colors">Solar Systems</Link>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-[3rem] overflow-hidden border-8 border-white/5 shadow-2xl skew-y-1">
                 <img 
                   src="https://picsum.photos/seed/ethio-tech/800/800" 
                   alt="Premium Products" 
                   className="w-full h-full object-cover aspect-square"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 to-transparent"></div>
                 <div className="absolute bottom-10 left-10 right-10">
                    <div className="glass p-6 rounded-2xl">
                       <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Featured Supplier</p>
                       <h3 className="text-2xl font-black text-white">EthioSmart Technology Solutions</h3>
                       <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-4">
                             <div className="text-center">
                                <p className="text-brand-orange font-black leading-none">12M+</p>
                                <p className="text-[10px] text-white/40 uppercase">Exports</p>
                             </div>
                             <div className="h-4 w-px bg-white/20"></div>
                             <div className="text-center">
                                <p className="text-white font-black leading-none">Verified</p>
                                <p className="text-[10px] text-white/40 uppercase">Gold Seller</p>
                             </div>
                          </div>
                          <Link to="/explore" className="text-brand-orange font-bold text-sm hover:underline">View Shop</Link>
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Grid - Minimal Utility */}
      <section className="mx-auto max-w-[1400px] w-full px-4 -mt-12 relative z-20">
         <div className="bg-white rounded-3xl shadow-premium border border-gray-100 p-8 md:p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 lg:divide-x divide-gray-100">
               {TRUST_BADGES.map((badge, i) => (
                 <div key={i} className="p-8 group hover:bg-brand-light transition-colors cursor-default">
                    <div className="flex items-start gap-4">
                       <div className="h-12 w-12 rounded-xl bg-brand-orange/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <badge.icon className="h-6 w-6 text-brand-orange" />
                       </div>
                       <div>
                          <h4 className="text-lg font-black text-gray-900 mb-1">{badge.title}</h4>
                          <p className="text-sm text-gray-500 leading-relaxed">{badge.desc}</p>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Categories Overhaul */}
      <section className="mx-auto max-w-[1400px] w-full px-4">
        <div className="flex items-end justify-between mb-12">
           <div className="max-w-xl">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tighter">Shop by Category</h2>
              <p className="text-gray-500 font-medium">Explore millions of products across our dedicated business categories.</p>
           </div>
           <Link to="/explore" className="hidden md:flex items-center gap-2 text-brand-orange font-black uppercase text-xs tracking-widest group">
              Explore All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
           </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat, i) => (
             <motion.div 
               key={i} 
               whileHover={{ y: -5 }}
               className="group cursor-pointer"
             >
                <Link to={`/explore?category=${cat.name}`} className="block relative h-64 rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm transition-all group-hover:shadow-premium group-hover:border-brand-orange/20">
                   <div className="absolute top-8 left-8 z-10">
                      <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", cat.bg)}>
                         <cat.icon className={cn("h-6 w-6", cat.color)} />
                      </div>
                      <h4 className="text-xl font-black text-gray-900">{cat.name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">{cat.name === 'Electronics' ? '50k+ Products' : 'Weekly Deals'}</p>
                   </div>
                   <img 
                      src={`https://picsum.photos/seed/${cat.name}/400/500`}
                      className="absolute bottom-0 right-0 w-2/3 h-2/3 object-contain translate-x-4 translate-y-4 opacity-10 group-hover:opacity-100 transition-opacity"
                      alt={cat.name}
                   />
                </Link>
             </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products - Redesigned Grid */}
      <section className="mx-auto max-w-[1400px] w-full px-4">
         <div className="bg-white rounded-[3rem] p-8 md:p-16 border border-gray-100 shadow-premium relative overflow-hidden">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 relative z-10">
               <div className="max-w-xl">
                  <div className="text-brand-orange font-black uppercase text-[10px] tracking-[0.2em] mb-4">Trending Now</div>
                  <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter">Premium Handpicked Selection</h2>
               </div>
               <div className="flex gap-4">
                  <Link to="/explore" className="h-14 px-8 rounded-full bg-brand-dark text-white font-bold flex items-center gap-2 hover:bg-brand-orange transition-colors shadow-xl shadow-brand-dark/20">
                     View All Market <ArrowRight className="h-4 w-4" />
                  </Link>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
               {FEATURED_PRODUCTS.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
               ))}
            </div>
         </div>
      </section>

      {/* Top Suppliers Section */}
      <section className="mx-auto max-w-[1400px] w-full px-4">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-brand-orange rounded-[2.5rem] p-10 text-white flex flex-col items-start justify-center relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
               <Zap className="h-10 w-10 text-white/50 mb-8" />
               <h3 className="text-4xl font-black leading-tight mb-4">Top Rated Suppliers 2026</h3>
               <p className="text-white/80 font-medium mb-10">Connect with local verified manufacturers ready for bulk orders and customization.</p>
               <button className="bg-white text-brand-orange px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-brand-dark hover:text-white transition-all transform hover:-translate-y-1 shadow-xl">
                  Source Now
               </button>
            </div>
            
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
               {[1, 2].map((_, i) => (
                 <div key={i} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col group hover:shadow-premium transition-all">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="h-16 w-16 rounded-2xl bg-gray-100 overflow-hidden shrink-0 border-2 border-gray-50">
                          <img src={`https://picsum.photos/seed/supplier-${i}/200/200`} alt="Supplier" className="w-full h-full object-cover" />
                       </div>
                       <div>
                          <h4 className="text-xl font-black text-gray-900">{i === 0 ? "Unity Garments Ltd." : "TechWay Electronics"}</h4>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Top Seller</span>
                             <span className="text-[10px] font-bold text-gray-400">10+ Years</span>
                          </div>
                       </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-auto">
                       {[1, 2, 3].map((_, j) => (
                         <div key={j} className="aspect-square rounded-xl bg-gray-50 overflow-hidden transition-transform group-hover:scale-95 duration-500">
                            <img src={`https://picsum.photos/seed/sprod-${i}-${j}/200/200`} alt="Prod" className="w-full h-full object-cover" />
                         </div>
                       ))}
                    </div>
                    <Link to="/explore" className="mt-8 flex items-center justify-center h-12 rounded-xl bg-brand-light text-gray-900 font-bold text-sm hover:bg-brand-dark hover:text-white transition-colors">
                       Visit Factory
                    </Link>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="mx-auto max-w-[1400px] w-full px-4 mb-12">
         <div className="bg-brand-dark rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-gradient-to-r from-brand-orange via-transparent to-brand-orange blur-[100px]"></div>
            </div>
            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
               <div className="h-20 w-px bg-gradient-to-b from-brand-orange to-transparent mb-8"></div>
               <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8 italic">Ready to Scale Your Business Globally?</h2>
               <p className="text-xl text-white/60 font-medium mb-12 leading-relaxed">Join 50,000+ companies sourcing the best products from Chiricharo every day.</p>
               <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <input 
                    type="email" 
                    placeholder="Enter your work email"
                    className="flex-1 h-16 rounded-2xl bg-white/10 px-8 text-white text-lg focus:bg-white focus:text-brand-dark outline-none transition-all placeholder:text-white/30"
                  />
                  <button className="h-16 px-12 rounded-2xl bg-white text-brand-dark font-black uppercase tracking-widest text-sm hover:bg-brand-orange hover:text-white transition-all shadow-xl">
                     Get Started
                  </button>
               </div>
               <p className="mt-6 text-white/30 text-xs font-medium">No credit card required. Free for buyers.</p>
            </div>
         </div>
      </section>
    </div>
  );
}
