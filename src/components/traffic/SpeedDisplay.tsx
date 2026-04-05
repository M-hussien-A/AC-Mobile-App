/**
 * SpeedDisplay - Circular speed display showing current speed and limit
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme';

export interface SpeedDisplayProps {
  currentSpeed: number;
  speedLimit: number;
}

export function SpeedDisplay({ currentSpeed, speedLimit }: SpeedDisplayProps) {
  const theme = useAppTheme();
  const { t } = useTranslation();

  const isOverLimit = currentSpeed > speedLimit;
  const circleColor = isOverLimit ? theme.semantic.error : theme.semantic.success;
  const speedLabel = isOverLimit
    ? t('traffic.speed.overLimit')
    : t('traffic.speed.underLimit');

  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel={`${t('traffic.speed.current')} ${currentSpeed} ${t('units.kmh')}, ${t('traffic.speed.limit')} ${speedLimit} ${t('units.kmh')}, ${speedLabel}`}
    >
      <View
        style={[
          styles.circle,
          {
            borderColor: circleColor,
            backgroundColor: theme.palette.surface,
          },
        ]}
      >
        <Text style={[styles.speedValue, { color: circleColor }]}>
          {Math.round(currentSpeed)}
        </Text>
        <Text style={[styles.speedUnit, { color: theme.palette.textSecondary }]}>
          {t('units.kmh')}
        </Text>
      </View>
      <View style={styles.limitContainer}>
        <Text style={[styles.limitLabel, { color: theme.palette.textSecondary }]}>
          {t('traffic.speed.limit')}
        </Text>
        <View
          style={[
            styles.limitBadge,
            {
              borderColor: theme.semantic.error,
              backgroundColor: theme.palette.surface,
            },
          ]}
        >
          <Text style={[styles.limitValue, { color: theme.palette.text }]}>
            {speedLimit}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  speedUnit: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: -2,
  },
  limitContainer: {
    alignItems: 'center',
    gap: 4,
  },
  limitLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  limitBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  limitValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SpeedDisplay;
