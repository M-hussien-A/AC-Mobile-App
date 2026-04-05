/**
 * ACUD ITS Traveler Mobile App - Alert Detail Screen
 *
 * Full alert detail view with map, recommended actions, and related alerts.
 * Automatically marks the alert as read on mount.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Share,
  Pressable,
  StyleSheet,
  Platform,
  ActivityIndicator,
  FlatList,
  I18nManager,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useThemeColors } from '../../theme';
import { AlertsStackParamList } from '../../navigation/types';
import { useAlertStore } from '../../stores/alertStore';
import * as alertService from '../../services/alertService';
import { SeverityBadge } from '../../components/alerts';
import { Card, Badge } from '../../components/common';
import type { Alert, IncidentSeverity } from '../../types';

// ── Types ──────────────────────────────────────────────────────
type Nav = NativeStackNavigationProp<AlertsStackParamList, 'AlertDetail'>;
type RouteParams = RouteProp<AlertsStackParamList, 'AlertDetail'>;

// ── Helpers ────────────────────────────────────────────────────
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

function toSeverityBadge(severity: IncidentSeverity): 'critical' | 'warning' | 'info' {
  if (severity === 'critical') return 'critical';
  if (severity === 'major') return 'warning';
  return 'info';
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

// ── Recommended Actions ────────────────────────────────────────
const CATEGORY_ACTIONS: Record<string, string[]> = {
  traffic: [
    'Consider alternate routes to avoid delays.',
    'Check real-time traffic map for updates.',
    'Allow extra travel time if departure cannot be delayed.',
  ],
  incident: [
    'Stay away from the affected area if possible.',
    'Follow instructions from authorities.',
    'Report additional information if you are a witness.',
  ],
  weather: [
    'Avoid unnecessary travel during severe weather.',
    'Keep emergency supplies in your vehicle.',
    'Monitor weather updates regularly.',
  ],
  transit: [
    'Check transit schedule for service changes.',
    'Consider alternative transit routes.',
    'Allow extra time for your commute.',
  ],
  enforcement: [
    'Ensure compliance with posted regulations.',
    'Drive within speed limits in enforcement zones.',
    'Check your violation status if applicable.',
  ],
  emergency: [
    'Follow evacuation instructions immediately.',
    'Call emergency services if in immediate danger.',
    'Proceed to the nearest rally point.',
  ],
  general: [
    'Stay informed by checking alerts regularly.',
    'Share relevant alerts with fellow travelers.',
  ],
};

// ── Component ──────────────────────────────────────────────────
export default function AlertDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteParams>();
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const isAr = i18n.language === 'ar';

  const { alertId } = route.params;

  // Store
  const storeAlerts = useAlertStore((s) => s.alerts);
  const markAsRead = useAlertStore((s) => s.markAsRead);

  // Local state
  const [alert, setAlert] = useState<Alert | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // ── Load Alert ─────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await alertService.getAlertById(alertId);
        if (!cancelled && data) {
          setAlert(data);
          // Mark as read
          markAsRead(alertId);
          alertService.markAlertRead(alertId);
        }
      } catch {
        // fail silently
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [alertId, markAsRead]);

  // ── Related Alerts ─────────────────────────────────────────
  const relatedAlerts = useMemo(() => {
    if (!alert) return [];
    return storeAlerts
      .filter((a) => a.id !== alert.id && a.category === alert.category)
      .slice(0, 6);
  }, [alert, storeAlerts]);

  // ── Share ──────────────────────────────────────────────────
  const handleShare = useCallback(async () => {
    if (!alert) return;
    try {
      await Share.share({
        title: isAr ? alert.titleAr : alert.title,
        message: `${isAr ? alert.titleAr : alert.title}\n\n${isAr ? alert.messageAr : alert.message}`,
      });
    } catch {
      // Cancelled
    }
  }, [alert, isAr]);

  // Set share button in header
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={handleShare}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={t('alerts.detail.share', 'Share alert')}
        >
          <MaterialCommunityIcons name="share-variant" size={22} color={colors.text} />
        </Pressable>
      ),
    });
  }, [navigation, handleShare, colors.text, t]);

  // ── Loading State ──────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!alert) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.textTertiary} />
        <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>
          {t('alerts.detail.notFound', 'Alert not found')}
        </Text>
      </View>
    );
  }

  // ── Derived Values ─────────────────────────────────────────
  const title = isAr ? alert.titleAr : alert.title;
  const message = isAr ? alert.messageAr : alert.message;
  const badgeSeverity = toSeverityBadge(alert.severity);
  const categoryIcon = CATEGORY_ICONS[alert.category] ?? 'bell';
  const actions = CATEGORY_ACTIONS[alert.category] ?? CATEGORY_ACTIONS.general;
  const hasLocation = alert.location && alert.location.latitude !== 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Badges */}
      <View style={styles.badgeRow}>
        <SeverityBadge severity={badgeSeverity} />
        <Badge
          label={t(`alerts.categories.${alert.category}`, alert.category)}
          variant="info"
          size="sm"
        />
        <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
          {formatTimestamp(alert.createdAt)}
        </Text>
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      {/* Body */}
      <Text style={[styles.body, { color: colors.textSecondary }]}>{message}</Text>

      {/* Map Card */}
      {hasLocation && (
        <View style={styles.mapSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('alerts.detail.location', 'Location')}
          </Text>
          <View style={[styles.mapContainer, { borderColor: colors.border }]}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: alert.location!.latitude,
                longitude: alert.location!.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: alert.location!.latitude,
                  longitude: alert.location!.longitude,
                }}
                title={title}
              />
              {alert.radius && alert.radius > 0 && (
                <Circle
                  center={{
                    latitude: alert.location!.latitude,
                    longitude: alert.location!.longitude,
                  }}
                  radius={alert.radius}
                  fillColor="rgba(220, 38, 38, 0.12)"
                  strokeColor="rgba(220, 38, 38, 0.4)"
                  strokeWidth={2}
                />
              )}
            </MapView>
          </View>
        </View>
      )}

      {/* Recommended Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('alerts.detail.recommendedAction', 'Recommended Actions')}
        </Text>
        <Card>
          {actions.map((action, index) => (
            <View key={index} style={styles.actionItem}>
              <View
                style={[styles.actionDot, { backgroundColor: colors.accent }]}
              />
              <Text style={[styles.actionText, { color: colors.textSecondary }]}>
                {action}
              </Text>
            </View>
          ))}
        </Card>
      </View>

      {/* Related Alerts */}
      {relatedAlerts.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('alerts.detail.relatedAlerts', 'Related Alerts')}
          </Text>
          <FlatList
            data={relatedAlerts}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            inverted={I18nManager.isRTL}
            contentContainerStyle={styles.relatedListContent}
            renderItem={({ item }) => {
              const relTitle = isAr ? item.titleAr : item.title;
              const relSeverity = toSeverityBadge(item.severity);
              return (
                <Card
                  onPress={() =>
                    navigation.push('AlertDetail', { alertId: item.id })
                  }
                  style={styles.relatedCard}
                  accessibilityLabel={relTitle}
                >
                  <SeverityBadge severity={relSeverity} />
                  <Text
                    style={[
                      styles.relatedTitle,
                      { color: colors.text },
                      !item.isRead && styles.relatedTitleUnread,
                    ]}
                    numberOfLines={2}
                  >
                    {relTitle}
                  </Text>
                  <Text
                    style={[styles.relatedTime, { color: colors.textTertiary }]}
                  >
                    {formatTimestamp(item.createdAt)}
                  </Text>
                </Card>
              );
            }}
          />
        </View>
      )}

      {/* Bottom spacer */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// ── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  notFoundText: {
    fontSize: 16,
    fontWeight: '500',
  },
  // Header badges
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '400',
    marginLeft: 'auto',
  },
  // Title
  title: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 12,
  },
  // Body
  body: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  // Map
  mapSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  map: {
    height: 200,
    width: '100%',
  },
  // Sections
  section: {
    marginBottom: 20,
  },
  // Actions
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  actionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  // Related alerts
  relatedListContent: {
    gap: 12,
  },
  relatedCard: {
    width: 200,
    gap: 8,
  },
  relatedTitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  relatedTitleUnread: {
    fontWeight: '700',
  },
  relatedTime: {
    fontSize: 11,
  },
  bottomSpacer: {
    height: 32,
  },
});
