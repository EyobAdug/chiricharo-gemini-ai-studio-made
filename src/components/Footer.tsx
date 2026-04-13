import { ShoppingCart, Github, Twitter, Instagram, Mail, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <footer className="bg-stone-50 border-t border-gray-200 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-lg bg-emerald-700 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">{t('app.name')}</span>
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed">
              The world's most trusted marketplace for unique items. Buy, sell, and discover extraordinary products from around the globe.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-emerald-700 transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-emerald-700 transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-emerald-700 transition-colors"><Github className="h-5 w-5" /></a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-6">Shop</h3>
            <ul className="space-y-4">
              <li><Link to="/explore" className="text-sm text-gray-600 hover:text-emerald-700 transition-colors">All Products</Link></li>
              <li><Link to="/explore" className="text-sm text-gray-600 hover:text-emerald-700 transition-colors">Categories</Link></li>
              <li><Link to="/explore" className="text-sm text-gray-600 hover:text-emerald-700 transition-colors">Featured</Link></li>
              <li><Link to="/explore" className="text-sm text-gray-600 hover:text-emerald-700 transition-colors">New Arrivals</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-6">Sell</h3>
            <ul className="space-y-4">
              <li><Link to="/register" className="text-sm text-gray-600 hover:text-emerald-700 transition-colors">Start Selling</Link></li>
              <li><Link to="/legal" className="text-sm text-gray-600 hover:text-emerald-700 transition-colors">Seller Guide</Link></li>
              <li><Link to="/legal" className="text-sm text-gray-600 hover:text-emerald-700 transition-colors">Fees & Policies</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-6">Support</h3>
            <ul className="space-y-4">
              <li><Link to="/legal" className="text-sm text-gray-600 hover:text-emerald-700 transition-colors">Help Center</Link></li>
              <li><Link to="/legal" className="text-sm text-gray-600 hover:text-emerald-700 transition-colors">Contact Us</Link></li>
              <li><Link to="/legal" className="text-sm text-gray-600 hover:text-emerald-700 transition-colors">{t('legal.privacy')}</Link></li>
              <li><Link to="/legal" className="text-sm text-gray-600 hover:text-emerald-700 transition-colors">{t('legal.terms')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} {t('app.name')} Inc. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Mail className="h-3 w-3" />
              <span>support@chiricharo.com</span>
            </div>
            
            <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
              <Globe className="h-4 w-4 text-gray-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'am')}
                className="text-xs text-gray-600 bg-transparent border-none focus:ring-0 cursor-pointer"
              >
                <option value="en">English</option>
                <option value="am">አማርኛ</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
