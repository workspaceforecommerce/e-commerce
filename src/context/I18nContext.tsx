import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'hi' | 'es';

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

const dictionary: Translations = {
  dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड', es: 'Tablero' },
  products: { en: 'Products Catalog', hi: 'उत्पाद कैटलॉग', es: 'Catálogo de Productos' },
  orders: { en: 'Order Master', hi: 'ऑर्डर मास्टर', es: 'Gestor de Pedidos' },
  customers: { en: 'Customers', hi: 'ग्राहक', es: 'Clientes' },
  cms: { en: 'Content & Banners', hi: 'सामग्री और बैनर', es: 'Contenido y Banners' },
  users: { en: 'User Accounts & RBAC', hi: 'उपयोगकर्ता खाते', es: 'Usuarios y Permisos' },
  logs: { en: 'API & Push Logs', hi: 'एपीआई लॉग्स', es: 'Registros de API' },
  search_placeholder: { en: 'Search anything (Ctrl + K)...', hi: 'खोजें (Ctrl + K)...', es: 'Buscar algo (Ctrl + K)...' },
  select_language: { en: 'Language', hi: 'भाषा', es: 'Idioma' },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    if (dictionary[key] && dictionary[key][language]) {
      return dictionary[key][language];
    }
    return key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
