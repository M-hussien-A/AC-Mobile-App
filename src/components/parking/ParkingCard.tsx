/**
 * ParkingCard - Card for parking facility list
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../theme';
import type { ParkingFacility } from '../../types';

export interface ParkingCardProps {
  facility: ParkingFacility;
  onPress?: () => void;
  distance?: string;
}

const PARKING_TYPE_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  garage: 'garage',
  lot: 'parking',
  street: 'road-variant',
  underground: 'arrow-down-bold-circle',
};

const AMENITY_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  ev_charging: 'ev-station',
  disabled_access: 'wheelchair-accessibility',
  cctv: 'cctv',
  covered: 'shield-sun',
};

export function ParkingCard({ facility, onPress, distance }: ParkingCardProps) {
  const theme = useAppTheme();
  const { t, i18n } = useTranslation();

  const isAr = i18n.language === 'ar';
  const name = isAr ? facility.nameAr : facility.name;
  const ratio = facility.totalSpaces > 0 ? facility.availableSpaces / facility.totalSpaces : 0;

  const availColor =
    ratio >= 0.5
      ? theme.parking.available
      : ratio >= 0.2
        ? theme.parking.limited
        : theme.parking.full;

  const typeIcon = PARKING_TYPE_ICONS[facility.type] ?? 'parking';
  const typeLabel = t(`parking.type.${facility.type}` as const);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.palette.card,
          borderColor: theme.palette.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={name}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.nameRow}>
          <MaterialCommunityIcons name={typeIcon} size={20} color={theme.brand.primary} />
          <Text style={[styles.name, { color: theme.palette.text }]} numberOfLines={1}>
            {name}
          </Text>
        </View>
        <MaterialCommunityIcons
          name={I18nManager.isRTL ? 'chevron-left' : 'chevron-right'}
          size={20}
          color={theme.palette.icon}
        />
      </View>

      {/* Type badge */}
      <View style={[styles.badge, { backgroundColor: theme.palette.surfaceVariant }]}>
        <Text style={[styles.badgeText, { color: theme.palette.textSecondary }]}>
          {typeLabel}
        </Text>
      </View>

      {/* Availability bar */}
      <View style={styles.availSection}>
        <View style={[styles.availTrack, { backgroundColor: theme.palette.borderLight }]}>
          <View
            style={[
              styles.availFill,
              { width: `${ratio * 100}%`, backgroundColor: availColor },
            ]}
          />
        </View>
        <Text style={[styles.availText, { color: availColor }]}>
          {t('parking.card.spaces', { count: facility.availableSpaces })}
        </Text>
      </View>

      {/* Price and distance */}
      <View style={styles.footer}>
        <Text style={[styles.price, { color: theme.palette.text }]}>
          {t('parking.card.perHour', { amount: facility.ratePerHour })}
        </Text>
        {distance != null && (
          <Text style={[styles.distance, { color: theme.palette.textSecondary }]}>
            {t('parking.card.distance', { distance })}
          </Text>
        )}
      </View>

      {/* Amenity icons */}
      {facility.amenities.length > 0 && (
        <View style={styles.amenitiesRow}>
          {facility.amenities.slice(0, 4).map((amenity) => {
            const icon = AMENITY_ICONS[amenity];
            if (!icon) return null;
            return (
              <MaterialCommunityIcons
                key={amenity}
                name={icon}
                size={16}
                color={theme.palette.icon}
              />
            );
          })}
          {facility.evChargingSpaces > 0 && !facility.amenities.includes('ev_charging') && (
            <MaterialCommunityIcons
              name="ev-station"
              size={16}
              color={theme.palette.icon}
            />
          )}
          {facility.disabledSpaces > 0 && !facility.amenities.includes('disabled_access') && (
            <MaterialCommunityIcons
              name="wheelchair-accessibility"
              size={16}
              color={theme.palette.icon}
            />
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  availSection: {
    gap: 4,
  },
  availTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  availFill: {
    height: '100%',
    borderRadius: 3,
  },
  availText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
  },
  distance: {
    fontSize: 12,
  },
  amenitiesRow: {
    flexDirection: 'row',
    gap: 10,
  },
});

export default ParkingCard;
