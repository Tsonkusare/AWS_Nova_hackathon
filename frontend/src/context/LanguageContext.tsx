import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Language } from '../types';

interface Translations {
  [key: string]: string | Translations;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<Translations>({});

  useEffect(() => {
    fetch(`/locales/${language}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${language}`);
        return res.json();
      })
      .then((data) => setTranslations(data))
      .catch(() => {
        fetch('/locales/en.json')
          .then((res) => res.json())
          .then((data) => setTranslations(data));
      });
  }, [language]);

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let result: string | Translations = translations;
    for (const k of keys) {
      if (typeof result === 'object' && result !== null) {
        result = result[k];
      } else {
        return key;
      }
    }
    return typeof result === 'string' ? result : key;
  }, [translations]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
