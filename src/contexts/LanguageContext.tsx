import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../lang/en.json';
import vi from '../lang/vi.json';
import zh from '../lang/zh.json';
import ja from '../lang/ja.json';
import de from '../lang/de.json';
import ru from '../lang/ru.json';
import uk from '../lang/uk.json';

type Language = 'en' | 'vi' | 'zh' | 'ja' | 'de' | 'ru' | 'uk';
type Translations = typeof en;

const languages: Record<Language, Translations> = {
  en,
  vi,
  zh,
  ja,
  de,
  ru,
  uk
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    chrome.storage.local.get(['uiLanguage'], (result) => {
      if (result.uiLanguage && languages[result.uiLanguage as Language]) {
        setLanguageState(result.uiLanguage as Language);
      }
    });

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.uiLanguage) {
        setLanguageState(changes.uiLanguage.newValue as Language);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    chrome.storage.local.set({ uiLanguage: lang });
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    
    // Check primary language
    let value: any = languages[language];
    for (const k of keys) {
       if (value && typeof value === 'object' && k in value) {
         value = value[k];
       } else {
         value = undefined;
         break;
       }
    }

    if (value && typeof value === 'string') return value;

    // Fallback to English if not found or not a string
    let fallbackValue: any = languages['en'];
    for (const k of keys) {
       if (fallbackValue && typeof fallbackValue === 'object' && k in fallbackValue) {
         fallbackValue = fallbackValue[k];
       } else {
         fallbackValue = undefined;
         break;
       }
    }
    
    if (fallbackValue && typeof fallbackValue === 'string') return fallbackValue;

    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
