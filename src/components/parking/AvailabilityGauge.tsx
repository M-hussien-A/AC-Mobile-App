/**
 * AvailabilityGauge - Semi-circular gauge showing parking availability
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';
import { useAppTheme } from '../../theme';

export interface AvailabilityGaugeProps {
  available: number;
  total: number;
  size?: number;
}

function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const x1 = cx + radius * Math.cos(startRad);
  const y1 = cy + radius * Math.sin(startRad);
  const x2 = cx + radius * Math.cos(endRad);
  const y2 = cy + radius * Math.sin(endRad);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
}

function getGaugeColor(ratio: number, theme: ReturnType<typeof useAppTheme>): string {
  if (ratio >= 0.5) return theme.parking.available;
  if (ratio >= 0.2) return theme.parking.limited;
  return theme.parking.full;
}

export function AvailabilityGauge({ available, total, size = 120 }: AvailabilityGaugeProps) {
  const theme = useAppTheme();
  const { t } = useTranslation();

  const ratio = total > 0 ? Math.min(available / total, 1) : 0;
  const color = getGaugeColor(ratio, theme);

  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // Arc from 180 (left) to 0 (right) = semicircle
  const startAngle = 180;
  const endAngle = 0;
  const fillEndAngle = 180 - ratio * 180;

  const trackPath = describeArc(cx, cy, radius, startAngle, endAngle);
  const fillPath =
    ratio > 0 ? describeArc(cx, cy, radius, startAngle, fillEndAngle) : '';

  return (
    <View
      style={[styles.container, { width: size, height: size * 0.6 }]}
      accessibilityRole="text"
      accessibilityLabel={`${t('parking.gauge.label')}: ${t('parking.gauge.available', { available, total })}`}
    >
      <Svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
        <Path
          d={trackPath}
          fill="none"
          stroke={theme.palette.borderLight}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {ratio > 0 && (
          <Path
            d={fillPath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )}
      </Svg>
      <View style={styles.centerText}>
        <Text style={[styles.valueText, { color: theme.palette.text }]}>
          {t('parking.gauge.available', { available, total })}
        </Text>
        <Text style={[styles.labelText, { color: theme.palette.textSecondary }]}>
          {t('parking.gauge.label')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  centerText: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  valueText: {
    fontSize: 18,
    fontWeight: '700',
  },
  labelText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
});

export default AvailabilityGauge;
