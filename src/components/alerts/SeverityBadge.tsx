/**
 * SeverityBadge - Colored pill badge showing severity level
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../theme';

export type BadgeSeverity = 'critical' | 'warning' | 'info';

export interface SeverityBadgeProps {
  severity: BadgeSeverity;
}

const SEVERITY_ICONS: Record<BadgeSeverity, keyof typeof MaterialCommunityIcons.glyphMap> = {
  critical: 'alert-circle',
  warning: 'alert',
  info: 'information',
};

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const theme = useAppTheme();
  const { t } = useTranslation();

  const color = theme.severity[severity];
  const icon = SEVERITY_ICONS[severity];
  const label = t(`alerts.severity.${severity}` as const);

  return (
    <View
      style={[styles.badge, { backgroundColor: color + '20' }]}
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      <MaterialCommunityIcons name={icon} size={14} color={color} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default SeverityBadge;
