/**
 * ACUD ITS Traveler Mobile App - Horizontal Scrollable Filter Chips
 */

import React, { useCallback } from 'react';
import {
  ScrollView,
  Pressable,
  Text,
  StyleSheet,
  I18nManager,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useAppTheme } from '../../theme';

// ── Types ────────────────────────────────────────────────────────
export interface FilterChipOption {
  label: string;
  value: string;
}

export interface FilterChipsProps {
  options: FilterChipOption[];
  /** Selected value(s). Pass string for single, string[] for multiple. */
  selectedValue: string | string[];
  onSelect: (value: string | string[]) => void;
  /** Allow multiple selections (default false) */
  multiple?: boolean;
  style?: StyleProp<ViewStyle>;
}

// ── Component ────────────────────────────────────────────────────
export function FilterChips({
  options,
  selectedValue,
  onSelect,
  multiple = false,
  style,
}: FilterChipsProps) {
  const theme = useAppTheme();

  const isSelected = useCallback(
    (value: string): boolean => {
      if (multiple && Array.isArray(selectedValue)) {
        return selectedValue.includes(value);
      }
      return selectedValue === value;
    },
    [selectedValue, multiple],
  );

  const handlePress = useCallback(
    (value: string) => {
      if (multiple) {
        const current = Array.isArray(selectedValue) ? selectedValue : [];
        if (current.includes(value)) {
          onSelect(current.filter((v) => v !== value));
        } else {
          onSelect([...current, value]);
        }
      } else {
        onSelect(value);
      }
    },
    [multiple, selectedValue, onSelect],
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContent, style]}
      style={[
        styles.scroll,
        { flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' },
      ]}
    >
      {options.map((option) => {
        const selected = isSelected(option.value);
        return (
          <Pressable
            key={option.value}
            onPress={() => handlePress(option.value)}
            style={[
              styles.chip,
              {
                backgroundColor: selected
                  ? theme.brand.primary
                  : theme.palette.surfaceVariant,
                borderColor: selected
                  ? theme.brand.primary
                  : theme.palette.border,
              },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
          >
            <Text
              style={[
                styles.chipLabel,
                {
                  color: selected
                    ? '#FFFFFF'
                    : theme.palette.text,
                },
              ]}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
    borderWidth: 1,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default FilterChips;
