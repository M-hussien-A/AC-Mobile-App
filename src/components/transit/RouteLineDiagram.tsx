/**
 * RouteLineDiagram - Vertical line diagram showing transit stations
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme';
import type { TransitStation } from '../../types';

export interface RouteLineDiagramProps {
  stations: TransitStation[];
  lineColor: string;
  onStationPress?: (station: TransitStation) => void;
}

function getMinutesUntil(isoDate: string): number {
  return Math.max(0, Math.round((new Date(isoDate).getTime() - Date.now()) / 60000));
}

export function RouteLineDiagram({ stations, lineColor, onStationPress }: RouteLineDiagramProps) {
  const theme = useAppTheme();
  const { t, i18n } = useTranslation();

  const isAr = i18n.language === 'ar';

  return (
    <View style={styles.container}>
      {stations.map((station, index) => {
        const isFirst = index === 0;
        const isLast = index === stations.length - 1;
        const name = isAr ? station.nameAr : station.name;
        const nextArrival = station.nextArrivals[0];
        const minutesUntil = nextArrival ? getMinutesUntil(nextArrival.estimatedArrival) : null;

        return (
          <Pressable
            key={station.id}
            style={styles.stationRow}
            onPress={() => onStationPress?.(station)}
            accessibilityRole="button"
            accessibilityLabel={`${t('transit.line.station')}: ${name}`}
          >
            {/* Line and dot */}
            <View style={styles.lineColumn}>
              {!isFirst && (
                <View style={[styles.lineSegment, { backgroundColor: lineColor }]} />
              )}
              <View
                style={[
                  styles.stationDot,
                  {
                    borderColor: lineColor,
                    backgroundColor: theme.palette.card,
                  },
                ]}
              />
              {!isLast && (
                <View style={[styles.lineSegment, { backgroundColor: lineColor }]} />
              )}
            </View>

            {/* Station info */}
            <View style={styles.stationInfo}>
              <Text
                style={[styles.stationName, { color: theme.palette.text }]}
                numberOfLines={1}
              >
                {name}
              </Text>
              {minutesUntil != null && (
                <Text style={[styles.arrivalText, { color: theme.palette.textSecondary }]}>
                  {minutesUntil <= 0
                    ? t('transit.arrival.now')
                    : t('transit.arrival.inMinutes', { minutes: minutesUntil })}
                </Text>
              )}
              {station.isAccessible && (
                <Text style={[styles.accessibleBadge, { color: theme.palette.textTertiary }]}>
                  ♿
                </Text>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  stationRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 56,
  },
  lineColumn: {
    width: 32,
    alignItems: 'center',
  },
  lineSegment: {
    flex: 1,
    width: 3,
  },
  stationDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
  },
  stationInfo: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  stationName: {
    fontSize: 15,
    fontWeight: '600',
  },
  arrivalText: {
    fontSize: 12,
    marginTop: 2,
  },
  accessibleBadge: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default RouteLineDiagram;
