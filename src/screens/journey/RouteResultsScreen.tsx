/**
 * RouteResultsScreen - Display and compare route options on map + cards.
 * User selects a route and starts navigation.
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { useThemeColors } from '../../theme';
import { JourneyStackParamList } from '../../navigation/types';
import { useJourneyStore } from '../../stores/journeyStore';
import { Button } from '../../components/common/Button';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { RouteOptionCard } from '../../components/journey/RouteOptionCard';
import { MultiModalTimeline } from '../../components/journey/MultiModalTimeline';
import TrafficMapView from '../../components/map/TrafficMapView';
import { Route } from '../../types';

type Nav = NativeStackNavigationProp<JourneyStackParamList, 'RouteResults'>;
type ScreenRoute = RouteProp<JourneyStackParamList, 'RouteResults'>;

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MAP_HEIGHT = SCREEN_HEIGHT * 0.42;

// ── Mock polyline coordinates for demo ──────────────────────────
const MOCK_ROUTE_COORDS: [number, number][][] = [
  // Route 1 - main road
  [
    [30.022, 31.758], [30.021, 31.759], [30.020, 31.760],
    [30.019, 31.761], [30.020, 31.763], [30.022, 31.764], [30.025, 31.765],
  ],
  // Route 2 - highway
  [
    [30.022, 31.758], [30.023, 31.757], [30.024, 31.758],
    [30.025, 31.760], [30.026, 31.762], [30.025, 31.764], [30.025, 31.765],
  ],
  // Route 3 - alternative
  [
    [30.022, 31.758], [30.021, 31.757], [30.020, 31.758],
    [30.019, 31.760], [30.020, 31.762], [30.022, 31.764], [30.025, 31.765],
  ],
];

const ROUTE_COLORS = ['#4A90D9', '#E67E22', '#8E44AD'];

export default function RouteResultsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ScreenRoute>();
  const { t } = useTranslation();
  const colors = useThemeColors();

  const currentPlan = useJourneyStore((s) => s.currentPlan);
  const selectedRoute = useJourneyStore((s) => s.selectedRoute);
  const setSelectedRoute = useJourneyStore((s) => s.setSelectedRoute);
  const startNavigation = useJourneyStore((s) => s.startNavigation);
  const isLoading = useJourneyStore((s) => s.isLoading);
  const error = useJourneyStore((s) => s.error);

  const [showSteps, setShowSteps] = useState(false);
  const stepsAnim = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView>(null);

  const routes = currentPlan?.routes ?? [];

  // ── Auto-select first route ───────────────────────────────────
  useEffect(() => {
    if (routes.length > 0 && !selectedRoute) {
      setSelectedRoute(routes[0]);
    }
  }, [routes, selectedRoute, setSelectedRoute]);

  // ── Fit map to show all routes ────────────────────────────────
  useEffect(() => {
    if (mapRef.current && routes.length > 0) {
      const allCoords = MOCK_ROUTE_COORDS.flat().map(([lat, lng]) => ({
        latitude: lat,
        longitude: lng,
      }));
      if (allCoords.length > 1) {
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(allCoords, {
            edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
            animated: true,
          });
        }, 500);
      }
    }
  }, [routes]);

  // ── Toggle steps panel ────────────────────────────────────────
  const toggleSteps = useCallback(() => {
    const toValue = showSteps ? 0 : 1;
    setShowSteps(!showSteps);
    Animated.timing(stepsAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showSteps, stepsAnim]);

  const stepsMaxHeight = stepsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 400],
  });

  // ── Start navigation ──────────────────────────────────────────
  const handleStartNavigation = useCallback(() => {
    if (selectedRoute) {
      startNavigation(selectedRoute);
      navigation.navigate('Navigation', { routeId: selectedRoute.id });
    }
  }, [selectedRoute, startNavigation, navigation]);

  // ── Select route ──────────────────────────────────────────────
  const handleSelectRoute = useCallback(
    (r: Route) => {
      setSelectedRoute(r);
    },
    [setSelectedRoute],
  );

  // ── Warnings for selected route ───────────────────────────────
  const selectedIndex = routes.findIndex((r) => r.id === selectedRoute?.id);
  const hasWarnings = selectedRoute && selectedRoute.durationInTraffic > selectedRoute.duration * 1.2;

  // ── Loading state ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.mapPlaceholder, { backgroundColor: colors.surfaceVariant }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
        <View style={styles.cardsContainer}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </View>
    );
  }

  // ── Error / empty state ───────────────────────────────────────
  if (error || routes.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="map-marker-off"
          title={error || t('common.noResults')}
          message={t('common.retry')}
          actionLabel={t('common.retry')}
          onAction={() => navigation.goBack()}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Map Area */}
      <View style={styles.mapContainer}>
        <TrafficMapView ref={mapRef} style={styles.map}>
          {/* Origin marker */}
          {currentPlan?.origin && (
            <Marker
              coordinate={currentPlan.origin}
              title={currentPlan.originName}
            >
              <MaterialCommunityIcons name="circle" size={16} color={colors.primary} />
            </Marker>
          )}

          {/* Destination marker */}
          {currentPlan?.destination && (
            <Marker
              coordinate={currentPlan.destination}
              title={currentPlan.destinationName}
            >
              <MaterialCommunityIcons name="map-marker" size={28} color={colors.error} />
            </Marker>
          )}

          {/* Route polylines */}
          {routes.map((r, idx) => {
            const coords = (MOCK_ROUTE_COORDS[idx] || MOCK_ROUTE_COORDS[0]).map(
              ([lat, lng]) => ({ latitude: lat, longitude: lng }),
            );
            const isSelected = r.id === selectedRoute?.id;
            return (
              <Polyline
                key={r.id}
                coordinates={coords}
                strokeColor={isSelected ? ROUTE_COLORS[idx] || colors.accent : '#999999'}
                strokeWidth={isSelected ? 6 : 3}
                lineCap="round"
                lineJoin="round"
                zIndex={isSelected ? 10 : 1}
              />
            );
          })}
        </TrafficMapView>
      </View>

      {/* Route Cards (scrollable) */}
      <ScrollView
        style={styles.bottomSheet}
        contentContainerStyle={styles.bottomContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Warnings banner */}
        {hasWarnings && (
          <View style={[styles.warningBanner, { backgroundColor: colors.warning + '20' }]}>
            <MaterialCommunityIcons name="alert-outline" size={18} color={colors.warning} />
            <Text style={[styles.warningText, { color: colors.warning }]}>
              {t('navigation.queueAhead')} - {t('journey.delay')}
            </Text>
          </View>
        )}

        {/* Route option cards */}
        {routes.map((r) => (
          <RouteOptionCard
            key={r.id}
            route={r}
            isSelected={r.id === selectedRoute?.id}
            onPress={() => handleSelectRoute(r)}
          />
        ))}

        {/* Multimodal timeline for selected route */}
        {selectedRoute?.mode === 'multimodal' && selectedRoute.steps.length > 0 && (
          <View style={[styles.timelineSection, { borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('journey.steps')}
            </Text>
            <MultiModalTimeline steps={selectedRoute.steps} />
          </View>
        )}

        {/* Step-by-step (expandable) */}
        {selectedRoute && selectedRoute.steps.length > 0 && (
          <>
            <Pressable
              onPress={toggleSteps}
              style={[styles.stepsToggle, { borderColor: colors.border }]}
            >
              <MaterialCommunityIcons name="format-list-numbered" size={18} color={colors.textSecondary} />
              <Text style={[styles.stepsToggleText, { color: colors.text }]}>
                {t('journey.steps')} ({selectedRoute.steps.length})
              </Text>
              <MaterialCommunityIcons
                name={showSteps ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.textSecondary}
              />
            </Pressable>

            <Animated.View style={{ maxHeight: stepsMaxHeight, overflow: 'hidden' }}>
              <View style={[styles.stepsContainer, { backgroundColor: colors.surface }]}>
                {selectedRoute.steps.map((step, idx) => (
                  <View key={idx} style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepNumber,
                        { backgroundColor: colors.primaryLight },
                      ]}
                    >
                      <Text style={styles.stepNumberText}>{idx + 1}</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={[styles.stepInstruction, { color: colors.text }]}>
                        {step.instruction}
                      </Text>
                      <Text style={[styles.stepMeta, { color: colors.textSecondary }]}>
                        {(step.distance / 1000).toFixed(1)} {t('units.km')} - {Math.round(step.duration / 60)} {t('units.min')}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </Animated.View>
          </>
        )}

        {/* Bottom spacer for button */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Start Navigation Button - Fixed at bottom */}
      <View style={[styles.bottomBar, { backgroundColor: colors.background }]}>
        <Button
          title={t('journey.startNavigation')}
          onPress={handleStartNavigation}
          variant="primary"
          size="lg"
          fullWidth
          icon="navigation-variant"
          disabled={!selectedRoute}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    height: MAP_HEIGHT,
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    height: MAP_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardsContainer: {
    padding: 16,
  },
  bottomSheet: {
    flex: 1,
  },
  bottomContent: {
    padding: 16,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  timelineSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  stepsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    gap: 8,
  },
  stepsToggleText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  stepsContainer: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepInstruction: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  stepMeta: {
    fontSize: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
