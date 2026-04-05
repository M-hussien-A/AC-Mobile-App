/**
 * TrafficMapScreen - Full-screen interactive traffic map.
 *
 * Displays traffic flow polylines, incidents, DMS markers, work zones,
 * and intersection markers with layer-based toggling.
 */

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  I18nManager,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import MapView, { Polyline, Marker, Polygon, Region } from '../../utils/MapView';

import { useThemeColors } from '../../theme';
import { useAppTheme } from '../../theme';
import { HomeStackParamList } from '../../navigation/types';
import { useTrafficStore } from '../../stores/trafficStore';

import * as trafficService from '../../services/trafficService';
import * as incidentService from '../../services/incidentService';
import * as dmsService from '../../services/dmsService';

import { Card } from '../../components/common/Card';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import TrafficMapView from '../../components/map/TrafficMapView';
import MapLayerToggle from '../../components/map/MapLayerToggle';

import type {
  RoadSegment,
  Incident,
  DMSMessage,
  Intersection,
  WorkZone,
  LOSGrade,
} from '../../types';

// ── Types ────────────────────────────────────────────────────────

type Nav = NativeStackNavigationProp<HomeStackParamList, 'TrafficMap'>;

// ── Constants ────────────────────────────────────────────────────

const GOV_DISTRICT: Region = {
  latitude: 30.0194,
  longitude: 31.76,
  latitudeDelta: 0.03,
  longitudeDelta: 0.03,
};

// ── Helpers ──────────────────────────────────────────────────────

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

function incidentIcon(type: string): keyof typeof MaterialCommunityIcons.glyphMap {
  switch (type) {
    case 'accident':
      return 'car-emergency';
    case 'breakdown':
      return 'car-wrench';
    case 'construction':
      return 'hard-hat';
    case 'congestion':
      return 'traffic-cone';
    case 'road_closure':
      return 'road-variant';
    case 'hazard':
      return 'alert';
    case 'event':
      return 'calendar-alert';
    default:
      return 'alert-circle';
  }
}

function severityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return '#DC2626';
    case 'major':
      return '#F59E0B';
    case 'minor':
      return '#3B82F6';
    default:
      return '#6B7280';
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

// ── Component ────────────────────────────────────────────────────

