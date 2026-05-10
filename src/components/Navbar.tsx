import { Search, ShoppingCart, User, Menu, X, Globe, LogOut, LayoutDashboard, Bell, MapPin, ChevronDown, HelpCircle, Store } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useCart } from '@/src/context/CartContext';
import { useAuth } from '@/src/context/AuthContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { auth, db } from '@/src/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc } from 'firebase/firestore';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { cartCount } = useCart();
  const { user, profile } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <>
      <div className="ethiopian-border w-full relative z-[60]"></div>
      
      {/* Top Bar - Premium Info */}
      <div className="bg-brand-dark text-white py-1 px-4 text-[11px] font-medium hidden md:block">
        <div className="mx-auto max-w-[1400px] flex justify-between items-center opacity-80">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-1 hover:text-brand-orange transition-colors">
              <MapPin className="h-3 w-3" />
              <span>Deliver to Ethiopia</span>
            </button>
            <div className="flex items-center gap-4">
              <Link to="/explore" className="hover:text-brand-orange transition-colors">Marketplace</Link>
              <Link to="/seller-welcome" className="hover:text-brand-orange transition-colors flex items-center gap-1 font-bold">
                <Store className="h-3 w-3" />
                Seller Central
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
              className="flex items-center gap-1 hover:text-brand-orange transition-colors"
            >
              <Globe className="h-3 w-3" />
              <span className="uppercase">{language}</span>
            </button>
            <Link to="/legal" className="hover:text-brand-orange transition-colors flex items-center gap-1">
              <HelpCircle className="h-3 w-3" />
              Help
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-brand-dark md:bg-brand-dark/95 backdrop-blur-md border-b border-white/5">
        <div className="mx-auto max-w-[1400px] px-4">
          <div className="flex h-16 md:h-20 items-center justify-between gap-4 md:gap-8">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-orange to-brand-orange-hover flex items-center justify-center shadow-lg shadow-brand-orange/20 transition-transform group-hover:scale-105">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">
                CHIRI<span className="text-brand-orange">CHARO</span>
              </span>
            </Link>

            {/* Search Bar - Giant Professional */}
            <div className="hidden md:flex flex-1 items-center max-w-2xl px-4">
              <div className="flex w-full group">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search for anything (e.g. electronics, fashion...)"
                    className="w-full h-11 rounded-l-lg border-2 border-transparent bg-white/10 px-4 pl-4 text-sm text-white placeholder:text-gray-400 focus:bg-white focus:text-gray-900 focus:outline-none focus:border-brand-orange transition-all font-medium"
                  />
                  <div className="absolute right-0 top-0 h-full flex items-center pr-3 pointer-events-none opacity-40">
                    <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border border-white/20 bg-white/10 px-1.5 font-mono text-[10px] font-medium text-white">
                      /
                    </kbd>
                  </div>
                </div>
                <button className="h-11 px-6 rounded-r-lg bg-brand-orange text-white font-bold hover:bg-brand-orange-hover transition-colors flex items-center gap-2">
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 md:gap-4 shrink-0">
              
              {/* Notifications */}
              {user && (
                <div className="relative">
                  <button 
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="p-2 text-gray-400 hover:text-white transition-colors relative"
                  >
                    <Bell className="h-5 w-5" />
                    <AnimatePresence>
                      {unreadCount > 0 && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-orange text-[9px] font-black text-white ring-2 ring-brand-dark"
                        >
                          {unreadCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>

                  <AnimatePresence>
                    {isNotificationsOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-[100]"
                      >
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                          <h3 className="font-bold text-gray-900">Notifications</h3>
                          <span className="text-[10px] font-black uppercase text-brand-orange tracking-wider">
                            {unreadCount} New
                          </span>
                        </div>
                        <div className="max-h-[70vh] overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm italic">
                              No notifications yet.
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-100">
                              {notifications.map((notif) => (
                                <div 
                                  key={notif.id} 
                                  className={`p-4 hover:bg-brand-light transition-colors cursor-pointer ${!notif.read ? 'bg-brand-orange/5' : ''}`}
                                  onClick={() => {
                                    if (!notif.read) markAsRead(notif.id);
                                    if (notif.link) {
                                      navigate(notif.link);
                                      setIsNotificationsOpen(false);
                                    }
                                  }}
                                >
                                  <div className="flex justify-between items-start mb-1">
                                    <h4 className={`text-sm font-bold leading-tight ${!notif.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                      {notif.title}
                                    </h4>
                                    {!notif.read && <span className="h-2 w-2 rounded-full bg-brand-orange mt-1.5 ring-4 ring-brand-orange/20 shrink-0"></span>}
                                  </div>
                                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{notif.message}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* User Account - Amazon Style */}
              <div className="relative hidden md:block">
                <button 
                  onMouseEnter={() => setIsUserMenuOpen(true)}
                  className="flex flex-col text-left px-2 py-1 hover:ring-1 hover:ring-white/20 rounded transition-all"
                >
                  <span className="text-[10px] font-medium text-gray-400 leading-none">Hello, {user ? profile?.name?.split(' ')[0] : 'Sign in'}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-white whitespace-nowrap">Account & Lists</span>
                    <ChevronDown className="h-3 w-3 text-gray-400" />
                  </div>
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div 
                      onMouseLeave={() => setIsUserMenuOpen(false)}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute right-0 top-full pt-2 w-64 z-[100]"
                    >
                      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4">
                        {!user ? (
                          <div className="text-center py-2">
                            <Link to="/login" className="block w-full bg-brand-orange text-white py-2 rounded-lg font-bold text-sm hover:bg-brand-orange-hover shadow-lg shadow-brand-orange/20">Sign in</Link>
                            <p className="text-[10px] mt-2 text-gray-500">New customer? <Link to="/register" className="text-brand-orange hover:underline">Start here.</Link></p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="pb-3 border-b border-gray-100 italic">
                                <p className="text-[10px] text-gray-400 mb-1">Signed in as</p>
                                <p className="text-xs font-bold text-gray-900 truncate">{user.email}</p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Link to="/profile" className="text-sm text-gray-600 hover:text-brand-orange hover:translate-x-1 transition-all py-1 flex items-center justify-between group">
                                Manage Account
                                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-brand-orange" />
                              </Link>
                              {(profile?.role === 'admin' || profile?.role === 'seller') && (
                                <Link to="/dashboard" className="text-sm text-gray-600 hover:text-brand-orange hover:translate-x-1 transition-all py-1 flex items-center justify-between group">
                                  Seller Dashboard
                                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-brand-orange" />
                                </Link>
                              )}
                              <button onClick={handleLogout} className="text-sm text-red-600 font-bold hover:bg-red-50 py-2 px-3 rounded-lg flex items-center gap-2 mt-2 transition-colors">
                                <LogOut className="h-4 w-4" />
                                {t('nav.logout')}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart */}
              <Link to="/cart" className="flex items-center gap-2 px-3 h-10 rounded-xl bg-white/5 hover:bg-white/10 transition-all group border border-white/5">
                <div className="relative">
                  <ShoppingCart className="h-5 w-5 text-white transition-transform group-hover:-translate-y-0.5" />
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-orange text-[10px] font-black text-white ring-2 ring-brand-dark"
                      >
                        {cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <span className="hidden lg:block text-sm font-bold text-white">Cart</span>
              </Link>

              {/* Mobile Menu Trigger */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-white md:hidden"
              >
                {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu and additional mobile search */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-brand-dark border-t border-white/10 px-4 py-6 space-y-6 overflow-hidden"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search Marketplace..."
                  className="w-full h-12 bg-white/10 border-none rounded-xl pl-10 pr-4 text-white text-base focus:bg-white focus:text-brand-dark focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-4">
                <Link to="/explore" className="flex items-center justify-between text-lg font-bold text-gray-300 hover:text-brand-orange py-2 border-b border-white/5 transition-colors">
                  Marketplace
                  <ChevronDown className="h-5 w-5 -rotate-90" />
                </Link>
                {user ? (
                  <>
                    <Link to="/profile" className="flex items-center justify-between text-lg font-bold text-gray-300 hover:text-brand-orange py-2 border-b border-white/5 transition-colors">
                      Account Settings
                      <ChevronDown className="h-5 w-5 -rotate-90" />
                    </Link>
                    {(profile?.role === 'admin' || profile?.role === 'seller') && (
                      <Link to="/dashboard" className="flex items-center justify-between text-lg font-bold text-gray-300 hover:text-brand-orange py-2 border-b border-white/5 transition-colors">
                        Seller Dashboard
                        <ChevronDown className="h-5 w-5 -rotate-90" />
                      </Link>
                    )}
                    <button onClick={handleLogout} className="w-full text-left flex items-center justify-between text-lg font-bold text-red-500 py-4 transition-colors">
                      {t('nav.logout')}
                      <LogOut className="h-5 w-5" />
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <Link to="/login" className="flex items-center justify-center h-12 rounded-xl bg-white/5 text-white font-bold border border-white/10">Log In</Link>
                    <Link to="/register" className="flex items-center justify-center h-12 rounded-xl bg-brand-orange text-white font-bold shadow-lg shadow-brand-orange/20">Sign Up</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}

function ArrowRight({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
    )
}
