import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'am';

interface Translations {
  [key: string]: {
    en: string;
    am: string;
  };
}

const translations: Translations = {
  // General
  'app.name': { en: 'Chiricharo', am: 'ጭሪጫሮ' },
  'nav.home': { en: 'Home', am: 'ዋና ገጽ' },
  'nav.explore': { en: 'Explore', am: 'ያስሱ' },
  'nav.cart': { en: 'Cart', am: 'ዘንቢል' },
  'nav.login': { en: 'Login', am: 'ግባ' },
  'nav.register': { en: 'Register', am: 'ተመዝገብ' },
  'nav.dashboard': { en: 'Dashboard', am: 'ዳሽቦርድ' },
  'nav.logout': { en: 'Logout', am: 'ውጣ' },
  
  // Roles
  'role.admin': { en: 'Admin', am: 'አስተዳዳሪ' },
  'role.seller': { en: 'Seller', am: 'ሻጭ' },
  'role.buyer': { en: 'Buyer', am: 'ገዢ' },

  // Home
  'home.hero.title': { en: 'Welcome to Chiricharo', am: 'እንኳን ወደ ጭሪጫሮ በደህና መጡ' },
  'home.hero.subtitle': { en: 'The best multi-vendor marketplace in Ethiopia.', am: 'በኢትዮጵያ ውስጥ ምርጡ የብዙ ሻጮች የገበያ ቦታ።' },
  'home.hero.cta': { en: 'Start Shopping', am: 'ግብይት ይጀምሩ' },
  'home.featured': { en: 'Featured Products', am: 'ተለይተው የቀረቡ ምርቶች' },

  // Auth
  'auth.login.title': { en: 'Login to your account', am: 'ወደ መለያዎ ይግቡ' },
  'auth.register.title': { en: 'Create an account', am: 'መለያ ይፍጠሩ' },
  'auth.email': { en: 'Email Address', am: 'የኢሜይል አድራሻ' },
  'auth.password': { en: 'Password', am: 'የይለፍ ቃል' },
  'auth.name': { en: 'Full Name', am: 'ሙሉ ስም' },
  'auth.role.select': { en: 'I want to...', am: 'እኔ የምፈልገው...' },
  'auth.role.buyer': { en: 'Buy products', am: 'ምርቶችን መግዛት' },
  'auth.role.seller': { en: 'Sell products', am: 'ምርቶችን መሸጥ' },
  'auth.submit.login': { en: 'Sign In', am: 'ግባ' },
  'auth.submit.register': { en: 'Sign Up', am: 'ተመዝገብ' },

  // Seller Registration Info
  'seller.info.title': { en: 'Seller Verification', am: 'የሻጭ ማረጋገጫ' },
  'seller.info.desc': { en: 'To ensure trust and prevent scams, all sellers must provide legal business information. All products go through admin verification before being published.', am: 'እምነትን ለማረጋገጥ እና ማጭበርበርን ለመከላከል ሁሉም ሻጮች ህጋዊ የንግድ መረጃ ማቅረብ አለባቸው። ሁሉም ምርቶች ከመታተማቸው በፊት በአስተዳዳሪ ማረጋገጫ ያልፋሉ።' },
  'seller.info.address': { en: 'Business Address', am: 'የንግድ አድራሻ' },
  'seller.info.phone': { en: 'Phone Number', am: 'ስልክ ቁጥር' },
  'seller.info.details': { en: 'Additional Verification Details (TIN, etc.)', am: 'ተጨማሪ የማረጋገጫ ዝርዝሮች (TIN፣ ወዘተ)' },
  'seller.info.submit': { en: 'Submit for Verification', am: 'ለማረጋገጫ አስገባ' },

  // Products
  'product.price': { en: 'ETB', am: 'ብር' },
  'product.addToCart': { en: 'Add to Cart', am: 'ወደ ዘንቢል አክል' },
  'product.outOfStock': { en: 'Out of Stock', am: 'ከክምችት አልቋል' },
  
  // Cart & Checkout
  'cart.title': { en: 'Shopping Cart', am: 'የግዢ ዘንቢል' },
  'cart.empty': { en: 'Your cart is empty', am: 'ዘንቢልዎ ባዶ ነው' },
  'cart.total': { en: 'Total', am: 'ድምር' },
  'cart.checkout': { en: 'Proceed to Checkout', am: 'ወደ ክፍያ ይቀጥሉ' },
  'checkout.title': { en: 'Checkout', am: 'ክፍያ' },
  'checkout.shipping': { en: 'Shipping Address', am: 'የመላኪያ አድራሻ' },
  'checkout.placeOrder': { en: 'Place Order', am: 'ትዕዛዝ ያስገቡ' },
  'checkout.success': { en: 'Order placed successfully!', am: 'ትዕዛዙ በተሳካ ሁኔታ ገብቷል!' },

  // Dashboard (Admin/Seller)
  'dashboard.products': { en: 'Products', am: 'ምርቶች' },
  'dashboard.orders': { en: 'Orders', am: 'ትዕዛዞች' },
  'dashboard.users': { en: 'Users', am: 'ተጠቃሚዎች' },
  'dashboard.addProduct': { en: 'Add Product', am: 'ምርት አክል' },
  'dashboard.pending': { en: 'Pending', am: 'በመጠባበቅ ላይ' },
  'dashboard.approved': { en: 'Approved', am: 'የጸደቀ' },
  'dashboard.rejected': { en: 'Rejected', am: 'ውድቅ የተደረገ' },
  
  // Legal
  'legal.privacy': { en: 'Privacy Policy', am: 'የግላዊነት ፖሊሲ' },
  'legal.terms': { en: 'Terms and Conditions', am: 'ውሎች እና ሁኔታዎች' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  // Load language from localStorage if available
  useEffect(() => {
    const savedLang = localStorage.getItem('chiricharo_lang') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'am')) {
      setLanguage(savedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('chiricharo_lang', lang);
  };

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language];
    }
    console.warn(`Translation key not found: ${key}`);
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
