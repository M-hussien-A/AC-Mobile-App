/**
 * ACUD ITS Traveler Mobile App - Simple Bottom Sheet (Animated API)
 */

import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Animated,
  PanResponder,
  useWindowDimensions,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useAppTheme } from '../../theme';

// ── Types ────────────────────────────────────────────────────────
export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: number[];
}

const DISMISS_THRESHOLD = 100;

// ── Component ────────────────────────────────────────────────────
export function BottomSheet({
  visible,
  onClose,
  children,
  snapPoints,
}: BottomSheetProps) {
  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const defaultSnaps = [SCREEN_HEIGHT * 0.4, SCREEN_HEIGHT * 0.7];
  const resolvedSnapPoints = snapPoints ?? defaultSnaps;

  const theme = useAppTheme();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const currentSnap = useRef(0);
  const panOffset = useRef(0);

  const sortedSnaps = [...resolvedSnapPoints].sort((a, b) => a - b);
  const initialHeight = sortedSnaps[0];

  // Animate open/close
  useEffect(() => {
    if (visible) {
      currentSnap.current = 0;
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: SCREEN_HEIGHT - initialHeight,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, initialHeight, translateY, backdropOpacity]);

  const snapTo = useCallback(
    (height: number) => {
      Animated.spring(translateY, {
        toValue: SCREEN_HEIGHT - height,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start();
    },
    [translateY],
  );

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  }, [translateY, backdropOpacity, onClose]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dy) > 5,
      onPanResponderGrant: () => {
        const snap = sortedSnaps[currentSnap.current] ?? initialHeight;
        panOffset.current = SCREEN_HEIGHT - snap;
      },
      onPanResponderMove: (_, gesture) => {
        const nextY = panOffset.current + gesture.dy;
        // Prevent dragging above the highest snap
        const minY = SCREEN_HEIGHT - sortedSnaps[sortedSnaps.length - 1];
        translateY.setValue(Math.max(nextY, minY));
      },
      onPanResponderRelease: (_, gesture) => {
        // Dismiss if swiped down fast or far enough
        if (gesture.dy > DISMISS_THRESHOLD || gesture.vy > 1) {
          dismiss();
          return;
        }

        // Find closest snap
        const currentY = panOffset.current + gesture.dy;
        const currentHeight = SCREEN_HEIGHT - currentY;

        let closestIdx = 0;
        let closestDist = Math.abs(currentHeight - sortedSnaps[0]);
        for (let i = 1; i < sortedSnaps.length; i++) {
          const dist = Math.abs(currentHeight - sortedSnaps[i]);
          if (dist < closestDist) {
            closestDist = dist;
            closestIdx = i;
          }
        }

        currentSnap.current = closestIdx;
        snapTo(sortedSnaps[closestIdx]);
      },
    }),
  ).current;

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={dismiss}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              backgroundColor: theme.palette.overlay,
              opacity: backdropOpacity,
            },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />
        </Animated.View>

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              height: SCREEN_HEIGHT,
              backgroundColor: theme.palette.surface,
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Handle */}
          <View style={styles.handleArea} {...panResponder.panHandlers}>
            <View
              style={[
                styles.handle,
                { backgroundColor: theme.palette.disabled },
              ]}
            />
          </View>

          {/* Content */}
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  handleArea: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default BottomSheet;
