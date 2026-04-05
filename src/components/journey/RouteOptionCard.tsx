/**
 * RouteOptionCard - Route comparison card
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../theme';
import type { Route, TravelMode } from '../../types';

export interface RouteOptionCardProps {
  route: Route;
  isSelected?: boolean;
  onPress?: () => void;
}

const MODE_ICONS: Record<TravelMode, keyof typeof MaterialCommunityIcons.glyphMap> = {
  driving: 'car',
  transit: 'bus',
  walking: 'walk',
  cycling: 'bike',
  multimodal: 'swap-horizontal',
};

export function RouteOptionCard({ route, isSelected = false, onPress }: RouteOptionCardProps) {
  const theme = useAppTheme();
  const { t } = useTranslation();

  const durationMin = Math.round(route.durationInTraffic / 60);
  const delayMin = Math.max(0, Math.round((route.durationInTraffic - route.duration) / 60));
  const distanceKm = (route.distance / 1000).toFixed(1);
  const co2Grams = Math.round(route.carbonEmission);
  const modeIcon = MODE_ICONS[route.mode] ?? 'map-marker-path';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.palette.card,
          borderColor: isSelected ? theme.brand.accent : theme.palette.border,
          borderWidth: isSelected ? 2 : 1,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={
        isSelected
          ? `${t('journey.route.selected')}: ${durationMin} ${t('units.min')}`
          : `${durationMin} ${t('units.min')}`
      }
    >
      {/* Header: mode icon + duration */}
      <View style={styles.header}>
        <View style={[styles.modeIcon, { backgroundColor: theme.brand.primary + '18' }]}>
          <MaterialCommunityIcons
            name={modeIcon}
            size={22}
            color={theme.brand.primary}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.duration, { color: theme.palette.text }]}>
            {t('journey.route.duration', { minutes: durationMin })}
          </Text>
          {delayMin > 0 && (
            <Text style={[styles.delay, { color: theme.semantic.error }]}>
              {t('journey.route.delay', { minutes: delayMin })}
            </Text>
          )}
        </View>
        {isSelected && (
          <MaterialCommunityIcons
            name="check-circle"
            size={22}
            color={theme.brand.accent}
          />
        )}
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <MaterialCommunityIcons
            name="map-marker-distance"
            size={14}
            color={theme.palette.icon}
          />
          <Text style={[styles.statText, { color: theme.palette.textSecondary }]}>
            {t('journey.route.distance', { km: distanceKm })}
          </Text>
        </View>

        <View style={styles.stat}>
          <MaterialCommunityIcons name="leaf" size={14} color={theme.semantic.success} />
          <Text style={[styles.statText, { color: theme.palette.textSecondary }]}>
            {t('journey.route.co2', { grams: co2Grams })}
          </Text>
        </View>

        {route.fare != null && route.fare > 0 && (
          <View style={styles.stat}>
            <MaterialCommunityIcons
              name="cash"
              size={14}
              color={theme.palette.icon}
            />
            <Text style={[styles.statText, { color: theme.palette.textSecondary }]}>
              {t('journey.route.fare', { amount: route.fare })}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  duration: {
    fontSize: 18,
    fontWeight: '700',
  },
  delay: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default RouteOptionCard;
