/**
 * ArrivalTimeCard - Card showing next arrival countdowns
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../theme';

export interface ArrivalTimeCardProps {
  stationName: string;
  nextArrivals: string[];
}

function getMinutesUntil(isoDate: string): number {
  return Math.max(0, Math.round((new Date(isoDate).getTime() - Date.now()) / 60000));
}

export function ArrivalTimeCard({ stationName, nextArrivals }: ArrivalTimeCardProps) {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const [, setTick] = useState(0);

  // Re-render every 30 seconds for countdown updates
  useEffect(() => {
    const interval = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.palette.card,
          borderColor: theme.palette.border,
        },
      ]}
      accessibilityRole="text"
      accessibilityLabel={`${t('transit.arrival.nextArrivals')} - ${stationName}`}
    >
      <View style={styles.header}>
        <MaterialCommunityIcons name="clock-outline" size={18} color={theme.brand.primary} />
        <Text style={[styles.stationName, { color: theme.palette.text }]} numberOfLines={1}>
          {stationName}
        </Text>
      </View>

      <Text style={[styles.sectionLabel, { color: theme.palette.textSecondary }]}>
        {t('transit.arrival.nextArrivals')}
      </Text>

      <View style={styles.arrivalsList}>
        {nextArrivals.length === 0 ? (
          <Text style={[styles.noArrivals, { color: theme.palette.textTertiary }]}>
            {t('common.noResults')}
          </Text>
        ) : (
          nextArrivals.slice(0, 4).map((arrival, index) => {
            const minutes = getMinutesUntil(arrival);
            const isImminent = minutes <= 1;

            return (
              <View
                key={`${arrival}-${index}`}
                style={[
                  styles.arrivalPill,
                  {
                    backgroundColor: isImminent
                      ? theme.semantic.success + '20'
                      : theme.palette.surfaceVariant,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.arrivalText,
                    {
                      color: isImminent ? theme.semantic.success : theme.palette.text,
                      fontWeight: isImminent ? '700' : '600',
                    },
                  ]}
                >
                  {minutes <= 0
                    ? t('transit.arrival.now')
                    : t('transit.arrival.inMinutes', { minutes })}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </View>
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
    gap: 8,
  },
  stationName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  arrivalsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  arrivalPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  arrivalText: {
    fontSize: 14,
  },
  noArrivals: {
    fontSize: 13,
  },
});

export default ArrivalTimeCard;
