import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AlertsStackParamList } from './types';
import { useThemeColors } from '../theme';
import AlertsListScreen from '../screens/alerts/AlertsListScreen';
import AlertDetailScreen from '../screens/alerts/AlertDetailScreen';
import EmergencySOSScreen from '../screens/alerts/EmergencySOSScreen';
import EvacuationRouteScreen from '../screens/alerts/EvacuationRouteScreen';

const Stack = createNativeStackNavigator<AlertsStackParamList>();

export default function AlertsStack() {
  const colors = useThemeColors();
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="AlertsList"
        component={AlertsListScreen}
        options={{ title: t('alerts.title') }}
      />
      <Stack.Screen
        name="AlertDetail"
        component={AlertDetailScreen}
        options={{ title: t('alerts.detail') }}
      />
      <Stack.Screen
        name="EmergencySOS"
        component={EmergencySOSScreen}
        options={{ title: t('alerts.emergency'), headerStyle: { backgroundColor: '#DC2626' }, headerTintColor: '#fff' }}
      />
      <Stack.Screen
        name="EvacuationRoute"
        component={EvacuationRouteScreen}
        options={{ title: t('alerts.evacuationRoute') }}
      />
    </Stack.Navigator>
  );
}
