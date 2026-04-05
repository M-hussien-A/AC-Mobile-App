/**
 * ServicesHubScreen - Service grid with 8 tiles in 2 columns
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme';
import { Card } from '../../components/common';
import { ServicesStackParamList } from '../../navigation/types';
import * as parkingService from '../../services/parkingService';

type Nav = NativeStackNavigationProp<ServicesStackParamList>;

interface ServiceTile {
  key: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  labelKey: string;
  route: keyof ServicesStackParamList;
  countValue?: number;
  color: string;
}

const TILE_GAP = 12;
const SCREEN_PADDING = 16;

export default function ServicesHubScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const screenWidth = Math.min(windowWidth, 480);
  const TILE_WIDTH = (screenWidth - SCREEN_PADDING * 2 - TILE_GAP) / 2;
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [availableCount, setAvailableCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const facilities = await parkingService.getParkingFacilities();
        if (mounted) {
          const total = facilities.reduce((sum, f) => sum + f.availableSpaces, 0);
          setAvailableCount(total);
        }
      } catch (e) {
        if (mounted) setError((e as Error).message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const tiles: ServiceTile[] = [
    { key: 'parking', icon: 'car', labelKey: 'services.parking', route: 'ParkingMap', countValue: availableCount ?? undefined, color: '#1F4E79' },
    { key: 'transit', icon: 'bus', labelKey: 'services.transit', route: 'TransitRoutes', color: '#22C55E' },
    { key: 'bikeScooter', icon: 'bicycle', labelKey: 'services.bikeScooter', route: 'BikeScooterMap', color: '#8B5CF6' },
    { key: 'rideHailing', icon: 'car-side', labelKey: 'services.rideHailing', route: 'RideHailing', color: '#F59E0B' },
    { key: 'evCharging', icon: 'ev-station', labelKey: 'services.evCharging', route: 'EVChargingMap', color: '#10B981' },
    { key: 'loadingZones', icon: 'truck', labelKey: 'services.loadingZones', route: 'LoadingZone', color: '#6366F1' },
    { key: 'poi', icon: 'map-marker', labelKey: 'services.poi', route: 'PointsOfInterest', color: '#EF4444' },
    { key: 'lowEmissions', icon: 'leaf', labelKey: 'services.lowEmissions', route: 'LEZInfo', color: '#059669' },
  ];

  const renderTile = ({ item }: { item: ServiceTile }) => (
    <Card
      style={[styles.tile, { width: TILE_WIDTH }]}
      onPress={() => navigation.navigate(item.route as any)}
      accessibilityLabel={t(item.labelKey)}
    >
      <View style={[styles.iconCircle, { backgroundColor: item.color + '15' }]}>
        <MaterialCommunityIcons name={item.icon} size={32} color={item.color} />
      </View>
      <Text style={[styles.tileLabel, { color: colors.text }]} numberOfLines={2}>
        {t(item.labelKey)}
      </Text>
      {item.countValue != null && (
        <View style={[styles.countBadge, { backgroundColor: colors.success + '20' }]}>
          <Text style={[styles.countText, { color: colors.success }]}>
            {item.countValue} {t('parking.available')}
          </Text>
        </View>
      )}
    </Card>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={tiles}
        renderItem={renderTile}
        keyExtractor={(item) => item.key}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  list: {
    padding: SCREEN_PADDING,
    gap: TILE_GAP,
  },
  row: {
    justifyContent: 'space-between',
  },
  tile: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 12,
    gap: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
