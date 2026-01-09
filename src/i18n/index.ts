import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../locales/en.json';
import es from '../locales/es.json';

const LANGUAGE_STORAGE_KEY = 'app_language';

const resources = {
  en: { translation: en },
  es: { translation: es },
};

const initI18n = async () => {
  // Try to get saved language
  const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  
  // Get device language
  const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';
  
  // Use saved language or device language
  const initialLanguage = savedLanguage || (deviceLanguage === 'es' ? 'es' : 'en');

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

export default initI18n;