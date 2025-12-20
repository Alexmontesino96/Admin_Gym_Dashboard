import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importar traducciones
import es from '@/locales/es.json';
import en from '@/locales/en.json';

const resources = {
  es: { translation: es },
  en: { translation: en },
};

// Obtener idioma del localStorage o usar español por defecto
const getStoredLanguage = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('language') || 'es';
  }
  return 'es';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getStoredLanguage(),
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false, // React ya escapa por defecto
    },
  });

// Guardar idioma cuando cambie
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lng);
  }
});

export default i18n;
