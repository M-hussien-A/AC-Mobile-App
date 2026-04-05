/**
 * ParkingMapScreen - Map with parking markers and bottom list
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import MapView from '../../../utils/MapView';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../../theme';
import { FilterChips, SkeletonCard } from '../../../components/common';
import { ParkingMarker } from '../../../components/map/ParkingMarker';
import { ParkingCard } from '../../../components/parking/ParkingCard';
import { useParkingStore } from '../../../stores';
import * as parkingService from '../../../services/parkingService';
import { ServicesStackParamList } from '../../../navigation/types';
import type { ParkingFacility } from '../../../types';

type Nav = NativeStackNavigationProp<ServicesStackParamList>;

const ACUD_CENTER = { latitude: 30.02, longitude: 31.76, latitudeDelta: 0.03, longitudeDelta: 0.03 };

export default function ParkingMapScreen() {
  const { height: screenHeight } = useWindowDimensions();
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { facilities, setFacilities, filters, updateFilter } = useParkingStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await parkingService.getParkingFacilities();
      setFacilities(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [setFacilities]);

  useEffect(() => { loadData(); }, [loadData]);

  const typeOptions = useMemo(() => [
    { label: t('alerts.categories.all'), value: 'all' },
    { label: t('parking.type.onStreet'), value: 'onStreet' },
    { label: t('parking.type.offStreet'), value: 'offStreet' },
    { label: t('parking.type.parkAndRide'), value: 'parkAndRide' },
  ], [t]);

  const filteredFacilities = useMemo(() => {
    let result = [...facilities];
    const typeFilter = filters.type;
    if (typeFilter && typeFilter !== 'all') {
      const typeMap: Record<string, string[]> = {
        onStreet: ['street'],
        offStreet: ['garage', 'underground'],
        parkAndRide: ['lot'],
      };
      const allowed = typeMap[typeFilter] ?? [typeFilter];
      result = result.filter((f) => allowed.includes(f.type));
    }
    if (filters.hasEVCharging) {
      result = result.filter((f) => f.evChargingSpaces > 0);
    }
    if (filters.hasDisabledAccess) {
      result = result.filter((f) => f.disabledSpaces > 0);
    }
    result.sort((a, b) => (a.distanceFromUser ?? 999) - (b.distanceFromUser ?? 999));
    return result;
  }, [facilities, filters]);

  const handleMarkerPress = useCallback((facility: ParkingFacility) => {
    navigation.navigate('ParkingDetail', { facilityId: facility.id });
  }, [navigation]);

  const handleCardPress = useCallback((facilityId: string) => {
    navigation.navigate('ParkingDetail', { facilityId });
  }, [navigation]);

  const featureFilterOptions = useMemo(() => [
    { label: t('parking.features.evCharging'), value: 'ev' },
    { label: t('parking.features.disabledAccess'), value: 'accessible' },
  ], [t]);

  const selectedFeatures = useMemo(() => {
    const arr: string[] = [];
    if (filters.hasEVCharging) arr.push('ev');
    if (filters.hasDisabledAccess) arr.push('accessible');
    return arr;
  }, [filters]);

  const handleFeatureFilter = useCallback((value: string | string[]) => {
    const arr = Array.isArray(value) ? value : [value];
    updateFilter('hasEVCharging', arr.includes('ev'));
    updateFilter('hasDisabledAccess', arr.includes('accessible'));
  }, [updateFilter]);

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <Pressable
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={loadData}
          accessibilityRole="button"
        >
          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Map */}
      <MapView style={[styles.map, { height: screenHeight * 0.4 }]} initialRegion={ACUD_CENTER} showsUserLocation>
        {filteredFacilities.map((facility) => (
          <ParkingMarker
            key={facility.id}
            facility={facility}
            onPress={handleMarkerPress}
          />
        ))}
      </MapView>

      {/* Bottom list */}
      <View style={[styles.bottomSheet, { backgroundColor: colors.surface }]}>
        {/* Filters */}
        <View style={styles.filtersRow}>
          <FilterChips
            options={typeOptions}
            selectedValue={filters.type ?? 'all'}
            onSelect={(v) => updateFilter('type', v as string)}
          />
        </View>
        <FilterChips
          options={featureFilterOptions}
          selectedValue={selectedFeatures}
          onSelect={handleFeatureFilter}
          multiple
          style={styles.featureFilters}
        />

        {/* List */}
        {loading ? (
          <View style={styles.skeletonList}>
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : (
          <FlatList
            data={filteredFacilities}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.cardWrapper}>
                <ParkingCard
                  facility={item}
                  onPress={() => handleCardPress(item.id)}
                  distance={
                    item.distanceFromUser != null
                      ? `${item.distanceFromUser.toFixed(1)} ${t('units.km')}`
                      : undefined
                  }
                />
              </View>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t('common.noResults')}
              </Text>
            }
          />
        )}
      </View>
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
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  map: {
    // height set dynamically via useWindowDimensions
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSheet: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -16,
    paddingTop: 12,
  },
  filtersRow: {
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  featureFilters: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  skeletonList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  cardWrapper: {
    marginBottom: 0,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 14,
  },
});
