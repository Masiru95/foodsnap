import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../locales/en.json';
import es from '../locales/es.json';
import pt from '../locales/pt.json';
import it from '../locales/it.json';

const LANGUAGE_STORAGE_KEY = 'app_language';

const resources = {
  en: { translation: en },
  es: { translation: es },
  pt: { translation: pt },
  it: { translation: it },
};

// Supported languages for device language detection
const supportedLanguages = ['en', 'es', 'pt', 'it'];

const initI18n = async () => {
  // Try to get saved language
  const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  
  // Get device language
  const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';
  
  // Use saved language, or device language if supported, otherwise default to English
  let initialLanguage = savedLanguage;
  
  if (!initialLanguage) {
    if (supportedLanguages.includes(deviceLanguage)) {
      initialLanguage = deviceLanguage;
    } else {
      initialLanguage = 'en';
    }
  }

  await i18n.use(initReactI18next).init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

  return i18n;
};

export const changeLanguage = async (language: string) => {
  await i18n.changeLanguage(language);
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
};

export const getSupportedLanguages = () => [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
];

export default initI18n;
