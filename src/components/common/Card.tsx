/**
 * ACUD ITS Traveler Mobile App - Elevated Card Component
 */

import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';
import { useAppTheme } from '../../theme';

// ── Types ────────────────────────────────────────────────────────
export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
}

// ── Component ────────────────────────────────────────────────────
export function Card({ children, style, onPress, accessibilityLabel }: CardProps) {
  const theme = useAppTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: theme.palette.card,
    borderColor: theme.palette.border,
    ...Platform.select({
      ios: {
        shadowColor: theme.palette.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme.isDark ? 0.3 : 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: theme.isDark ? 4 : 3,
      },
    }),
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          cardStyle,
          pressed && styles.pressed,
          style,
        ]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View
      style={[styles.card, cardStyle, style]}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pressed: {
    opacity: 0.85,
  },
});

export default Card;
