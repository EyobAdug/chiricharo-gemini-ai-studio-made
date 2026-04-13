import { Search, ShoppingCart, User, Menu, X, Globe, LogOut, LayoutDashboard, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
      <div className="ethiopian-border w-full"></div>
      <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">{t('app.name')}</span>
            </Link>
            
            <div className="hidden md:block">
              <div className="flex items-center gap-6">
                <Link to="/explore" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">{t('nav.explore')}</Link>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-1"
              title="Switch Language"
            >
              <Globe className="h-5 w-5" />
              <span className="text-xs font-bold uppercase">{language}</span>
            </button>

            {user && (
              <div className="relative">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative"
                  title="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="font-bold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">
                          No notifications yet.
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-50">
                          {notifications.map((notif) => (
                            <div 
                              key={notif.id} 
                              className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.read ? 'bg-indigo-50/30' : ''}`}
                              onClick={() => {
                                if (!notif.read) markAsRead(notif.id);
                                if (notif.link) {
                                  navigate(notif.link);
                                  setIsNotificationsOpen(false);
                                }
                              }}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <h4 className={`text-sm font-bold ${!notif.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {notif.title}
                                </h4>
                                {!notif.read && <span className="h-2 w-2 rounded-full bg-indigo-600 mt-1.5 shrink-0"></span>}
                              </div>
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{notif.message}</p>
                              <span className="text-[10px] font-medium text-gray-400">
                                {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Link to="/cart" className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden md:flex items-center gap-4 ml-2 pl-4 border-l border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900 leading-none">{profile?.name || 'User'}</span>
                    <span className="text-[10px] text-gray-500 leading-none mt-1">{user.email}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Link to="/profile" className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors" title={t('nav.profile') || 'Manage Account'}>
                    <User className="h-5 w-5" />
                  </Link>
                  {(profile?.role === 'admin' || profile?.role === 'seller') && (
                    <Link to="/dashboard" className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors" title={t('nav.dashboard')}>
                      <LayoutDashboard className="h-5 w-5" />
                    </Link>
                  )}
                  <button onClick={handleLogout} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors" title={t('nav.logout')}>
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-4 ml-2">
                <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-indigo-600">{t('nav.login')}</Link>
                <Link to="/register" className="text-sm font-bold bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors">{t('nav.register')}</Link>
              </div>
            )}

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors md:hidden"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-4 animate-in slide-in-from-top duration-300">
          <Link to="/explore" className="block text-base font-medium text-gray-600 hover:text-indigo-600">{t('nav.explore')}</Link>
          <hr className="border-gray-100" />
          {user ? (
            <>
              <div className="flex items-center gap-3 py-2 border-b border-gray-100 mb-2">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">{profile?.name || 'User'}</span>
                  <span className="text-xs text-gray-500">{user.email}</span>
                </div>
              </div>
              <Link to="/profile" className="block text-base font-medium text-gray-600 hover:text-indigo-600">{t('nav.profile') || 'Manage Account'}</Link>
              {(profile?.role === 'admin' || profile?.role === 'seller') && (
                <Link to="/dashboard" className="block text-base font-medium text-gray-600 hover:text-indigo-600">{t('nav.dashboard')}</Link>
              )}
              <button onClick={handleLogout} className="block w-full text-left text-base font-medium text-red-600 hover:text-red-700">{t('nav.logout')}</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-base font-medium text-gray-600 hover:text-indigo-600">{t('nav.login')}</Link>
              <Link to="/register" className="block text-base font-medium text-indigo-600 hover:text-indigo-700">{t('nav.register')}</Link>
            </>
          )}
        </div>
      )}
    </nav>
    </>
  );
}
