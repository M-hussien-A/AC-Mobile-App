/**
 * ACUD ITS Traveler Mobile App - Empty State Placeholder
 */

import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../theme';
import { Button } from './Button';

// ── Types ────────────────────────────────────────────────────────
export interface EmptyStateProps {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

// ── Component ────────────────────────────────────────────────────
export function EmptyState({
  icon = 'information-outline',
  title,
  message,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, style]} accessibilityRole="text">
      <MaterialCommunityIcons
        name={icon}
        size={64}
        color={theme.palette.disabled}
        style={styles.icon}
      />

      <Text style={[styles.title, { color: theme.palette.text }]}>
        {title}
      </Text>

      {message ? (
        <Text style={[styles.message, { color: theme.palette.textSecondary }]}>
          {message}
        </Text>
      ) : null}

      {actionLabel && onAction ? (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          size="md"
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  action: {
    marginTop: 8,
  },
});

export default EmptyState;
