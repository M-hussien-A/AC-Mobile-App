/**
 * SOSButton - Large press-and-hold emergency button with progress ring
 */

import React, { useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Circle } from 'react-native-svg';
import { useAppTheme } from '../../theme';

export interface SOSButtonProps {
  onActivate: () => void;
  disabled?: boolean;
}

const HOLD_DURATION_MS = 3000;
const BUTTON_SIZE = 120;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function SOSButton({ onActivate, disabled = false }: SOSButtonProps) {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isHolding, setIsHolding] = useState(false);
  const [activated, setActivated] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const strokeWidth = 6;
  const radius = (BUTTON_SIZE - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const triggerHaptic = useCallback(() => {
    try {
      if (Platform.OS !== 'web') {
        // Haptic feedback via Expo
        const Haptics = require('expo-haptics');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    } catch {
      // Haptics not available - fail silently
    }
  }, []);

  const handlePressIn = useCallback(() => {
    if (disabled || activated) return;
    setIsHolding(true);
    triggerHaptic();

    // Scale pulse
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
    }).start();

    // Progress animation
    progressAnim.setValue(0);
    animationRef.current = Animated.timing(progressAnim, {
      toValue: 1,
      duration: HOLD_DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    animationRef.current.start(({ finished }) => {
      if (finished && !disabled) {
        setActivated(true);
        triggerHaptic();
        onActivate();
      }
    });
  }, [disabled, activated, progressAnim, scaleAnim, onActivate, triggerHaptic]);

  const handlePressOut = useCallback(() => {
    setIsHolding(false);
    animationRef.current?.stop();

    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }

    // Reset animations
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();

    if (!activated) {
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [activated, progressAnim, scaleAnim]);

  const buttonColor = disabled
    ? theme.palette.disabled
    : activated
      ? theme.semantic.success
      : theme.semantic.error;

  const statusText = activated
    ? t('alerts.sos.activated')
    : isHolding
      ? t('alerts.sos.activating')
      : t('alerts.sos.holdToActivate');

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.buttonWrapper, { transform: [{ scale: scaleAnim }] }]}
        onTouchStart={handlePressIn}
        onTouchEnd={handlePressOut}
        onTouchCancel={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={t('alerts.sos.label')}
        accessibilityHint={t('alerts.sos.holdToActivate')}
        accessibilityState={{ disabled }}
      >
        {/* Progress ring */}
        <Svg
          width={BUTTON_SIZE}
          height={BUTTON_SIZE}
          style={styles.progressRing}
        >
          <Circle
            cx={BUTTON_SIZE / 2}
            cy={BUTTON_SIZE / 2}
            r={radius}
            fill="none"
            stroke={buttonColor + '30'}
            strokeWidth={strokeWidth}
          />
          <AnimatedCircle
            cx={BUTTON_SIZE / 2}
            cy={BUTTON_SIZE / 2}
            r={radius}
            fill="none"
            stroke={buttonColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90, ${BUTTON_SIZE / 2}, ${BUTTON_SIZE / 2})`}
          />
        </Svg>

        {/* Button face */}
        <View
          style={[
            styles.buttonFace,
            { backgroundColor: buttonColor },
          ]}
        >
          <Text style={styles.sosText}>{t('alerts.sos.label')}</Text>
        </View>
      </Animated.View>

      <Text style={[styles.statusText, { color: theme.palette.textSecondary }]}>
        {statusText}
      </Text>
    </View>
  );
}

const INNER_SIZE = BUTTON_SIZE - 20;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  buttonWrapper: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    position: 'absolute',
  },
  buttonFace: {
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: INNER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default SOSButton;
