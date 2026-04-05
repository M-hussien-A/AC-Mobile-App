/**
 * IntersectionMarker - Custom map marker for signalised intersections
 *
 * Displays a colored dot based on Level-of-Service (LOS) grade.
 * Callout shows name, LOS, queue length and cycle time.
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Marker, Callout } from '../../utils/MapView';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme';
import { los as losColors } from '../../theme';
import type { Intersection, LOSGrade } from '../../types';

// ── Helpers ───────────────────────────────────────────────────

function getLOSColor(grade: LOSGrade): string {
  switch (grade) {
    case 'A':
    case 'B':
      return losColors.green;
    case 'C':
      return losColors.yellow;
    case 'D':
    case 'E':
      return losColors.red;
    case 'F':
      return losColors.black;
    default:
      return losColors.green;
  }
}

function getLOSLabel(grade: LOSGrade): string {
  const labels: Record<LOSGrade, string> = {
    A: 'Free Flow',
    B: 'Stable Flow',
    C: 'Stable (Near Capacity)',
    D: 'Unstable Flow',
    E: 'At Capacity',
    F: 'Breakdown',
  };
  return labels[grade] ?? grade;
}

// ── Props ─────────────────────────────────────────────────────

export interface IntersectionMarkerProps {
  intersection: Intersection;
  onPress?: (intersection: Intersection) => void;
}

// ── Component ─────────────────────────────────────────────────

const IntersectionMarker: React.FC<IntersectionMarkerProps> = ({ intersection, onPress }) => {
  const { t, i18n } = useTranslation();
  const theme = useAppTheme();
  const isAr = i18n.language === 'ar';
  const color = getLOSColor(intersection.los);
  const displayName = isAr ? intersection.nameAr : intersection.name;

  return (
    <Marker
      coordinate={{
        latitude: intersection.location.latitude,
        longitude: intersection.location.longitude,
      }}
      tracksViewChanges={false}
      onPress={() => onPress?.(intersection)}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      {/* Custom dot */}
      <View style={[styles.dot, { backgroundColor: color }]}>
        <View style={styles.dotInner} />
      </View>

      {/* Callout */}
      <Callout tooltip style={styles.calloutContainer}>
        <View style={[styles.callout, { backgroundColor: theme.palette.card }]}>
          <Text
            style={[styles.calloutTitle, { color: theme.palette.text }]}
            numberOfLines={2}
          >
            {displayName}
          </Text>

          <View style={styles.calloutRow}>
            <View style={[styles.losChip, { backgroundColor: color }]}>
              <Text style={styles.losChipText}>
                LOS {intersection.los}
              </Text>
            </View>
            <Text style={[styles.losDesc, { color: theme.palette.textSecondary }]}>
              {getLOSLabel(intersection.los)}
            </Text>
          </View>

          <View style={[styles.calloutDivider, { backgroundColor: theme.palette.divider }]} />

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statLabel, { color: theme.palette.textTertiary }]}>
                {t('intersection.queueLength', 'Queue')}
              </Text>
              <Text style={[styles.statValue, { color: theme.palette.text }]}>
                {intersection.volume != null ? `${intersection.volume}` : '--'} {t('units.vehicles', 'veh')}
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statLabel, { color: theme.palette.textTertiary }]}>
                {t('intersection.cycleTime', 'Cycle')}
              </Text>
              <Text style={[styles.statValue, { color: theme.palette.text }]}>
                {intersection.countdown != null ? `${intersection.countdown}s` : '--'}
              </Text>
            </View>
          </View>

          {/* Callout arrow */}
          <View style={[styles.calloutArrow, { borderTopColor: theme.palette.card }]} />
        </View>
      </Callout>
    </Marker>
  );
};

// ── Styles ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
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
      android: { elevation: 3 },
    }),
  },
  dotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  calloutContainer: {
    width: 220,
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
  calloutTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  calloutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  losChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  losChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  losDesc: {
    fontSize: 12,
    flex: 1,
  },
  calloutDivider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
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

export default React.memo(IntersectionMarker);
