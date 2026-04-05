/**
 * ACUD ITS Traveler Mobile App - Theme barrel export & React context
 */

import React from 'react';
import {
  brand,
  los,
  severity,
  parking,
  semantic,
  lightPalette,
  darkPalette,
  getTheme,
  type ColorTheme,
} from './colors';
import { typography, fontSize, fontWeight, lineHeight, fontFamily } from './typography';
import { spacing, borderRadius, iconSize, hitSlop, type SpacingKey } from './spacing';

// ── Re-exports ────────────────────────────────────────────────
export {
  // Colors
  brand,
  los,
  severity,
  parking,
  semantic,
  lightPalette,
  darkPalette,
  getTheme,
  // Typography
  typography,
  fontSize,
  fontWeight,
  lineHeight,
  fontFamily,
  // Spacing
  spacing,
  borderRadius,
  iconSize,
  hitSlop,
};

export type { ColorTheme, SpacingKey };

// ── Unified Theme Object ──────────────────────────────────────
export interface AppTheme extends ColorTheme {
  typography: typeof typography;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  lineHeight: typeof lineHeight;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  iconSize: typeof iconSize;
}

export function createAppTheme(isDark: boolean): AppTheme {
  return {
    ...getTheme(isDark),
    typography,
    fontSize,
    fontWeight,
    lineHeight,
    spacing,
    borderRadius,
    iconSize,
  };
}

// ── React Context ─────────────────────────────────────────────
const defaultTheme = createAppTheme(false);

export const ThemeContext = React.createContext<AppTheme>(defaultTheme);

export function useAppTheme(): AppTheme {
  return React.useContext(ThemeContext);
}

export function ThemeProvider({ isDark, children }: { isDark: boolean; children: React.ReactNode }) {
  const theme = React.useMemo(() => createAppTheme(isDark), [isDark]);
  return React.createElement(ThemeContext.Provider, { value: theme }, children);
}

// ── Flat color helper used by screens ────────────────────────
export function useThemeColors() {
  const theme = useAppTheme();
  return {
    isDark: theme.isDark,
    // Brand
    primary: theme.brand.primary,
    primaryLight: theme.brand.primaryLight,
    primaryDark: theme.brand.primaryDark,
    accent: theme.brand.accent,
    accentLight: theme.brand.accentLight,
    accentDark: theme.brand.accentDark,
    // Palette
    background: theme.palette.background,
    surface: theme.palette.surface,
    surfaceVariant: theme.palette.surfaceVariant,
    card: theme.palette.card,
    text: theme.palette.text,
    textSecondary: theme.palette.textSecondary,
    textTertiary: theme.palette.textTertiary,
    textInverse: theme.palette.textInverse,
    border: theme.palette.border,
    borderLight: theme.palette.borderLight,
    divider: theme.palette.divider,
    overlay: theme.palette.overlay,
    disabled: theme.palette.disabled,
    disabledText: theme.palette.disabledText,
    placeholder: theme.palette.placeholder,
    icon: theme.palette.icon,
    iconActive: theme.palette.iconActive,
    shadow: theme.palette.shadow,
    // Semantic
    success: theme.semantic.success,
    warning: theme.semantic.warning,
    error: theme.semantic.error,
    info: theme.semantic.info,
    // Severity alias
    critical: theme.severity.critical,
  };
}
