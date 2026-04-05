/**
 * HomeScreen - Main dashboard for the ACUD ITS Traveler Mobile App.
 *
 * Shows live traffic overview, critical alerts, quick-action grid,
 * traffic summary stats and nearby facilities.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  I18nManager,
  Platform,
  useWindowDimensions,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import MapView, { Polyline } from '../../utils/MapView';

import { useThemeColors, useAppTheme } from '../../theme';
import { HomeStackParamList } from '../../navigation/types';
import { useTrafficStore } from '../../stores/trafficStore';
import { useAlertStore } from '../../stores/alertStore';
import { useSettingsStore } from '../../stores/settingsStore';

import * as trafficService from '../../services/trafficService';
import * as incidentService from '../../services/incidentService';
import * as dmsService from '../../services/dmsService';
import * as alertService from '../../services/alertService';
import * as parkingService from '../../services/parkingService';
import * as transitService from '../../services/transitService';
import * as mobilityService from '../../services/mobilityService';

import { Card } from '../../components/common/Card';
import { SkeletonLoader, SkeletonCard } from '../../components/common/SkeletonLoader';
import TrafficMapView from '../../components/map/TrafficMapView';
import { changeLanguage } from '../../i18n';

import type {
  Alert,
  RoadSegment,
  Incident,
  DMSMessage,
  Intersection,
  ParkingFacility,
  TransitRoute,
  EVChargingStation,
  LOSGrade,
} from '../../types';

// ── Types ────────────────────────────────────────────────────────

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

// ── Helpers ──────────────────────────────────────────────────────

const GOV_DISTRICT = {
  latitude: 30.0194,
  longitude: 31.76,
  latitudeDelta: 0.03,
  longitudeDelta: 0.03,
};

function losToColor(los: LOSGrade): string {
  switch (los) {
    case 'A':
    case 'B':
      return '#22C55E';
    case 'C':
      return '#EAB308';
    case 'D':
    case 'E':
      return '#EF4444';
    case 'F':
      return '#1F2937';
  }
}

function relativeTime(isoDate: string, t: (key: string) => string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t('home.justNow');
  if (minutes < 60) return t('home.minutesAgo').replace('{{count}}', String(minutes));
  const hours = Math.floor(minutes / 60);
  return t('home.hoursAgo').replace('{{count}}', String(hours));
}

function severityIcon(severity: string): keyof typeof MaterialCommunityIcons.glyphMap {
  switch (severity) {
    case 'critical':
      return 'alert-octagon';
    case 'major':
      return 'alert';
    case 'minor':
      return 'alert-circle-outline';
    default:
      return 'information-outline';
  }
}

function severityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return '#DC2626';
    case 'major':
      return '#F59E0B';
    default:
      return '#3B82F6';
  }
}

// ── Component ────────────────────────────────────────────────────

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const theme = useAppTheme();
  const isRTL = I18nManager.isRTL;
  const { width: windowWidth } = useWindowDimensions();
  const screenWidth = Math.min(windowWidth, 480);

  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const unreadAlerts = useAlertStore((s) => s.getUnreadCount());

  // ── Local state ──────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [roadSegments, setRoadSegments] = useState<RoadSegment[]>([]);
  const [intersections, setIntersections] = useState<Intersection[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [dmsMessages, setDmsMessages] = useState<DMSMessage[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [nearbyParking, setNearbyParking] = useState<ParkingFacility | null>(null);
  const [nearbyTransit, setNearbyTransit] = useState<TransitRoute | null>(null);
  const [nearbyEV, setNearbyEV] = useState<EVChargingStation | null>(null);

  const alertListRef = useRef<FlatList>(null);
  const alertScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Data loading ─────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [
        segmentsRes,
        intersectionsRes,
        incidentsRes,
        dmsRes,
        alertsRes,
        parkingRes,
        transitRes,
        evRes,
      ] = await Promise.all([
        trafficService.getRoadSegments(),
        trafficService.getIntersections(),
        incidentService.getActiveIncidents(),
        dmsService.getActiveDmsMessages(),
        alertService.getAlerts(),
        parkingService.getParkingFacilities(),
        transitService.getTransitRoutes(),
        mobilityService.getEVChargingStations(),
      ]);

      setRoadSegments(segmentsRes);
      setIntersections(intersectionsRes);
      setIncidents(incidentsRes);
      setDmsMessages(dmsRes);
      setAlerts(alertsRes);

      // Nearest items (first from list as mock)
      if (parkingRes.length > 0) setNearbyParking(parkingRes[0]);
      if (transitRes.length > 0) setNearbyTransit(transitRes[0]);
      if (evRes.length > 0) setNearbyEV(evRes[0]);
    } catch (e) {
      setError(t('home.loadError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-scroll alerts
  useEffect(() => {
    const criticalAlerts = alerts.filter(
      (a) => a.severity === 'critical' || a.severity === 'major',
    );
    if (criticalAlerts.length <= 1) return;

    let currentIndex = 0;
    alertScrollTimer.current = setInterval(() => {
      currentIndex = (currentIndex + 1) % criticalAlerts.length;
      alertListRef.current?.scrollToIndex({
        index: currentIndex,
        animated: true,
      });
    }, 4000);

    return () => {
      if (alertScrollTimer.current) clearInterval(alertScrollTimer.current);
    };
  }, [alerts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleToggleLanguage = useCallback(async () => {
    const nextLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(nextLang);
    await changeLanguage(nextLang);
  }, [language, setLanguage]);

  // ── Critical alerts ──────────────────────────────────────────
  const criticalAlerts = alerts.filter(
    (a) => a.severity === 'critical' || a.severity === 'major',
  );

  // ── Quick actions ────────────────────────────────────────────
  const quickActions: {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    label: string;
    onPress: () => void;
  }[] = [
    {
      icon: 'map-marker-path',
      label: t('home.navigate'),
      onPress: () => navigation.getParent()?.navigate('JourneyTab'),
    },
    {
      icon: 'car',
      label: t('home.parking'),
      onPress: () => navigation.getParent()?.navigate('ServicesTab'),
    },
    {
      icon: 'bus',
      label: t('home.transit'),
      onPress: () => navigation.getParent()?.navigate('ServicesTab'),
    },
    {
      icon: 'alert-circle',
      label: t('home.report'),
      onPress: () => navigation.getParent()?.navigate('ProfileTab'),
    },
  ];

  // ── Traffic summary stats ────────────────────────────────────
  const trafficStats = [
    {
      icon: 'traffic-light' as const,
      count: intersections.length,
      label: t('home.intersections'),
      onPress: () => navigation.navigate('TrafficMap'),
    },
    {
      icon: 'car-emergency' as const,
      count: incidents.length,
      label: t('home.activeIncidents'),
      onPress: () => navigation.navigate('TrafficMap'),
    },
    {
      icon: 'message-alert' as const,
      count: dmsMessages.length,
      label: t('home.dmsMessages'),
      onPress: () => navigation.navigate('DMSMessageList'),
    },
  ];

  // ── Skeleton loading state ───────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <StatusBar
          barStyle={theme.isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <View style={styles.skeletonContainer}>
          <SkeletonLoader width="60%" height={24} style={styles.skeletonLine} />
          <SkeletonLoader width="100%" height={44} borderRadius={12} style={styles.skeletonLine} />
          <SkeletonLoader width="100%" height={200} borderRadius={12} style={styles.skeletonLine} />
          <View style={styles.skeletonRow}>
            <SkeletonLoader width="48%" height={80} borderRadius={12} />
            <SkeletonLoader width="48%" height={80} borderRadius={12} />
          </View>
          <View style={styles.skeletonRow}>
            <SkeletonLoader width="48%" height={80} borderRadius={12} />
            <SkeletonLoader width="48%" height={80} borderRadius={12} />
          </View>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </SafeAreaView>
    );
  }

  // ── Error state ──────────────────────────────────────────────
  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <StatusBar
          barStyle={theme.isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
          <Pressable
            onPress={() => {
              setLoading(true);
              loadData();
            }}
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            accessibilityRole="button"
            accessibilityLabel={t('common.retry')}
          >
            <Text style={styles.retryText}>{t('common.retry')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ── Render ───────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* ─── Top bar ─────────────────────────────────────── */}
        <View style={[styles.topBar, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.topBarLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.logoCircle, { backgroundColor: `${colors.accent}20` }]}>
              <MaterialCommunityIcons name="traffic-light" size={24} color={colors.accent} />
            </View>
            <Text style={[styles.appName, { color: colors.text, marginStart: 10 }]}>
              {t('common.appName')}
            </Text>
          </View>
          <View style={[styles.topBarRight, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Pressable
              onPress={handleToggleLanguage}
              style={[styles.langToggle, { backgroundColor: colors.surfaceVariant }]}
              accessibilityRole="button"
              accessibilityLabel={t('home.toggleLanguage')}
            >
              <Text style={[styles.langText, { color: colors.primary }]}>
                {language === 'ar' ? 'EN' : '\u0639\u0631'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.getParent()?.navigate('AlertsTab')}
              style={styles.bellWrapper}
              accessibilityRole="button"
              accessibilityLabel={t('home.notifications')}
            >
              <MaterialCommunityIcons name="bell-outline" size={24} color={colors.text} />
              {unreadAlerts > 0 && (
                <View style={[styles.bellBadge, { backgroundColor: colors.error }]}>
                  <Text style={styles.bellBadgeText}>
                    {unreadAlerts > 99 ? '99+' : unreadAlerts}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* ─── Search bar ──────────────────────────────────── */}
        <Pressable
          onPress={() => navigation.getParent()?.navigate('JourneyTab')}
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surfaceVariant,
              borderColor: colors.border,
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
          ]}
          accessibilityRole="search"
          accessibilityLabel={t('home.searchPlaceholder')}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={colors.placeholder}
            style={{ marginEnd: 8 }}
          />
          <Text style={[styles.searchPlaceholder, { color: colors.placeholder }]}>
            {t('home.searchPlaceholder')}
          </Text>
        </Pressable>

        {/* ─── Mini traffic map card ───────────────────────── */}
        <Card
          onPress={() => navigation.navigate('TrafficMap')}
          style={styles.mapCard}
          accessibilityLabel={t('home.liveTraffic')}
        >
          <View style={styles.mapContainer}>
            <TrafficMapView
              style={styles.miniMap}
              initialRegion={GOV_DISTRICT}
            >
              {roadSegments.map((seg) => (
                <Polyline
                  key={seg.id}
                  coordinates={[seg.startPoint, ...seg.waypoints, seg.endPoint]}
                  strokeColor={losToColor(seg.los)}
                  strokeWidth={3}
                />
              ))}
            </TrafficMapView>
            <View style={styles.mapOverlayLabel} pointerEvents="none">
              <MaterialCommunityIcons name="access-point" size={16} color="#FFFFFF" />
              <Text style={styles.mapOverlayText}>{t('home.liveTraffic')}</Text>
            </View>
            {/* Block touch events from reaching the map */}
            <View style={StyleSheet.absoluteFill} pointerEvents="box-only" />
          </View>
        </Card>

        {/* ─── Alert banner ────────────────────────────────── */}
        {criticalAlerts.length > 0 && (
          <View style={styles.alertSection}>
            <FlatList
              ref={alertListRef}
              data={criticalAlerts}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.alertListContent}
              inverted={isRTL}
              onScrollToIndexFailed={() => {}}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() =>
                    navigation.getParent()?.navigate('AlertsTab')
                  }
                  style={[
                    styles.alertCard,
                    {
                      width: screenWidth * 0.75,
                      backgroundColor: `${severityColor(item.severity)}15`,
                      borderColor: severityColor(item.severity),
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={item.title}
                >
                  <MaterialCommunityIcons
                    name={severityIcon(item.severity)}
                    size={20}
                    color={severityColor(item.severity)}
                  />
                  <View style={styles.alertCardContent}>
                    <Text
                      style={[styles.alertCardTitle, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {i18n.language === 'ar' ? item.titleAr : item.title}
                    </Text>
                    <Text
                      style={[styles.alertCardTime, { color: colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {relativeTime(item.startTime, t)}
                    </Text>
                  </View>
                </Pressable>
              )}
            />
          </View>
        )}

        {/* ─── Quick actions grid ──────────────────────────── */}
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, idx) => (
            <Pressable
              key={idx}
              onPress={action.onPress}
              style={[
                styles.quickActionBtn,
                {
                  width: (screenWidth - 44) / 2,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={action.label}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: `${colors.primary}15` }]}>
                <MaterialCommunityIcons name={action.icon} size={28} color={colors.primary} />
              </View>
              <Text
                style={[styles.quickActionLabel, { color: colors.text }]}
                numberOfLines={1}
              >
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ─── Traffic summary cards ───────────────────────── */}
        <FlatList
          data={trafficStats}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.statsListContent}
          inverted={isRTL}
          scrollEnabled={true}
          renderItem={({ item }) => (
            <Card style={styles.statCard} onPress={item.onPress} accessibilityLabel={`${item.label}: ${item.count}`}>
              <MaterialCommunityIcons name={item.icon} size={28} color={colors.primary} />
              <Text style={[styles.statCount, { color: colors.text }]}>{item.count}</Text>
              <Text
                style={[styles.statLabel, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </Card>
          )}
        />

        {/* ─── Nearby section ──────────────────────────────── */}
        <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('home.nearYou')}
          </Text>
          <Pressable
            onPress={() => navigation.getParent()?.navigate('ServicesTab')}
            accessibilityRole="button"
            accessibilityLabel={t('home.seeAll')}
          >
            <Text style={[styles.seeAll, { color: colors.primary }]}>{t('home.seeAll')}</Text>
          </Pressable>
        </View>

        {/* Nearest parking */}
        {nearbyParking && (
          <Card
            onPress={() => navigation.getParent()?.navigate('ServicesTab')}
            style={styles.nearbyCard}
            accessibilityLabel={nearbyParking.name}
          >
            <View style={[styles.nearbyRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.nearbyIcon, { backgroundColor: `${colors.success}15` }]}>
                <MaterialCommunityIcons name="car" size={22} color={colors.success} />
              </View>
              <View style={styles.nearbyTextBlock}>
                <Text style={[styles.nearbyName, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
                  {i18n.language === 'ar' ? nearbyParking.nameAr : nearbyParking.name}
                </Text>
                <Text style={[styles.nearbyMeta, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                  {t('home.spacesAvailable').replace('{{count}}', String(nearbyParking.availableSpaces))}
                </Text>
              </View>
              <MaterialCommunityIcons
                name={isRTL ? 'chevron-left' : 'chevron-right'}
                size={22}
                color={colors.icon}
              />
            </View>
          </Card>
        )}

        {/* Nearest transit */}
        {nearbyTransit && (
          <Card
            onPress={() => navigation.getParent()?.navigate('ServicesTab')}
            style={styles.nearbyCard}
            accessibilityLabel={nearbyTransit.name}
          >
            <View style={[styles.nearbyRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.nearbyIcon, { backgroundColor: `${colors.info}15` }]}>
                <MaterialCommunityIcons name="bus" size={22} color={colors.info} />
              </View>
              <View style={styles.nearbyTextBlock}>
                <Text style={[styles.nearbyName, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
                  {i18n.language === 'ar' ? nearbyTransit.nameAr : nearbyTransit.name}
                </Text>
                <Text style={[styles.nearbyMeta, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                  {t('home.nextIn').replace('{{count}}', String(nearbyTransit.frequency))}
                </Text>
              </View>
              <MaterialCommunityIcons
                name={isRTL ? 'chevron-left' : 'chevron-right'}
                size={22}
                color={colors.icon}
              />
            </View>
          </Card>
        )}

        {/* Nearest EV charging */}
        {nearbyEV && (
          <Card
            onPress={() => navigation.getParent()?.navigate('ServicesTab')}
            style={styles.nearbyCard}
            accessibilityLabel={nearbyEV.name}
          >
            <View style={[styles.nearbyRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.nearbyIcon, { backgroundColor: `${colors.warning}15` }]}>
                <MaterialCommunityIcons name="ev-station" size={22} color={colors.warning} />
              </View>
              <View style={styles.nearbyTextBlock}>
                <Text style={[styles.nearbyName, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
                  {i18n.language === 'ar' ? nearbyEV.nameAr : nearbyEV.name}
                </Text>
                <Text style={[styles.nearbyMeta, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                  {t('home.portsAvailable').replace('{{count}}', String(nearbyEV.availablePorts))}
                </Text>
              </View>
              <MaterialCommunityIcons
                name={isRTL ? 'chevron-left' : 'chevron-right'}
                size={22}
                color={colors.icon}
              />
            </View>
          </Card>
        )}

        {/* Bottom spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────

// Dimensions moved to useWindowDimensions inside the component

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Skeleton
  skeletonContainer: {
    padding: 16,
  },
  skeletonLine: {
    marginBottom: 16,
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  // Error
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },

  // Top bar
  topBar: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  topBarLeft: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
  },
  topBarRight: {
    alignItems: 'center',
    gap: 12,
  },
  langToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  langText: {
    fontWeight: '700',
    fontSize: 14,
  },
  bellWrapper: {
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  bellBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  // Search
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchPlaceholder: {
    fontSize: 15,
  },

  // Map card
  mapCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  miniMap: {
    ...StyleSheet.absoluteFillObject,
  },
  mapOverlayLabel: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 78, 121, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  mapOverlayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Alert banner
  alertSection: {
    marginBottom: 16,
  },
  alertListContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  alertCardContent: {
    flex: 1,
  },
  alertCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  alertCardTime: {
    fontSize: 12,
  },

  // Quick actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  quickActionBtn: {
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Stats
  statsListContent: {
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    minWidth: 120,
    maxWidth: 160,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statCount: {
    fontSize: 26,
    fontWeight: '700',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },

  // Section header
  sectionHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Nearby cards
  nearbyCard: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  nearbyRow: {
    alignItems: 'center',
    gap: 12,
  },
  nearbyIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nearbyTextBlock: {
    flex: 1,
  },
  nearbyName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  nearbyMeta: {
    fontSize: 13,
  },

  // Bottom spacer
  bottomSpacer: {
    height: 24,
  },
});
