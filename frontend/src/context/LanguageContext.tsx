import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageCode } from '../../../shared/types';
import enDict from '../locales/en.json';
import teDict from '../locales/te.json';
import hiDict from '../locales/hi.json';

type Dictionary = Record<string, string>;

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
}

const dictionaries: Record<LanguageCode, Dictionary> = {
  en: enDict,
  te: teDict,
  hi: hiDict
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    return (localStorage.getItem('tailorhub_lang') as LanguageCode) || 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    localStorage.setItem('tailorhub_lang', lang);
    setLanguageState(lang);
  };

  const t = (key: string, fallback?: string): string => {
    const dict = dictionaries[language] || dictionaries.en;
    return dict[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
