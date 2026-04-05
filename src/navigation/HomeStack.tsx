import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { HomeStackParamList } from './types';
import { useThemeColors } from '../theme';
import HomeScreen from '../screens/home/HomeScreen';
import TrafficMapScreen from '../screens/home/TrafficMapScreen';
import IncidentDetailScreen from '../screens/home/IncidentDetailScreen';
import DMSMessageListScreen from '../screens/home/DMSMessageListScreen';
import RoadWorkDetailScreen from '../screens/home/RoadWorkDetailScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
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
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="TrafficMap"
        component={TrafficMapScreen}
        options={{ title: t('home.trafficMap'), headerShown: false }}
      />
      <Stack.Screen
        name="IncidentDetail"
        component={IncidentDetailScreen}
        options={{ title: t('incidents.detail') }}
      />
      <Stack.Screen
        name="DMSMessageList"
        component={DMSMessageListScreen}
        options={{ title: t('dms.title') }}
      />
      <Stack.Screen
        name="RoadWorkDetail"
        component={RoadWorkDetailScreen}
        options={{ title: t('roadWork.detail') }}
      />
    </Stack.Navigator>
  );
}
