import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useThemeColors } from '../theme';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

const linking = {
  prefixes: ['acud-traveler://'],
  config: {
    screens: {
      HomeTab: {
        screens: {
          Home: 'home',
          TrafficMap: 'traffic-map',
          IncidentDetail: 'incident/:incidentId',
        },
      },
      JourneyTab: {
        screens: {
          JourneyPlanner: 'journey',
          Navigation: 'navigate/:routeId',
        },
      },
      ServicesTab: {
        screens: {
          ParkingMap: 'parking',
          ParkingDetail: 'parking/:facilityId',
          TransitRoutes: 'transit',
        },
      },
      AlertsTab: {
        screens: {
          AlertsList: 'alerts',
          AlertDetail: 'alert/:alertId',
          EmergencySOS: 'sos',
        },
      },
      ProfileTab: {
        screens: {
          Profile: 'profile',
          Wallet: 'wallet',
          ViolationHistory: 'violations',
        },
      },
    },
  },
};

export default function AppNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isDarkMode = useSettingsStore((s) => s.isDarkMode);
  const colors = useThemeColors();

  const navTheme = {
    ...(isDarkMode ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDarkMode ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <NavigationContainer linking={linking} theme={navTheme}>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
