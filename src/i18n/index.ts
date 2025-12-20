import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from './locales/en/common.json';
import enBanner from './locales/en/banner.json';
import enEditor from './locales/en/editor.json';
import enAuth from './locales/en/auth.json';
import enModal from './locales/en/modal.json';
import enMessage from './locales/en/message.json';

import jaCommon from './locales/ja/common.json';
import jaBanner from './locales/ja/banner.json';
import jaEditor from './locales/ja/editor.json';
import jaAuth from './locales/ja/auth.json';
import jaModal from './locales/ja/modal.json';
import jaMessage from './locales/ja/message.json';

// Resource bundle
const resources = {
  en: {
    common: enCommon,
    banner: enBanner,
    editor: enEditor,
    auth: enAuth,
    modal: enModal,
    message: enMessage,
  },
  ja: {
    common: jaCommon,
    banner: jaBanner,
    editor: jaEditor,
    auth: jaAuth,
    modal: jaModal,
    message: jaMessage,
  },
};

i18n
  .use(LanguageDetector) // Browser language detection
  .use(initReactI18next) // React integration
  .init({
    resources,
    lng: 'en', // Default language (English as base)
    fallbackLng: 'en', // Fallback language
    defaultNS: 'common', // Default namespace
    ns: ['common', 'banner', 'editor', 'auth', 'modal', 'message'],

    interpolation: {
      escapeValue: false, // React already escapes
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'banalist_language',
    },

    debug: import.meta.env.DEV, // Enable debug in development
  });

export default i18n;