/**
 * TrafficLegend - Compact, persistent mini-legend for traffic map colours
 *
 * Displays at the bottom of the map as a horizontal bar.
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme, los } from '../../theme';

// ── Legend items ───────────────────────────────────────────────

interface LegendItem {
  color: string;
  labelKey: string;
  fallback: string;
}

const LEGEND_ITEMS: LegendItem[] = [
  { color: los.green, labelKey: 'legend.freeFlow', fallback: 'Free Flow' },
  { color: los.yellow, labelKey: 'legend.slow', fallback: 'Slow' },
  { color: los.red, labelKey: 'legend.congested', fallback: 'Congested' },
  { color: los.black, labelKey: 'legend.blocked', fallback: 'Blocked' },
];

// ── Component ─────────────────────────────────────────────────

const TrafficLegend: React.FC = () => {
  const { t } = useTranslation();
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.isDark
            ? 'rgba(30, 41, 59, 0.92)'
            : 'rgba(255, 255, 255, 0.92)',
          borderColor: theme.palette.border,
        },
      ]}
    >
      {LEGEND_ITEMS.map((item, index) => {
        const label = t(item.labelKey, item.fallback);
        return (
          <View key={item.labelKey} style={styles.item}>
            {index > 0 && (
              <View style={[styles.separator, { backgroundColor: theme.palette.border }]} />
            )}
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text
              style={[styles.label, { color: theme.palette.textSecondary }]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: { elevation: 3 },
    }),
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    width: 1,
    height: 14,
    marginHorizontal: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default React.memo(TrafficLegend);
