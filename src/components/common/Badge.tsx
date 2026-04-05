/**
 * ACUD ITS Traveler Mobile App - Severity/Status Badge Component
 */

import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useAppTheme } from '../../theme';

// ── Types ────────────────────────────────────────────────────────
export type BadgeVariant = 'critical' | 'warning' | 'info' | 'success';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: StyleProp<ViewStyle>;
}

// ── Size Maps ────────────────────────────────────────────────────
const SIZE_CONFIG = {
  sm: { paddingVertical: 2, paddingHorizontal: 8, fontSize: 10 },
  md: { paddingVertical: 4, paddingHorizontal: 12, fontSize: 12 },
  lg: { paddingVertical: 6, paddingHorizontal: 16, fontSize: 14 },
} as const;

// ── Component ────────────────────────────────────────────────────
export function Badge({
  label,
  variant = 'info',
  size = 'md',
  style,
}: BadgeProps) {
  const theme = useAppTheme();
  const sizeConfig = SIZE_CONFIG[size];
  const colors = getVariantColors(variant, theme);

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: colors.background,
          paddingVertical: sizeConfig.paddingVertical,
          paddingHorizontal: sizeConfig.paddingHorizontal,
        },
        style,
      ]}
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      <Text
        style={[
          styles.label,
          { color: colors.text, fontSize: sizeConfig.fontSize },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

// ── Helpers ──────────────────────────────────────────────────────
function getVariantColors(
  variant: BadgeVariant,
  theme: ReturnType<typeof useAppTheme>,
) {
  const alpha = theme.isDark ? '33' : '1A'; // 20% or 10% opacity
  switch (variant) {
    case 'critical':
      return { background: `${theme.semantic.error}${alpha}`, text: theme.semantic.error };
    case 'warning':
      return { background: `${theme.semantic.warning}${alpha}`, text: theme.isDark ? theme.semantic.warning : '#92400E' };
    case 'info':
      return { background: `${theme.semantic.info}${alpha}`, text: theme.semantic.info };
    case 'success':
      return { background: `${theme.semantic.success}${alpha}`, text: theme.isDark ? theme.semantic.success : '#166534' };
  }
}

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  pill: {
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Badge;
