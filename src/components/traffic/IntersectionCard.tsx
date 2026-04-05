/**
 * IntersectionCard - Card showing intersection details
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../theme';
import type { Intersection } from '../../types';
import { LOSIndicator } from './LOSIndicator';
import { QueueLengthBar } from './QueueLengthBar';

export interface IntersectionCardProps {
  intersection: Intersection;
  onPress?: () => void;
}

export function IntersectionCard({ intersection, onPress }: IntersectionCardProps) {
  const theme = useAppTheme();
  const { t, i18n } = useTranslation();

  const isAr = i18n.language === 'ar';
  const name = isAr ? intersection.nameAr : intersection.name;

  const signalPhaseKey = `traffic.intersection.signal.${intersection.signalPhase}` as const;
  const signalPhaseLabel = t(signalPhaseKey);

  const signalColor = (() => {
    switch (intersection.signalPhase) {
      case 'green': return theme.semantic.success;
      case 'yellow': return theme.semantic.warning;
      case 'red': return theme.semantic.error;
      case 'flashing': return theme.semantic.warning;
    }
  })();

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
      <View style={styles.header}>
        <View style={styles.nameRow}>
          <LOSIndicator los={intersection.los} size={14} />
          <Text
            style={[styles.name, { color: theme.palette.text }]}
            numberOfLines={1}
          >
            {name}
          </Text>
        </View>
        <MaterialCommunityIcons
          name={I18nManager.isRTL ? 'chevron-left' : 'chevron-right'}
          size={20}
          color={theme.palette.icon}
        />
      </View>

      <View style={styles.body}>
        <QueueLengthBar queueLength={intersection.volume} maxLength={300} />

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="traffic-light"
              size={16}
              color={signalColor}
            />
            <Text style={[styles.infoText, { color: theme.palette.textSecondary }]}>
              {signalPhaseLabel}
              {intersection.countdown != null ? ` (${intersection.countdown}${t('units.sec')})` : ''}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="speedometer"
              size={16}
              color={theme.palette.icon}
            />
            <Text style={[styles.infoText, { color: theme.palette.textSecondary }]}>
              {Math.round(intersection.avgSpeed)} {t('units.kmh')}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 12,
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
  body: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 13,
  },
});

export default IntersectionCard;
