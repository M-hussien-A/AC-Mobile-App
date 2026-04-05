import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ServicesStackParamList } from './types';
import { useThemeColors } from '../theme';
import ServicesHubScreen from '../screens/services/ServicesHubScreen';
import ParkingMapScreen from '../screens/services/parking/ParkingMapScreen';
import ParkingDetailScreen from '../screens/services/parking/ParkingDetailScreen';
import ParkingReservationScreen from '../screens/services/parking/ParkingReservationScreen';
import ParkingPaymentScreen from '../screens/services/parking/ParkingPaymentScreen';
import ParkingSessionScreen from '../screens/services/parking/ParkingSessionScreen';
import TransitRoutesScreen from '../screens/services/transit/TransitRoutesScreen';
import TransitScheduleScreen from '../screens/services/transit/TransitScheduleScreen';
import TransitAlertsScreen from '../screens/services/transit/TransitAlertsScreen';
import TransitFarePaymentScreen from '../screens/services/transit/TransitFarePaymentScreen';
import BikeScooterMapScreen from '../screens/services/sharedMobility/BikeScooterMapScreen';
import RideHailingScreen from '../screens/services/sharedMobility/RideHailingScreen';
import EVChargingMapScreen from '../screens/services/sharedMobility/EVChargingMapScreen';
import LoadingZoneScreen from '../screens/services/LoadingZoneScreen';
import PointsOfInterestScreen from '../screens/services/PointsOfInterestScreen';

const Stack = createNativeStackNavigator<ServicesStackParamList>();

export default function ServicesStack() {
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
        name="ServicesHub"
        component={ServicesHubScreen}
        options={{ title: t('services.title') }}
      />
      <Stack.Screen name="ParkingMap" component={ParkingMapScreen} options={{ title: t('parking.map') }} />
      <Stack.Screen name="ParkingDetail" component={ParkingDetailScreen} options={{ title: t('parking.details') }} />
      <Stack.Screen name="ParkingReservation" component={ParkingReservationScreen} options={{ title: t('parking.reserve') }} />
      <Stack.Screen name="ParkingPayment" component={ParkingPaymentScreen} options={{ title: t('payment.title') }} />
      <Stack.Screen name="ParkingSession" component={ParkingSessionScreen} options={{ title: t('parking.session.title') }} />
      <Stack.Screen name="TransitRoutes" component={TransitRoutesScreen} options={{ title: t('transit.routes') }} />
      <Stack.Screen name="TransitSchedule" component={TransitScheduleScreen} options={{ title: t('transit.schedule') }} />
      <Stack.Screen name="TransitAlerts" component={TransitAlertsScreen} options={{ title: t('transit.alerts') }} />
      <Stack.Screen name="TransitFarePayment" component={TransitFarePaymentScreen} options={{ title: t('transit.farePayment') }} />
      <Stack.Screen name="BikeScooterMap" component={BikeScooterMapScreen} options={{ title: t('mobility.bikeScooter') }} />
      <Stack.Screen name="RideHailing" component={RideHailingScreen} options={{ title: t('mobility.rideHailing') }} />
      <Stack.Screen name="EVChargingMap" component={EVChargingMapScreen} options={{ title: t('mobility.evCharging') }} />
      <Stack.Screen name="LoadingZone" component={LoadingZoneScreen} options={{ title: t('services.loadingZones') }} />
      <Stack.Screen name="PointsOfInterest" component={PointsOfInterestScreen} options={{ title: t('services.poi') }} />
    </Stack.Navigator>
  );
}
