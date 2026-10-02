'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi' | 'mr';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
    mr: string;
  };
}

const TRANSLATIONS: Translations = {
  // Navigation
  nav_marketplace: { en: 'Marketplace', hi: 'मंडी बाज़ार', mr: 'बाजारपेठ' },
  nav_forecast: { en: 'Price Forecast', hi: 'भाव पूर्वानुमान', mr: 'भाव अंदाज' },
  nav_logistics: { en: 'Smart Logistics', hi: 'स्मार्ट लॉजिस्टिक्स', mr: 'वाहतूक व्यवस्था' },
  nav_tenders: { en: 'Gov Tenders', hi: 'सरकारी टेंडर', mr: 'शासकीय निविदा' },
  nav_farmer: { en: 'Farmer Portal', hi: 'किसान पोर्टल', mr: 'शेतकरी पोर्टल' },
  nav_buyer: { en: 'Buyer Portal', hi: 'खरीदार पोर्टल', mr: 'खरेदीदार पोर्टल' },
  nav_signin: { en: 'Sign In', hi: 'लॉग इन करें', mr: 'लॉगिन करा' },
  nav_signout: { en: 'Sign Out', hi: 'लॉग आउट', mr: 'लॉगआउट' },

  // Hero
  hero_badge: { en: 'CropNex Fresh • 100% Guaranteed', hi: 'क्रॉपनेक्स फ्रेश • 100% ताज़ा गारंटी', mr: 'क्रॉपनेक्स फ्रेश • १००% ताजे हमी' },
  hero_title_1: { en: 'Direct Farm-to-Market', hi: 'खेत से सीधे बाज़ार', mr: 'शेतातून थेट बाजारात' },
  hero_title_2: { en: 'Without Middlemen', hi: 'बिना बिचौलियों के', mr: 'मध्यस्थांशिवाय थेट विक्री' },
  hero_sub: {
    en: 'Empowering verified farmers to connect directly with wholesale and bulk buyers. Maximize farmer realizations by up to 40% with AI-driven pricing and smart logistics.',
    hi: 'सत्यापित किसानों को सीधे थोक खरीदारों से जोड़ना। एआई मूल्य पूर्वानुमान और स्मार्ट लॉजिस्टिक्स द्वारा किसानों की आय 40% तक बढ़ाएं।',
    mr: 'शेतकऱ्यांना थेट घाऊक खरेदीदारांशी जोडा. कृत्रिम बुद्धिमत्ता भाव अंदाज आणि स्मार्ट वाहतुकीद्वारे शेतकऱ्यांचा नफा ४०% पर्यंत वाढवा.',
  },
  btn_explore: { en: 'Explore Marketplace', hi: 'बाज़ार देखें', mr: 'बाजारपेठ पहा' },
  btn_sell: { en: 'Sell Produce (Farmer)', hi: 'उपज बेचें (किसान)', mr: 'शेतमाल विका (शेतकरी)' },

  // Marketplace
  market_title: { en: 'Direct Farm-Gate Marketplace', hi: 'प्रत्यक्ष खेत-गेट बाज़ार', mr: 'थेट शेतमाल बाजारपेठ' },
  market_search_ph: { en: 'Search tomatoes, onions, grains, district...', hi: 'टमाटर, प्याज, अनाज, जिला खोजें...', mr: 'टोमॅटो, कांदा, धान्य, जिल्हा शोधा...' },
  add_to_cart: { en: 'Add to Cart', hi: 'कार्ट में जोड़ें', mr: 'कार्टमध्ये जोडा' },
  price_per_kg: { en: 'per kg', hi: 'प्रति किलो', mr: 'प्रति किलो' },
  available: { en: 'Available', hi: 'उपलब्ध', mr: 'उपलब्ध' },
  min_order: { en: 'Min Order', hi: 'न्यूनतम ऑर्डर', mr: 'किमान ऑर्डर' },
  organic: { en: 'Organic Certified', hi: 'जैविक प्रमाणित', mr: 'सेंद्रिय प्रमाणित' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('cropnex_lang') as Language;
    if (saved && ['en', 'hi', 'mr'].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('cropnex_lang', lang);
  };

  const t = (key: string): string => {
    if (TRANSLATIONS[key] && TRANSLATIONS[key][language]) {
      return TRANSLATIONS[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
