import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { I18nManager, LogBox, Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n';
import { ThemeProvider, useThemeColors } from './src/theme';
import { useSettingsStore } from './src/stores/settingsStore';
import { AppNavigator } from './src/navigation';

LogBox.ignoreLogs(['Reanimated', 'ViewPropTypes']);

function ResponsiveContainer({ children }: { children: React.ReactNode }) {
  const colors = useThemeColors();
  if (Platform.OS !== 'web') return <>{children}</>;
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center' }}>
      <View style={{ flex: 1, width: '100%', maxWidth: 480 }}>
        {children}
      </View>
    </View>
  );
}

function AppContent() {
  const isDarkMode = useSettingsStore((s) => s.isDarkMode);
  const language = useSettingsStore((s) => s.language);

  useEffect(() => {
    const isRTL = language === 'ar';
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
    }
  }, [language]);

  return (
    <ThemeProvider isDark={isDarkMode}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <ResponsiveContainer>
        <AppNavigator />
      </ResponsiveContainer>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <I18nextProvider i18n={i18n}>
          <AppContent />
        </I18nextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
