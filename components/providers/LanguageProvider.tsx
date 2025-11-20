'use client';

import { createContext, useContext, ReactNode } from 'react';

interface LanguageContextType {
  isArabic: boolean;
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  content: Record<string, any>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Stub implementation - defaults to Arabic
  const value: LanguageContextType = {
    isArabic: true,
    language: 'ar',
    setLanguage: () => {},
    content: {},
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

