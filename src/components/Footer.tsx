import { ShoppingCart, Github, Twitter, Instagram, Mail, Globe, MapPin, Phone, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <footer className="bg-brand-dark text-white pt-24 pb-12 overflow-hidden relative">
      {/* Decorative pulse */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-orange opacity-5 rounded-full blur-[100px] -translate-y-1/2"></div>
      
      <div className="mx-auto max-w-[1400px] px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-8 mb-20">
          
          {/* Brand Identity */}
          <div className="lg:col-span-4 max-w-sm">
            <Link to="/" className="flex items-center gap-3 mb-8 group">
              <div className="h-10 w-10 rounded-xl bg-brand-orange flex items-center justify-center shadow-lg shadow-brand-orange/20 group-hover:scale-110 transition-transform">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white italic">CHIRICHARO</span>
            </Link>
            <p className="text-white/40 text-sm font-medium leading-relaxed mb-8 italic">
              Empowering global trade through strategic asset procurement and verified regional supply chains. The enterprise standard for modern marketplaces.
            </p>
            <div className="flex gap-4">
              {[Twitter, Instagram, Github].map((Icon, i) => (
                <a key={i} href="#" className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-brand-orange transition-all hover:-translate-y-1">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Sourcing Links */}
          <div className="lg:col-span-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange mb-8">Supply Chain</h3>
            <ul className="space-y-4">
              {['All Assets', 'Categories', 'Strategic Sourcing', 'New Arrivals'].map((link) => (
                <li key={link}>
                  <Link to="/explore" className="text-sm font-bold text-white/50 hover:text-white transition-colors hover:translate-x-1 inline-block">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Partner Links */}
          <div className="lg:col-span-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange mb-8">Partnerships</h3>
            <ul className="space-y-4">
              {['Register Merchant', 'Enterprise Guide', 'Trade Policies', 'Compliance'].map((link) => (
                <li key={link}>
                  <Link to="/register" className="text-sm font-bold text-white/50 hover:text-white transition-colors hover:translate-x-1 inline-block">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="lg:col-span-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange mb-8">Operations</h3>
            <ul className="space-y-4">
              {['Command Center', 'Contact Experts', 'Data Privacy', 'Agreements'].map((link) => (
                <li key={link}>
                  <Link to="/legal" className="text-sm font-bold text-white/50 hover:text-white transition-colors hover:translate-x-1 inline-block">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / CTA */}
          <div className="lg:col-span-2">
             <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4 italic">Global Insight</h3>
                <p className="text-[10px] text-white/40 mb-4 leading-relaxed font-medium italic">Join our intelligence network for daily trade reports.</p>
                <div className="relative">
                   <input 
                     type="email" 
                     placeholder="Email" 
                     className="w-full bg-brand-dark border border-white/10 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-brand-orange transition-all"
                   />
                   <button className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:text-brand-orange transition-colors">
                      <Zap className="h-4 w-4" />
                   </button>
                </div>
             </div>
          </div>
        </div>

        {/* Global Stats / Trust */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-y border-white/5 mb-12">
           <div className="flex items-center gap-4">
              <ShieldCheck className="h-8 w-8 text-brand-orange" />
              <div>
                 <p className="text-sm font-black italic">99.9% Trusted Compliance</p>
                 <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Enterprise Verification</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <Globe className="h-8 w-8 text-brand-orange" />
              <div>
                 <p className="text-sm font-black italic">24/7 Logistics Network</p>
                 <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Global Asset Deployment</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full border-2 border-brand-orange/30 border-t-brand-orange"></div>
              <div>
                 <p className="text-sm font-black italic">Real-time Sourcing</p>
                 <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Decentralized Supply Chain</p>
              </div>
           </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
             <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
               © {new Date().getFullYear()} CHIRICHARO GLOBAL INC.
             </p>
             <div className="flex gap-6">
                <a href="#" className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors italic">Privacy Protocol</a>
                <a href="#" className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors italic">Service Agreement</a>
             </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 italic">
              <Mail className="h-3 w-3 text-brand-orange" />
              <span>LOGISTICS@CHIRICHARO.COM</span>
            </div>
            
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
              <Globe className="h-4 w-4 text-brand-orange" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'am')}
                className="text-[10px] font-black uppercase tracking-widest text-white bg-transparent border-none focus:ring-0 cursor-pointer outline-none"
              >
                <option value="en" className="bg-brand-dark">English</option>
                <option value="am" className="bg-brand-dark">አማርኛ</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
