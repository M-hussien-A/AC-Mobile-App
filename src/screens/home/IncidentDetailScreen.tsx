/**
 * IncidentDetailScreen - Shows full details for a specific incident.
 *
 * Receives incidentId param, loads from mock service, and displays
 * map, details, impact, related DMS messages, and a status timeline.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  I18nManager,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker } from '../../utils/MapView';
import { useThemeColors } from '../../theme';
import { Card } from '../../components/common/Card';
import { AccessibleText } from '../../components/common/AccessibleText';
import { getIncidentById } from '../../services/incidentService';
import { getDmsById } from '../../services/dmsService';
import type { Incident, DMSMessage } from '../../types';
import type { HomeStackParamList } from '../../navigation/types';
import { formatRelativeTime, getSeverityColor, getIncidentTypeIcon } from '../../utils/helpers';

// ── Types ────────────────────────────────────────────────────────

type Nav = NativeStackNavigationProp<HomeStackParamList, 'IncidentDetail'>;
type RouteParams = RouteProp<HomeStackParamList, 'IncidentDetail'>;

// ── Helpers ──────────────────────────────────────────────────────

function mapSeverityToBadge(severity: string): { label: string; color: string; bg: string } {
  switch (severity) {
    case 'critical':
      return { label: 'Critical', color: '#DC2626', bg: '#DC262620' };
    case 'major':
      return { label: 'Major', color: '#F59E0B', bg: '#F59E0B20' };
    case 'minor':
      return { label: 'Minor', color: '#3B82F6', bg: '#3B82F620' };
    default:
      return { label: 'Info', color: '#6B7280', bg: '#6B728020' };
  }
}

// ── Component ────────────────────────────────────────────────────

export default function IncidentDetailScreen() {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<Nav>();
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const isRTL = I18nManager.isRTL;
  const isAr = i18n.language === 'ar';

  const [incident, setIncident] = useState<Incident | null>(null);
  const [relatedDms, setRelatedDms] = useState<DMSMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const incidentId = route.params?.incidentId;

  const loadData = useCallback(async () => {
    if (!incidentId) {
      setError(t('common.noResults'));
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await getIncidentById(incidentId);
      if (data) {
        setIncident(data);
        // Load related DMS messages if the raw data had relatedDmsIds
        const rawData = data as any;
        if (rawData.relatedDmsIds?.length) {
          const dmsResults = await Promise.all(
            rawData.relatedDmsIds.map((id: string) => getDmsById(id)),
          );
          setRelatedDms(dmsResults.filter(Boolean) as DMSMessage[]);
        }
      } else {
        setError(t('common.noResults'));
      }
    } catch {
      setError(t('home.loadError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [incidentId, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  // ── Loading state ────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // ── Error state ──────────────────────────────────────────────
  if (error || !incident) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.error} />
        <AccessibleText style={[styles.errorText, { color: colors.textSecondary }]}>
          {error || t('common.noResults')}
        </AccessibleText>
        <Pressable
          onPress={() => {
            setLoading(true);
            loadData();
          }}
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
          accessibilityLabel={t('common.retry')}
        >
          <AccessibleText style={styles.retryButtonText}>{t('common.retry')}</AccessibleText>
        </Pressable>
      </View>
    );
  }

  const title = isAr ? incident.titleAr : incident.title;
  const description = isAr ? incident.descriptionAr : incident.description;
  const lat = incident.location?.latitude ?? 30.0194;
  const lng = incident.location?.longitude ?? 31.76;
  const sevBadge = mapSeverityToBadge(incident.severity);

  // Build status from incident data
  const isCleared = incident.endTime != null && new Date(incident.endTime) <= new Date();
  const isVerified = incident.verified;

  const timeline = [
    { status: 'detected', time: incident.startTime, icon: 'eye' as const },
    ...(isVerified
      ? [{ status: 'confirmed', time: incident.updatedAt || incident.startTime, icon: 'check-circle' as const }]
      : []),
    ...(isCleared
      ? [{ status: 'cleared', time: incident.endTime!, icon: 'check-all' as const }]
      : []),
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* ─── Header ────────────────────────────────────────── */}
      <View style={[styles.header, { backgroundColor: sevBadge.bg }]}>
        <View
          style={[
            styles.headerRow,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <MaterialCommunityIcons
            name={getIncidentTypeIcon(incident.type) as any}
            size={32}
            color={getSeverityColor(incident.severity)}
          />
          <View style={[styles.headerText, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
            <AccessibleText
              style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}
            >
              {title}
            </AccessibleText>
            <View style={[styles.badges, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.severityBadge, { backgroundColor: sevBadge.bg }]}>
                <AccessibleText style={[styles.severityBadgeText, { color: sevBadge.color }]}>
                  {t(`incidents.severity.${incident.severity}`)}
                </AccessibleText>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: isCleared ? '#22C55E' : isVerified ? colors.primary : '#6B7280' },
                ]}
              >
                <AccessibleText style={styles.statusText}>
                  {isCleared
                    ? t('incidents.status.cleared')
                    : isVerified
                      ? t('incidents.status.confirmed')
                      : t('incidents.status.detected')}
                </AccessibleText>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* ─── Map ───────────────────────────────────────────── */}
      <Card style={styles.card}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
        >
          <Marker
            coordinate={{ latitude: lat, longitude: lng }}
            pinColor={getSeverityColor(incident.severity)}
          />
        </MapView>
      </Card>

      {/* ─── Details ───────────────────────────────────────── */}
      <Card style={styles.card}>
        <AccessibleText style={[styles.sectionTitle, { color: colors.text }]}>
          {t('incidents.details')}
        </AccessibleText>
        <DetailRow
          label={t('incidents.type')}
          value={t(`incidents.types.${incident.type}`)}
          colors={colors}
          isRTL={isRTL}
        />
        <DetailRow
          label={t('incidents.source')}
          value={incident.source}
          colors={colors}
          isRTL={isRTL}
        />
        <DetailRow
          label={t('incidents.startTime')}
          value={formatRelativeTime(incident.startTime)}
          colors={colors}
          isRTL={isRTL}
        />
        {incident.estimatedClearTime && (
          <DetailRow
            label={t('incidents.estimatedClearTime')}
            value={formatRelativeTime(incident.estimatedClearTime)}
            colors={colors}
            isRTL={isRTL}
          />
        )}
        {incident.affectedRoadSegments.length > 0 && (
          <DetailRow
            label={t('incidents.affectedRoads')}
            value={String(incident.affectedRoadSegments.length)}
            colors={colors}
            isRTL={isRTL}
          />
        )}
      </Card>

      {/* ─── Impact / Description ──────────────────────────── */}
      <Card style={styles.card}>
        <AccessibleText style={[styles.sectionTitle, { color: colors.text }]}>
          {t('incidents.impact')}
        </AccessibleText>
        <AccessibleText
          style={[
            styles.body,
            { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' },
          ]}
        >
          {description}
        </AccessibleText>
      </Card>

      {/* ─── Related DMS ───────────────────────────────────── */}
      {relatedDms.length > 0 && (
        <Card style={styles.card}>
          <AccessibleText style={[styles.sectionTitle, { color: colors.text }]}>
            {t('dms.relatedMessages')}
          </AccessibleText>
          {relatedDms.map((dms) => (
            <View key={dms.id} style={[styles.dmsCard, { backgroundColor: colors.surface }]}>
              <AccessibleText style={[styles.dmsName, { color: colors.text }]}>
                {dms.signId}
              </AccessibleText>
              <AccessibleText style={[styles.dmsMessage, { color: colors.accent }]}>
                {isAr ? dms.messageAr : dms.message}
              </AccessibleText>
            </View>
          ))}
        </Card>
      )}

      {/* ─── Timeline ──────────────────────────────────────── */}
      <Card style={styles.card}>
        <AccessibleText style={[styles.sectionTitle, { color: colors.text }]}>
          {t('incidents.timeline')}
        </AccessibleText>
        {timeline.map((item, index) => (
          <View key={item.status} style={[styles.timelineItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={styles.timelineDot}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      index <= timeline.length - 1 ? colors.primary : colors.border,
                  },
                ]}
              />
              {index < timeline.length - 1 && (
                <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
              )}
            </View>
            <View style={styles.timelineContent}>
              <AccessibleText style={[styles.timelineStatus, { color: colors.text }]}>
                {t(`incidents.status.${item.status}`)}
              </AccessibleText>
              <AccessibleText style={[styles.timelineTime, { color: colors.textSecondary }]}>
                {formatRelativeTime(item.time)}
              </AccessibleText>
            </View>
          </View>
        ))}
      </Card>

      {/* Bottom spacer */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// ── Detail Row ─────────────────────────────────────────────────

function DetailRow({
  label,
  value,
  colors,
  isRTL,
}: {
  label: string;
  value: string;
  colors: any;
  isRTL: boolean;
}) {
  return (
    <View style={[styles.detailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <AccessibleText style={[styles.detailLabel, { color: colors.textSecondary }]}>
        {label}
      </AccessibleText>
      <AccessibleText style={[styles.detailValue, { color: colors.text }]}>
        {value}
      </AccessibleText>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
    padding: 16,
    marginBottom: 8,
  },
  headerRow: {
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  badges: {
    gap: 8,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  map: {
    height: 200,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
  },
  detailRow: {
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  dmsCard: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  dmsName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  dmsMessage: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  timelineItem: {
    gap: 12,
  },
  timelineDot: {
    alignItems: 'center',
    width: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 30,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  timelineTime: {
    fontSize: 12,
    marginTop: 2,
  },
  bottomSpacer: {
    height: 24,
  },
});
