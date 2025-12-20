'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  // Evitar hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-100">
        <Globe className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">ES</span>
      </div>
    );
  }

  const currentLang = i18n.language;
  const isSpanish = currentLang === 'es';

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200 group"
      aria-label={`Change language to ${isSpanish ? 'English' : 'Spanish'}`}
    >
      <Globe className="h-4 w-4 text-gray-600 group-hover:text-gray-800 transition-colors" />
      <div className="flex items-center space-x-1">
        <span
          className={`text-sm font-semibold transition-colors ${
            isSpanish ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          ES
        </span>
        <span className="text-gray-400">/</span>
        <span
          className={`text-sm font-semibold transition-colors ${
            !isSpanish ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          EN
        </span>
      </div>
    </button>
  );
}
