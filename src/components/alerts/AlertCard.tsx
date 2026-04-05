/**
 * AlertCard - Alert list item card with swipe-to-dismiss
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  PanResponder,
  I18nManager,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../theme';
import type { Alert } from '../../types';
import { SeverityBadge } from './SeverityBadge';

export interface AlertCardProps {
  alert: Alert;
  onPress?: () => void;
  onDismiss?: () => void;
}

const CATEGORY_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  traffic: 'car',
  transit: 'bus',
  parking: 'parking',
  weather: 'weather-partly-cloudy',
  incident: 'alert-octagon',
  enforcement: 'shield-alert',
  emergency: 'alarm-light',
  general: 'bell',
};

function getRelativeTime(
  isoDate: string,
  t: (key: string, opts?: Record<string, unknown>) => string,
): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t('alerts.card.timeAgo.justNow');
  if (minutes < 60) return t('alerts.card.timeAgo.minutes', { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('alerts.card.timeAgo.hours', { count: hours });
  const days = Math.floor(hours / 24);
  return t('alerts.card.timeAgo.days', { count: days });
}

const SWIPE_THRESHOLD = 100;

export function AlertCard({ alert, onPress, onDismiss }: AlertCardProps) {
  const theme = useAppTheme();
  const { t, i18n } = useTranslation();
  const translateX = useRef(new Animated.Value(0)).current;

  const isAr = i18n.language === 'ar';
  const title = isAr ? alert.titleAr : alert.title;
  const categoryIcon = CATEGORY_ICONS[alert.category] ?? 'bell';
  const severityKey = alert.severity === 'major' ? 'warning' : alert.severity === 'minor' ? 'info' : alert.severity;
  const badgeSeverity = (severityKey === 'critical' || severityKey === 'warning' || severityKey === 'info') ? severityKey : 'info';
  const timeAgo = getRelativeTime(alert.createdAt, t);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 10 && Math.abs(gesture.dy) < 20,
      onPanResponderMove: (_, gesture) => {
        translateX.setValue(gesture.dx);
      },
      onPanResponderRelease: (_, gesture) => {
        if (Math.abs(gesture.dx) > SWIPE_THRESHOLD && onDismiss) {
          Animated.timing(translateX, {
            toValue: gesture.dx > 0 ? 400 : -400,
            duration: 200,
            useNativeDriver: true,
          }).start(() => onDismiss());
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            speed: 40,
            bounciness: 6,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <View style={styles.wrapper}>
      {/* Dismiss background */}
      <View
        style={[styles.dismissBg, { backgroundColor: theme.semantic.error + '20' }]}
      >
        <MaterialCommunityIcons
          name="delete-outline"
          size={24}
          color={theme.semantic.error}
        />
      </View>

      <Animated.View
        {...panResponder.panHandlers}
        style={[{ transform: [{ translateX }] }]}
      >
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [
            styles.card,
            {
              backgroundColor: theme.palette.card,
              borderColor: theme.palette.border,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            alert.isRead ? title : `${t('alerts.card.unread')}: ${title}`
          }
        >
          {/* Unread accent bar */}
          {!alert.isRead && (
            <View style={[styles.unreadBar, { backgroundColor: theme.brand.accent }]} />
          )}

          <View style={styles.content}>
            {/* Icon */}
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.severity[badgeSeverity] + '18' },
              ]}
            >
              <MaterialCommunityIcons
                name={categoryIcon}
                size={20}
                color={theme.severity[badgeSeverity]}
              />
            </View>

            {/* Text content */}
            <View style={styles.textSection}>
              <View style={styles.titleRow}>
                <Text
                  style={[
                    styles.title,
                    { color: theme.palette.text },
                    !alert.isRead && styles.titleUnread,
                  ]}
                  numberOfLines={2}
                >
                  {title}
                </Text>
                <Text style={[styles.time, { color: theme.palette.textTertiary }]}>
                  {timeAgo}
                </Text>
              </View>
              <SeverityBadge severity={badgeSeverity} />
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
  },
  dismissBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  unreadBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  content: {
    flexDirection: 'row',
    padding: 14,
    gap: 12,
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSection: {
    flex: 1,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    fontSize: 15,
    flex: 1,
    lineHeight: 20,
  },
  titleUnread: {
    fontWeight: '700',
  },
  time: {
    fontSize: 11,
    marginTop: 2,
  },
});

export default AlertCard;
