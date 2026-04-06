import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MainTabParamList } from './types';
import { useThemeColors } from '../theme';
import { useAlertStore } from '../stores/alertStore';
import HomeStack from './HomeStack';
import JourneyStack from './JourneyStack';
import ServicesStack from './ServicesStack';
import AlertsStack from './AlertsStack';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const unreadCount = useAlertStore((s) => s.alerts.filter((a) => !a.isRead).length);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'web' ? 70 : 60,
          paddingBottom: Platform.OS === 'web' ? 12 : 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: t('tabs.home'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="JourneyTab"
        component={JourneyStack}
        options={{
          tabBarLabel: t('tabs.journey'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="map-marker-path" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ServicesTab"
        component={ServicesStack}
        options={{
          tabBarLabel: t('tabs.services'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="apps" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AlertsTab"
        component={AlertsStack}
        options={{
          tabBarLabel: t('tabs.alerts'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell-alert" size={size} color={color} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.critical, fontSize: 10 },
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
