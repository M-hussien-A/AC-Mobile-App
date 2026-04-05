/**
 * TransitAlertBanner - Alert banner for transit disruptions
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../theme';

export type TransitAlertSeverity = 'critical' | 'warning' | 'info';

export interface TransitAlertBannerProps {
  message: string;
  severity: TransitAlertSeverity;
}

const SEVERITY_ICONS: Record<TransitAlertSeverity, keyof typeof MaterialCommunityIcons.glyphMap> = {
  critical: 'alert-circle',
  warning: 'alert',
  info: 'information',
};

export function TransitAlertBanner({ message, severity }: TransitAlertBannerProps) {
  const theme = useAppTheme();
  const { t } = useTranslation();

  const severityColor = theme.severity[severity];
  const icon = SEVERITY_ICONS[severity];
  const severityLabel = t(`transit.alert.severity.${severity}` as const);

  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: severityColor + '18', borderColor: severityColor },
      ]}
      accessibilityRole="alert"
      accessibilityLabel={`${severityLabel}: ${message}`}
    >
      <MaterialCommunityIcons name={icon} size={20} color={severityColor} />
      <View style={styles.textContainer}>
        <Text style={[styles.severityLabel, { color: severityColor }]}>
          {severityLabel}
        </Text>
        <Text
          style={[styles.message, { color: theme.palette.text }]}
          numberOfLines={3}
        >
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  severityLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default TransitAlertBanner;
