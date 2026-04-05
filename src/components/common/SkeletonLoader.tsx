/**
 * ACUD ITS Traveler Mobile App - Skeleton Loading Placeholder
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useAppTheme } from '../../theme';

// ── Types ────────────────────────────────────────────────────────
export interface SkeletonLoaderProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

// ── Shimmer Hook ─────────────────────────────────────────────────
function useShimmer() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return opacity;
}

// ── SkeletonLoader ───────────────────────────────────────────────
export function SkeletonLoader({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}: SkeletonLoaderProps) {
  const theme = useAppTheme();
  const opacity = useShimmer();

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.isDark
            ? theme.palette.surfaceVariant
            : theme.palette.borderLight,
          opacity,
        },
        style,
      ]}
      accessibilityRole="none"
      accessibilityLabel="Loading"
    />
  );
}

// ── SkeletonCard ─────────────────────────────────────────────────
export interface SkeletonCardProps {
  style?: StyleProp<ViewStyle>;
}

export function SkeletonCard({ style }: SkeletonCardProps) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.palette.card,
          borderColor: theme.palette.border,
        },
        style,
      ]}
    >
      <SkeletonLoader width="40%" height={12} style={styles.cardLine} />
      <SkeletonLoader width="100%" height={16} style={styles.cardLine} />
      <SkeletonLoader width="70%" height={12} style={styles.cardLine} />
      <View style={styles.cardRow}>
        <SkeletonLoader width={80} height={32} borderRadius={12} />
        <SkeletonLoader width={80} height={32} borderRadius={12} />
      </View>
    </View>
  );
}

// ── SkeletonList ─────────────────────────────────────────────────
export interface SkeletonListProps {
  count?: number;
  style?: StyleProp<ViewStyle>;
}

export function SkeletonList({ count = 5, style }: SkeletonListProps) {
  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.listItem}>
          <SkeletonLoader width={40} height={40} borderRadius={20} />
          <View style={styles.listContent}>
            <SkeletonLoader width="60%" height={14} />
            <SkeletonLoader
              width="90%"
              height={12}
              style={styles.listSubline}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
  },
  cardLine: {
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  listContent: {
    flex: 1,
    marginLeft: 12,
  },
  listSubline: {
    marginTop: 6,
  },
});

export default SkeletonLoader;
