import { create } from 'zustand';

interface SettingsState {
  isDarkMode: boolean;
  language: 'ar' | 'en';
  units: 'km' | 'miles';
  defaultMapLayers: string[];
  avoidTolls: boolean;
  avoidHighways: boolean;
  avoidWorkZones: boolean;
  notificationPreferences: Record<string, boolean>;
  toggleDarkMode: () => void;
  setLanguage: (lang: 'ar' | 'en') => void;
  setUnits: (units: 'km' | 'miles') => void;
  setDefaultMapLayers: (layers: string[]) => void;
  setAvoidOption: (key: string, value: boolean) => void;
  setNotificationPreference: (key: string, value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  isDarkMode: false,
  language: 'ar',
  units: 'km',
  defaultMapLayers: ['trafficFlow', 'incidents'],
  avoidTolls: false,
  avoidHighways: false,
  avoidWorkZones: false,
  notificationPreferences: {
    traffic: true,
    safety: true,
    transit: true,
    weather: true,
    enforcement: true,
    parking: true,
  },
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  setLanguage: (language) => set({ language }),
  setUnits: (units) => set({ units }),
  setDefaultMapLayers: (layers) => set({ defaultMapLayers: layers }),
  setAvoidOption: (key, value) =>
    set((state) => ({ ...state, [key]: value })),
  setNotificationPreference: (key, value) =>
    set((state) => ({
      notificationPreferences: { ...state.notificationPreferences, [key]: value },
    })),
}));
