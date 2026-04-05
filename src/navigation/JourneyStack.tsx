import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { JourneyStackParamList } from './types';
import { useThemeColors } from '../theme';
import JourneyPlannerScreen from '../screens/journey/JourneyPlannerScreen';
import RouteResultsScreen from '../screens/journey/RouteResultsScreen';
import NavigationScreen from '../screens/journey/NavigationScreen';
import SavedRoutesScreen from '../screens/journey/SavedRoutesScreen';
import TripHistoryScreen from '../screens/journey/TripHistoryScreen';

const Stack = createNativeStackNavigator<JourneyStackParamList>();

export default function JourneyStack() {
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
        name="JourneyPlanner"
        component={JourneyPlannerScreen}
        options={{ title: t('journey.planTrip') }}
      />
      <Stack.Screen
        name="RouteResults"
        component={RouteResultsScreen}
        options={{ title: t('journey.routeResults') }}
      />
      <Stack.Screen
        name="Navigation"
        component={NavigationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SavedRoutes"
        component={SavedRoutesScreen}
        options={{ title: t('journey.savedRoutes') }}
      />
      <Stack.Screen
        name="TripHistory"
        component={TripHistoryScreen}
        options={{ title: t('journey.tripHistory') }}
      />
    </Stack.Navigator>
  );
}
