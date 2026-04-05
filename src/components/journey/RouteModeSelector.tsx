/**
 * RouteModeSelector - Horizontal scrollable mode selection tabs
 */

import React from 'react';
import { Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../theme';
import type { TravelMode } from '../../types';

export interface RouteModeSelectorProps {
  selectedMode: TravelMode;
  onSelectMode: (mode: TravelMode) => void;
}

interface ModeConfig {
  key: TravelMode;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  labelKey: string;
}

const MODES: ModeConfig[] = [
  { key: 'driving', icon: 'car', labelKey: 'journey.mode.drive' },
  { key: 'transit', icon: 'bus', labelKey: 'journey.mode.transit' },
  { key: 'walking', icon: 'walk', labelKey: 'journey.mode.walk' },
  { key: 'cycling', icon: 'bike', labelKey: 'journey.mode.cycle' },
  { key: 'multimodal', icon: 'swap-horizontal', labelKey: 'journey.mode.multimodal' },
];

export function RouteModeSelector({ selectedMode, onSelectMode }: RouteModeSelectorProps) {
  const theme = useAppTheme();
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {MODES.map((mode) => {
        const isSelected = selectedMode === mode.key;

        return (
          <Pressable
            key={mode.key}
            onPress={() => onSelectMode(mode.key)}
            style={[
              styles.tab,
              {
                backgroundColor: isSelected
                  ? theme.brand.primary
                  : theme.palette.surfaceVariant,
                borderColor: isSelected
                  ? theme.brand.primary
                  : theme.palette.border,
              },
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={t(mode.labelKey)}
          >
            <MaterialCommunityIcons
              name={mode.icon}
              size={20}
              color={isSelected ? '#FFFFFF' : theme.palette.icon}
            />
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isSelected ? '#FFFFFF' : theme.palette.textSecondary,
                },
              ]}
            >
              {t(mode.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 72,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default RouteModeSelector;
