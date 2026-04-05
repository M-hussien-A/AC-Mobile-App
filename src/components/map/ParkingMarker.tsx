/**
 * ParkingMarker - Map marker for parking facilities
 *
 * Colour-coded by availability percentage.
 * Shows a "P" badge with available space count.
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme, parking as parkingColors } from '../../theme';
import type { ParkingFacility } from '../../types';

// ── Helpers ───────────────────────────────────────────────────

function getParkingColor(facility: ParkingFacility): string {
  const { availableSpaces, totalSpaces } = facility;
  if (totalSpaces <= 0 || availableSpaces <= 0) return parkingColors.unknown;

  const pct = availableSpaces / totalSpaces;
  if (pct > 0.5) return parkingColors.available;
  if (pct >= 0.2) return parkingColors.limited;
  return parkingColors.full;
}

// ── Props ─────────────────────────────────────────────────────

export interface ParkingMarkerProps {
  facility: ParkingFacility;
  onPress?: (facility: ParkingFacility) => void;
}

// ── Component ─────────────────────────────────────────────────

const ParkingMarker: React.FC<ParkingMarkerProps> = ({ facility, onPress }) => {
  const { t, i18n } = useTranslation();
  const theme = useAppTheme();
  const isAr = i18n.language === 'ar';
  const color = getParkingColor(facility);
  const displayName = isAr ? facility.nameAr : facility.name;
  const pct =
    facility.totalSpaces > 0
      ? Math.round((facility.availableSpaces / facility.totalSpaces) * 100)
      : 0;

  return (
    <Marker
      coordinate={{
        latitude: facility.location.latitude,
        longitude: facility.location.longitude,
      }}
      tracksViewChanges={false}
      onPress={() => onPress?.(facility)}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      {/* "P" badge */}
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.badgeLetter}>P</Text>
        <View style={styles.countBubble}>
          <Text style={styles.countText}>{facility.availableSpaces}</Text>
        </View>
      </View>

      {/* Callout */}
      <Callout tooltip style={styles.calloutContainer}>
        <View style={[styles.callout, { backgroundColor: theme.palette.card }]}>
          {/* Header */}
          <View style={styles.calloutHeader}>
            <MaterialCommunityIcons name="parking" size={18} color={color} />
            <Text
              style={[styles.calloutTitle, { color: theme.palette.text }]}
              numberOfLines={2}
            >
              {displayName}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.palette.divider }]} />

          {/* Availability bar */}
          <View style={styles.barContainer}>
            <View style={[styles.barBg, { backgroundColor: theme.palette.surfaceVariant }]}>
              <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
            </View>
            <Text style={[styles.pctText, { color: theme.palette.textSecondary }]}>
              {pct}%
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: theme.palette.text }]}>
                {facility.availableSpaces}
              </Text>
              <Text style={[styles.statLabel, { color: theme.palette.textTertiary }]}>
                {t('parking.available', 'Available')}
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: theme.palette.text }]}>
                {facility.totalSpaces}
              </Text>
              <Text style={[styles.statLabel, { color: theme.palette.textTertiary }]}>
                {t('parking.total', 'Total')}
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: theme.palette.text }]}>
                {facility.ratePerHour} {facility.currency}
              </Text>
              <Text style={[styles.statLabel, { color: theme.palette.textTertiary }]}>
                {t('parking.perHour', '/hr')}
              </Text>
            </View>
          </View>

          {/* Arrow */}
          <View style={[styles.calloutArrow, { borderTopColor: theme.palette.card }]} />
        </View>
      </Callout>
    </Marker>
  );
};

// ── Styles ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  badge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      },
      android: { elevation: 4 },
    }),
  },
  badgeLetter: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  countBubble: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    minWidth: 18,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  calloutContainer: {
    width: 240,
  },
  callout: {
    borderRadius: 12,
    padding: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: { elevation: 5 },
    }),
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginLeft: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  barBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  pctText: {
    fontSize: 12,
    fontWeight: '600',
    width: 36,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  calloutArrow: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});

export default React.memo(ParkingMarker);
