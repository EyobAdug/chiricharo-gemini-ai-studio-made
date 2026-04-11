import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, SlidersHorizontal, Star, ShoppingCart, X, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/src/context/CartContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/src/firebase';
import { cn } from '@/src/lib/utils';

const CATEGORIES = ["All", "Electronics", "Fashion", "Home Tech", "Gaming", "Collectibles"];

export default function Explore() {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{t('nav.explore')}</h1>
            <p className="text-gray-600">Discover unique items from sellers worldwide</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-2.5 rounded-full border transition-all md:hidden",
                showFilters ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-200 text-gray-600"
              )}
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-8">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "block w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-all",
                      selectedCategory === cat 
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4">Sort By</h3>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none transition-all"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filters (Collapsible) */}
            <AnimatePresence>
              {showFilters && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="lg:hidden overflow-hidden mb-8 space-y-6"
                >
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          "px-4 py-2 rounded-full text-xs font-bold transition-all",
                          selectedCategory === cat 
                            ? "bg-indigo-600 text-white" 
                            : "bg-gray-100 text-gray-600"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results Grid */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center mb-6">
                  <Search className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 max-w-xs">Try adjusting your search or filters to find what you're looking for.</p>
                <button 
                  onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                  className="mt-6 text-indigo-600 font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <motion.div 
                    layout
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white p-3 transition-all hover:shadow-xl hover:border-indigo-100"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                      <img 
                        src={product.images?.[0] || product.image || "https://picsum.photos/seed/placeholder/600/600"} 
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-3 left-3">
                        <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-900 backdrop-blur-sm shadow-sm">
                          {product.category}
                        </span>
                      </div>
                    </div>
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
                        <span className="text-xs font-bold text-gray-900">{product.rating || 0}</span>
                        <span className="text-xs text-gray-400">({product.reviews || 0})</span>
                      </div>
                      <button 
                        onClick={() => addToCart(product)}
                        className="mt-4 w-full rounded-xl bg-gray-900 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-600 active:scale-95 flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="h-4 w-4" /> {t('product.addToCart')}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
