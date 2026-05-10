import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, SlidersHorizontal, Star, ShoppingCart, X, ChevronDown, Heart, LayoutGrid, List, Globe } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '@/src/context/CartContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { useAuth } from '@/src/context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/src/firebase';
import { cn } from '@/src/lib/utils';
import ProductCard from '@/src/components/ProductCard';

import { CATEGORIES as CONST_CATEGORIES } from '@/src/constants';

const CATEGORIES = ["All", ...CONST_CATEGORIES.map(c => c.name)];

export default function Explore() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || "All");
  const [sortBy, setSortBy] = useState("featured");
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setSearchQuery(q);
    
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'products'), where('status', '==', 'approved'));
        const snapshot = await getDocs(q);
        const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setSearchParams(prev => {
      if (cat === "All") {
        prev.delete('category');
      } else {
        prev.set('category', cat);
      }
      return prev;
    });
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        (product.name || "").toLowerCase().includes(searchLower) ||
        (product.description || "").toLowerCase().includes(searchLower) ||
        (product.category || "").toLowerCase().includes(searchLower);
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0;
    });
  }, [products, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="bg-brand-light min-h-screen">
      <div className="mx-auto max-w-[1400px] px-4 py-8 md:py-16">
        
        {/* Header Section */}
        <div className="flex flex-col gap-8 mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange mb-4 italic">
                 <Globe className="h-3 w-3" /> Worldwide Marketplace
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter mb-2 italic">Explore Marketplace</h1>
              <p className="text-gray-500 font-medium">Discover millions of professional products and suppliers.</p>
            </div>
            
            <div className="flex items-center gap-3">
               <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1">
                  <button className="p-2 rounded-lg bg-gray-100 text-gray-900" title="Grid View">
                     <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button className="p-2 rounded-lg text-gray-400 hover:text-brand-orange" title="List View">
                     <List className="h-4 w-4" />
                  </button>
               </div>
               <button 
                  onClick={() => setShowFiltersMobile(!showFiltersMobile)}
                  className="md:hidden flex items-center gap-2 bg-brand-orange text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-brand-orange/20"
               >
                  <Filter className="h-4 w-4" /> Filters
               </button>
            </div>
          </div>

          {/* Search Header */}
          <div className="bg-white rounded-[2rem] p-4 shadow-premium border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
             <div className="relative flex-1 group w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-brand-orange transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search products, brands, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 bg-gray-50 border-none rounded-2xl pl-12 pr-4 font-medium focus:bg-white focus:ring-2 focus:ring-brand-orange/20 transition-all outline-none"
                />
             </div>
             <div className="flex gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-48">
                   <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                   <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full h-14 bg-gray-50 border-none rounded-2xl pl-4 pr-10 font-bold text-sm focus:ring-2 focus:ring-brand-orange/20 transition-all outline-none appearance-none"
                   >
                     <option value="featured">Featured First</option>
                     <option value="price-low">Price: Low to High</option>
                     <option value="price-high">Price: High to Low</option>
                     <option value="rating">Highest Rated</option>
                   </select>
                </div>
             </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Professional Sidebar Filters */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-10">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6 italic">Product Categories</h3>
              <div className="flex flex-col gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={cn(
                      "flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-bold transition-all border border-transparent",
                      selectedCategory === cat 
                        ? "bg-brand-orange text-white shadow-xl shadow-brand-orange/20 border-brand-orange" 
                        : "text-gray-600 hover:bg-white hover:border-gray-200 hover:shadow-sm"
                    )}
                  >
                    {cat}
                    {selectedCategory === cat && <ChevronDown className="h-4 w-4 -rotate-90" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8 bg-brand-dark rounded-[2rem] text-white overflow-hidden relative group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-brand-orange opacity-20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
               <h4 className="text-xl font-black mb-4 italic">Exclusive Global Offers</h4>
               <p className="text-white/60 text-xs leading-relaxed mb-6">Access wholesale prices and global logistics for your business expansion.</p>
               <button className="w-full h-12 bg-white text-brand-dark font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-brand-orange hover:text-white transition-all transform group-hover:-translate-y-1">
                  Learn More
               </button>
            </div>
          </aside>

          {/* Main Content Grid */}
          <div className="flex-1">
            {/* Mobile Filters Drawer */}
            <AnimatePresence>
               {showFiltersMobile && (
                 <motion.div 
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="lg:hidden fixed inset-0 z-[100] bg-white p-6 overflow-y-auto"
                 >
                    <div className="flex justify-between items-center mb-8">
                       <h3 className="text-2xl font-black italic">Filter Results</h3>
                       <button onClick={() => setShowFiltersMobile(false)} className="p-2 bg-gray-100 rounded-full">
                          <X className="h-6 w-6" />
                       </button>
                    </div>
                    <div className="space-y-8">
                       <div>
                          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Categories</h3>
                          <div className="flex flex-wrap gap-2">
                             {CATEGORIES.map(cat => (
                               <button 
                                 key={cat}
                                 onClick={() => { handleCategoryChange(cat); setShowFiltersMobile(false); }}
                                 className={cn("px-6 py-3 rounded-xl font-bold text-sm", selectedCategory === cat ? "bg-brand-orange text-white" : "bg-gray-100 text-gray-600")}
                               >
                                 {cat}
                               </button>
                             ))}
                          </div>
                       </div>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                 {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 h-[400px] animate-pulse overflow-hidden">
                       <div className="aspect-square bg-gray-100"></div>
                       <div className="p-6 space-y-4">
                          <div className="h-4 w-2/3 bg-gray-100 rounded"></div>
                          <div className="h-4 w-1/3 bg-gray-100 rounded"></div>
                       </div>
                    </div>
                 ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                <div className="h-24 w-24 rounded-3xl bg-gray-50 flex items-center justify-center mb-8">
                  <Search className="h-12 w-12 text-gray-200" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter italic">Precision Search: No Match Found</h3>
                <p className="text-gray-500 font-medium max-w-sm mx-auto mb-10 leading-relaxed">Adjust your high-level search or filter settings to discover curated enterprise assets.</p>
                <button 
                  onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                  className="bg-brand-dark text-white px-10 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-sm hover:bg-brand-orange transition-all shadow-xl"
                >
                  Clear All Directives
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
