import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager, Platform, NativeModules } from 'react-native';

import ar from './ar.json';
import en from './en.json';

const resources = {
  ar: { translation: ar },
  en: { translation: en },
} as const;

/**
 * Detect the device locale. Falls back to 'ar' (Arabic) as the default
 * since ACUD ITS primarily serves the New Administrative Capital in Egypt.
 */
function getDeviceLocale(): string {
  try {
    let locale: string | undefined;

    if (Platform.OS === 'ios') {
      locale =
        NativeModules.SettingsManager?.settings?.AppleLocale ??
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0];
    } else if (Platform.OS === 'android') {
      locale = NativeModules.I18nManager?.localeIdentifier;
    }

    if (locale?.startsWith('en')) return 'en';
    return 'ar';
  } catch {
    return 'ar';
  }
}

const defaultLanguage = getDeviceLocale();

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLanguage,
  fallbackLng: 'ar',
  keySeparator: false, // flat key structure like "home.searchPlaceholder"
  interpolation: {
    escapeValue: false, // React already escapes
  },
  react: {
    useSuspense: false,
  },
});

/**
 * Apply RTL layout direction based on the current language.
 * Should be called after language changes.
 */
export function applyRTL(language: string): void {
  const isRTL = language === 'ar';
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  }
}

// Apply RTL on initial load
applyRTL(defaultLanguage);

/**
 * Change the app language and update RTL layout accordingly.
 */
export async function changeLanguage(language: 'ar' | 'en'): Promise<void> {
  await i18n.changeLanguage(language);
  applyRTL(language);
}

/**
 * Returns true if the current language is RTL (Arabic).
 */
export function isRTL(): boolean {
  return i18n.language === 'ar';
}

export default i18n;
