/**
 * ACUD ITS Traveler Mobile App - Brand Colors & Theme Palettes
 */

// ── Brand Colors ──────────────────────────────────────────────
export const brand = {
  primary: '#1F4E79',
  primaryLight: '#2D6FA3',
  primaryDark: '#163A5C',
  accent: '#D4A84B',
  accentLight: '#E0BF76',
  accentDark: '#B8913A',
} as const;

// ── Level-of-Service (LOS) Colors ─────────────────────────────
export const los = {
  green: '#22C55E',
  yellow: '#EAB308',
  red: '#EF4444',
  black: '#1F2937',
} as const;

// ── Severity Colors ───────────────────────────────────────────
export const severity = {
  critical: '#DC2626',
  warning: '#F59E0B',
  info: '#3B82F6',
} as const;

// ── Parking Availability Colors ───────────────────────────────
export const parking = {
  available: '#22C55E',
  limited: '#EAB308',
  full: '#EF4444',
  unknown: '#9CA3AF',
} as const;

// ── Common Semantic Colors ────────────────────────────────────
export const semantic = {
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
} as const;

// ── Light Theme Palette ───────────────────────────────────────
export const lightPalette = {
  background: '#FFFFFF',
  surface: '#F8FAFC',
  surfaceVariant: '#F1F5F9',
  card: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  divider: '#E2E8F0',
  overlay: 'rgba(15, 23, 42, 0.5)',
  disabled: '#CBD5E1',
  disabledText: '#94A3B8',
  placeholder: '#94A3B8',
  icon: '#64748B',
  iconActive: '#1F4E79',
  statusBar: 'dark-content' as const,
  shadow: '#000000',
} as const;

// ── Dark Theme Palette ────────────────────────────────────────
export const darkPalette = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceVariant: '#334155',
  card: '#1E293B',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textTertiary: '#64748B',
  textInverse: '#0F172A',
  border: '#334155',
  borderLight: '#1E293B',
  divider: '#334155',
  overlay: 'rgba(0, 0, 0, 0.7)',
  disabled: '#475569',
  disabledText: '#64748B',
  placeholder: '#64748B',
  icon: '#94A3B8',
  iconActive: '#60A5FA',
  statusBar: 'light-content' as const,
  shadow: '#000000',
} as const;

// ── Theme Type ────────────────────────────────────────────────
export interface ColorTheme {
  isDark: boolean;
  brand: typeof brand;
  los: typeof los;
  severity: typeof severity;
  parking: typeof parking;
  semantic: typeof semantic;
  palette: typeof lightPalette;
}

// ── Theme Factory ─────────────────────────────────────────────
export function getTheme(isDark: boolean): ColorTheme {
  return {
    isDark,
    brand,
    los,
    severity,
    parking,
    semantic,
    palette: isDark ? darkPalette : lightPalette,
  };
}
