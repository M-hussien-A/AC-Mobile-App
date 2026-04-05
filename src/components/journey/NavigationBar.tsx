/**
 * NavigationBar - Navigation instruction bar shown at top of screen
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../theme';

export interface NavigationBarProps {
  instruction: string;
  distance: string;
  duration: string;
  nextTurnIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
}

export function NavigationBar({
  instruction,
  distance,
  duration,
  nextTurnIcon = 'arrow-up-bold',
}: NavigationBarProps) {
  const theme = useAppTheme();
  const { t } = useTranslation();

  return (
    <View
      style={[styles.bar, { backgroundColor: theme.brand.primary }]}
      accessibilityRole="header"
      accessibilityLabel={instruction}
    >
      <View style={styles.iconColumn}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name={nextTurnIcon} size={32} color="#FFFFFF" />
        </View>
        <Text style={styles.distanceText}>
          {t('journey.nav.in', { distance })}
        </Text>
      </View>

      <View style={styles.textColumn}>
        <Text style={styles.instruction} numberOfLines={2}>
          {instruction}
        </Text>
        <Text style={styles.durationText}>
          {t('journey.nav.duration', { duration })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    gap: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  iconColumn: {
    alignItems: 'center',
    gap: 4,
    minWidth: 60,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  distanceText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    fontWeight: '600',
  },
  textColumn: {
    flex: 1,
    gap: 4,
  },
  instruction: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  durationText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 13,
    fontWeight: '500',
  },
});

export default NavigationBar;