export default function TrafficMapScreen() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const SCREEN_WIDTH = Math.min(windowWidth, 480);
  const SCREEN_HEIGHT = windowHeight;
  const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.35;

  const navigation = useNavigation<Nav>();
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const theme = useAppTheme();
  const isRTL = I18nManager.isRTL;
  const mapRef = useRef<MapView>(null);

  const activeLayers = useTrafficStore((s) => s.activeLayers);
  const toggleLayer = useTrafficStore((s) => s.toggleLayer);

  // ── State ────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roadSegments, setRoadSegments] = useState<RoadSegment[]>([]);
  const [intersections, setIntersections] = useState<Intersection[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [dmsMessages, setDmsMessages] = useState<DMSMessage[]>([]);
  const [workZones] = useState<WorkZone[]>([]); // Placeholder, no mock service yet
  const [zoomLevel, setZoomLevel] = useState(GOV_DISTRICT.latitudeDelta);
  const [searchText, setSearchText] = useState('');
  const [bottomSheetVisible, setBottomSheetVisible] = useState(true);

  // ── Data loading ─────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [mapData, incidentsRes, dmsRes] = await Promise.all([
        trafficService.getMapData(),
        incidentService.getActiveIncidents(),
        dmsService.getActiveDmsMessages(),
      ]);

      setRoadSegments(mapData.roadSegments);
      setIntersections(mapData.intersections);
      setIncidents(incidentsRes);
      setDmsMessages(dmsRes);
    } catch {
      setError(t('home.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRegionChange = useCallback((region: Region) => {
    setZoomLevel(region.latitudeDelta);
  }, []);

  const handleMyLocation = useCallback(() => {
    mapRef.current?.animateToRegion(GOV_DISTRICT, 500);
  }, []);

  // ── Bottom sheet items based on active layers ────────────────
  const bottomSheetItems = useMemo(() => {
    if (activeLayers.includes('incidents')) {
      return incidents.map((inc) => ({
        id: inc.id,
        type: 'incident' as const,
        title: i18n.language === 'ar' ? inc.titleAr : inc.title,
        subtitle: relativeTime(inc.startTime, t),
        icon: incidentIcon(inc.type),
        color: severityColor(inc.severity),
        data: inc,
      }));
    }
    if (activeLayers.includes('dms')) {
      return dmsMessages.map((dms) => ({
        id: dms.id,
        type: 'dms' as const,
        title: dms.signId,
        subtitle: i18n.language === 'ar' ? dms.messageAr : dms.message,
        icon: 'message-alert' as keyof typeof MaterialCommunityIcons.glyphMap,
        color: '#3B82F6',
        data: dms,
      }));
    }
    return [];
  }, [activeLayers, incidents, dmsMessages, i18n.language, t]);

  // ── Traffic legend data ──────────────────────────────────────
  const legendItems = [
    { color: '#22C55E', label: t('traffic.los.freeFlow') },
    { color: '#EAB308', label: t('traffic.los.moderate') },
    { color: '#EF4444', label: t('traffic.los.congested') },
    { color: '#1F2937', label: t('traffic.los.gridlock') },
  ];

  // ── Loading state ────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.flex1, { backgroundColor: colors.background }]}>
        <StatusBar
          barStyle={theme.isDark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {t('home.loadingMap')}
          </Text>
        </View>
      </View>
    );
  }

  // ── Error state ──────────────────────────────────────────────
  if (error) {
    return (
      <SafeAreaView style={[styles.flex1, { backgroundColor: colors.background }]}>
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
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ── Render ───────────────────────────────────────────────────
  return (
    <View style={styles.flex1}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* ─── Full-screen map ─────────────────────────────── */}
      <TrafficMapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={GOV_DISTRICT}
      >
        {/* Traffic flow polylines */}
        {activeLayers.includes('trafficFlow') &&
          roadSegments.map((seg) => (
            <Polyline
              key={seg.id}
              coordinates={[seg.startPoint, ...seg.waypoints, seg.endPoint]}
              strokeColor={losToColor(seg.los)}
              strokeWidth={4}
            />
          ))}

        {/* Incident markers */}
        {activeLayers.includes('incidents') &&
          incidents.map((inc) => (
            <Marker
              key={inc.id}
              coordinate={inc.location}
              title={i18n.language === 'ar' ? inc.titleAr : inc.title}
              onCalloutPress={() =>
                navigation.navigate('IncidentDetail', { incidentId: inc.id })
              }
              pinColor={severityColor(inc.severity)}
            />
          ))}

        {/* DMS markers */}
        {activeLayers.includes('dms') &&
          dmsMessages.map((dms) => (
            <Marker
              key={dms.id}
              coordinate={dms.location}
              title={dms.signId}
              description={i18n.language === 'ar' ? dms.messageAr : dms.message}
              pinColor="#3B82F6"
            />
          ))}

        {/* Work zone polygons */}
        {activeLayers.includes('workZones') &&
          workZones.map((wz) => (
            <Polygon
              key={wz.id}
              coordinates={wz.boundary}
              fillColor="rgba(249, 115, 22, 0.2)"
              strokeColor="#F97316"
              strokeWidth={2}
            />
          ))}

        {/* Intersection markers (when zoomed in) */}
        {activeLayers.includes('intersections') &&
          zoomLevel < 0.02 &&
          intersections.map((inter) => (
            <Marker
              key={inter.id}
              coordinate={inter.location}
              title={i18n.language === 'ar' ? inter.nameAr : inter.name}
              pinColor={losToColor(inter.los)}
            />
          ))}
      </TrafficMapView>

      {/* ─── Back button (floating top-left) ─────────────── */}
      <SafeAreaView style={styles.overlayTopSafe}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={[
            styles.floatingBtn,
            {
              backgroundColor: colors.card,
              [isRTL ? 'right' : 'left']: 16,
              ...Platform.select({
                ios: {
                  shadowColor: colors.shadow,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                },
                android: { elevation: 4 },
              }),
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <MaterialCommunityIcons
            name={isRTL ? 'arrow-right' : 'arrow-left'}
            size={24}
            color={colors.text}
          />
        </Pressable>

        {/* ─── Search bar (floating top center) ──────────── */}
        <Pressable
          onPress={() => navigation.getParent()?.navigate('JourneyTab')}
          style={[
            styles.floatingSearch,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              flexDirection: isRTL ? 'row-reverse' : 'row',
              [isRTL ? 'right' : 'left']: 64,
              [isRTL ? 'left' : 'right']: 72,
              ...Platform.select({
                ios: {
                  shadowColor: colors.shadow,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.12,
                  shadowRadius: 4,
                },
                android: { elevation: 4 },
              }),
            },
          ]}
          accessibilityRole="search"
          accessibilityLabel={t('home.searchPlaceholder')}
        >
          <MaterialCommunityIcons name="magnify" size={20} color={colors.placeholder} />
          <Text style={[styles.searchText, { color: colors.placeholder }]} numberOfLines={1}>
            {t('home.searchPlaceholder')}
          </Text>
        </Pressable>
      </SafeAreaView>

      {/* ─── My location button (floating right) ─────────── */}
      <Pressable
        onPress={handleMyLocation}
        style={[
          styles.myLocationBtn,
          {
            backgroundColor: colors.card,
            [isRTL ? 'left' : 'right']: 16,
            ...Platform.select({
              ios: {
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
              },
              android: { elevation: 4 },
            }),
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={t('home.myLocation')}
      >
        <MaterialCommunityIcons name="crosshairs-gps" size={22} color={colors.primary} />
      </Pressable>

      {/* ─── Map layer toggle (floating bottom-right) ────── */}
      <View style={[styles.layerToggleContainer, { bottom: BOTTOM_SHEET_HEIGHT + 60, [isRTL ? 'left' : 'right']: 16 }]}>
        <MapLayerToggle activeLayers={activeLayers} onToggleLayer={toggleLayer} />
      </View>

      {/* ─── Traffic legend (floating bottom-left) ────────── */}
      <View
        style={[
          styles.legendContainer,
          {
            bottom: BOTTOM_SHEET_HEIGHT + 16,
            backgroundColor: colors.card,
            [isRTL ? 'right' : 'left']: 16,
            ...Platform.select({
              ios: {
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
              },
              android: { elevation: 3 },
            }),
          },
        ]}
      >
        {legendItems.map((item, idx) => (
          <View
            key={idx}
            style={[styles.legendRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
          >
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      {/* ─── Bottom sheet ─────────────────────────────────── */}
      {bottomSheetItems.length > 0 && bottomSheetVisible && (
        <View
          style={[
            styles.bottomSheet,
            {
              height: BOTTOM_SHEET_HEIGHT,
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
            },
          ]}
        >
          {/* Handle bar */}
          <View style={styles.bottomSheetHandle}>
            <View style={[styles.handleBar, { backgroundColor: colors.disabled }]} />
          </View>

          <FlatList
            data={bottomSheetItems}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.bottomSheetListContent}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  if (item.type === 'incident') {
                    navigation.navigate('IncidentDetail', { incidentId: item.id });
                  }
                }}
                style={[
                  styles.bottomSheetCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={item.title}
              >
                <View style={[styles.sheetCardIcon, { backgroundColor: `${item.color}15` }]}>
                  <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
                </View>
                <View style={styles.sheetCardContent}>
                  <Text
                    style={[styles.sheetCardTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={[styles.sheetCardSub, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}
                    numberOfLines={1}
                  >
                    {item.subtitle}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name={isRTL ? 'chevron-left' : 'chevron-right'}
                  size={20}
                  color={colors.icon}
                />
              </Pressable>
            )}
          />
        </View>
      )}
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
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
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },

  // Overlay top row
  overlayTopSafe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  floatingBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 11,
  },
  floatingSearch: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 16,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
    zIndex: 10,
  },
  searchText: {
    flex: 1,
    fontSize: 14,
  },

  // My location
  myLocationBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 74,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  // Layer toggle
  layerToggleContainer: {
    position: 'absolute',
    zIndex: 10,
  },

  // Legend
  legendContainer: {
    position: 'absolute',
    borderRadius: 10,
    padding: 10,
    zIndex: 9,
  },
  legendRow: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 11,
  },

  // Bottom sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    zIndex: 10,
  },
  bottomSheetHandle: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  bottomSheetListContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 8,
  },
  bottomSheetCard: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  sheetCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCardContent: {
    flex: 1,
  },
  sheetCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  sheetCardSub: {
    fontSize: 12,
  },
});
