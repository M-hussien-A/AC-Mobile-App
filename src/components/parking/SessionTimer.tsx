/**
 * SessionTimer - Circular countdown timer for parking sessions
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Circle } from 'react-native-svg';
import { useAppTheme } from '../../theme';

export interface SessionTimerProps {
  startTime: string;
  endTime: string | null;
  onTimeUp?: () => void;
  size?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function SessionTimer({ startTime, endTime, onTimeUp, size = 160 }: SessionTimerProps) {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const [now, setNow] = useState(Date.now());
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timeUpCalled = useRef(false);

  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : null;
  const totalDuration = end ? end - start : 0;
  const hasEnd = end != null && totalDuration > 0;

  // Tick every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Animate progress
  useEffect(() => {
    if (!hasEnd) return;
    const elapsed = now - start;
    const ratio = Math.min(elapsed / totalDuration, 1);
    Animated.timing(progressAnim, {
      toValue: ratio,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [now, hasEnd, start, totalDuration, progressAnim]);

  // Fire onTimeUp
  const handleTimeUp = useCallback(() => {
    if (onTimeUp && !timeUpCalled.current) {
      timeUpCalled.current = true;
      onTimeUp();
    }
  }, [onTimeUp]);

  useEffect(() => {
    if (hasEnd && now >= end!) {
      handleTimeUp();
    }
  }, [now, hasEnd, end, handleTimeUp]);

  const elapsed = now - start;
  const remaining = hasEnd ? Math.max(end! - now, 0) : 0;
  const isTimeUp = hasEnd && remaining <= 0;

  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset = hasEnd
    ? progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [circumference, 0],
      })
    : circumference;

  const circleColor = isTimeUp
    ? theme.semantic.error
    : remaining < 300000 // last 5 minutes
      ? theme.semantic.warning
      : theme.brand.primary;

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      accessibilityRole="timer"
      accessibilityLabel={
        hasEnd
          ? `${t('parking.session.remaining')}: ${formatDuration(remaining)}`
          : `${t('parking.session.elapsed')}: ${formatDuration(elapsed)}`
      }
    >
      <Svg width={size} height={size}>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={theme.palette.borderLight}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={circleColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>

      <View style={styles.centerContent}>
        {isTimeUp ? (
          <Text style={[styles.timeUpText, { color: theme.semantic.error }]}>
            {t('parking.session.timeUp')}
          </Text>
        ) : hasEnd ? (
          <>
            <Text style={[styles.timerLabel, { color: theme.palette.textSecondary }]}>
              {t('parking.session.remaining')}
            </Text>
            <Text style={[styles.timerValue, { color: theme.palette.text }]}>
              {formatDuration(remaining)}
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.timerLabel, { color: theme.palette.textSecondary }]}>
              {t('parking.session.elapsed')}
            </Text>
            <Text style={[styles.timerValue, { color: theme.palette.text }]}>
              {formatDuration(elapsed)}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  timerValue: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  timeUpText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SessionTimer;
