/**
 * ACUD ITS Traveler Mobile App - Reusable Button Component
 */

import React, { useCallback, useRef } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  I18nManager,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../theme';

// ── Types ────────────────────────────────────────────────────────
export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  size?: ButtonSize;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

// ── Size Maps ────────────────────────────────────────────────────
const SIZE_CONFIG = {
  sm: { paddingVertical: 6, paddingHorizontal: 12, fontSize: 13, iconSize: 16 },
  md: { paddingVertical: 10, paddingHorizontal: 20, fontSize: 16, iconSize: 20 },
  lg: { paddingVertical: 14, paddingHorizontal: 28, fontSize: 18, iconSize: 24 },
} as const;

// ── Component ────────────────────────────────────────────────────
export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  size = 'md',
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
}: ButtonProps) {
  const theme = useAppTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const sizeConfig = SIZE_CONFIG[size];

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  // Resolve variant colors
  const variantColors = getVariantColors(variant, theme);
  const isOutlined = variant === 'secondary';

  const containerStyle: ViewStyle = {
    backgroundColor: isOutlined ? 'transparent' : variantColors.background,
    borderColor: variantColors.border,
    borderWidth: isOutlined ? 1.5 : 0,
    paddingVertical: sizeConfig.paddingVertical,
    paddingHorizontal: sizeConfig.paddingHorizontal,
    opacity: disabled ? 0.5 : 1,
  };

  const labelColor = isOutlined ? variantColors.border : variantColors.text;

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        fullWidth && styles.fullWidth,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[styles.base, containerStyle, style]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
      >
        {loading ? (
          <ActivityIndicator size="small" color={labelColor} />
        ) : (
          <>
            {icon && (
              <MaterialCommunityIcons
                name={icon}
                size={sizeConfig.iconSize}
                color={labelColor}
                style={[
                  styles.icon,
                  { [I18nManager.isRTL ? 'marginLeft' : 'marginRight']: 8 },
                ]}
              />
            )}
            <Text
              style={[
                styles.label,
                { fontSize: sizeConfig.fontSize, color: labelColor },
                textStyle,
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

// ── Helpers ──────────────────────────────────────────────────────
function getVariantColors(
  variant: ButtonVariant,
  theme: ReturnType<typeof useAppTheme>,
) {
  switch (variant) {
    case 'primary':
      return {
        background: theme.brand.primary,
        border: theme.brand.primary,
        text: '#FFFFFF',
      };
    case 'secondary':
      return {
        background: 'transparent',
        border: theme.brand.primary,
        text: theme.brand.primary,
      };
    case 'accent':
      return {
        background: theme.brand.accent,
        border: theme.brand.accent,
        text: '#FFFFFF',
      };
    case 'danger':
      return {
        background: theme.semantic.error,
        border: theme.semantic.error,
        text: '#FFFFFF',
      };
  }
}

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    minHeight: 44,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontWeight: '600',
    textAlign: 'center',
  },
  icon: {
    // directional margin applied inline
  },
});

export default Button;
