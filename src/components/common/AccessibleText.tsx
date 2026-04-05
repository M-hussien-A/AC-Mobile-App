/**
 * ACUD ITS Traveler Mobile App - Accessible Text Component
 */

import React from 'react';
import { Text, StyleSheet, TextStyle, StyleProp, AccessibilityRole } from 'react-native';
import { useAppTheme, typography } from '../../theme';

// ── Types ────────────────────────────────────────────────────────
export type TextVariant = 'heading' | 'body' | 'caption';

export interface AccessibleTextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  accessibilityRole?: AccessibilityRole;
  variant?: TextVariant;
  numberOfLines?: number;
  /** Override the auto-generated accessibility label */
  accessibilityLabel?: string;
}

// ── Variant Config ───────────────────────────────────────────────
const VARIANT_STYLES: Record<TextVariant, TextStyle> = {
  heading: typography.h4,
  body: typography.body,
  caption: typography.caption,
};

const VARIANT_ROLES: Record<TextVariant, AccessibilityRole> = {
  heading: 'header',
  body: 'text',
  caption: 'text',
};

// ── Component ────────────────────────────────────────────────────
export function AccessibleText({
  children,
  style,
  accessibilityRole,
  variant = 'body',
  numberOfLines,
  accessibilityLabel,
}: AccessibleTextProps) {
  const theme = useAppTheme();

  const resolvedRole = accessibilityRole ?? VARIANT_ROLES[variant];
  const variantStyle = VARIANT_STYLES[variant];

  // Derive color based on variant
  const color =
    variant === 'caption'
      ? theme.palette.textSecondary
      : theme.palette.text;

  // Auto-generate accessible label from string children
  const label =
    accessibilityLabel ??
    (typeof children === 'string' ? children : undefined);

  return (
    <Text
      style={[variantStyle, { color }, style]}
      accessibilityRole={resolvedRole}
      accessibilityLabel={label}
      numberOfLines={numberOfLines}
      accessible
    >
      {children}
    </Text>
  );
}

export default AccessibleText;
