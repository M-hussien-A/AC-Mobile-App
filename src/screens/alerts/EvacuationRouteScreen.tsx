/**
 * ACUD ITS Traveler Mobile App - Evacuation Route Screen
 *
 * Emergency evacuation guidance with map, route polylines,
 * rally point markers, and step-by-step instructions.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import { useThemeColors } from '../../theme';
import { AlertsStackParamList } from '../../navigation/types';
import { getEvacuationPlan } from '../../services/reportService';
import { Button, Card, EmptyState } from '../../components/common';

// ── Types ──────────────────────────────────────────────────────
type Nav = NativeStackNavigationProp<AlertsStackParamList, 'EvacuationRoute'>;

interface EvacRoute {
  id: string;
  name: string;
  nameAr: string;
  coordinates: [number, number][];
}

interface RallyPoint {
  id: string;
  name: string;
  nameAr: string;
  lat: number;
  lng: number;
}

interface Instruction {
  step: number;
  instruction: string;
  instructionAr: string;
}

// ── Constants ──────────────────────────────────────────────────
const ROUTE_COLOR = '#22C55E';
const ROUTE_WIDTH = 6;
const BANNER_BG = '#DC2626';

const STEP_ICONS: Record<number, keyof typeof MaterialCommunityIcons.glyphMap> = {
  1: 'exit-run',
  2: 'sign-direction',
  3: 'map-marker-check',
  4: 'account-clock',
};

// ── Component ──────────────────────────────────────────────────
export default function EvacuationRouteScreen() {
  const navigation = useNavigation<Nav>();
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const isAr = i18n.language === 'ar';
  const mapRef = useRef<MapView>(null);

  // State
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState<EvacRoute[]>([]);
  const [rallyPoints, setRallyPoints] = useState<RallyPoint[]>([]);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [hasEmergency, setHasEmergency] = useState(true);

  // Pulse animation for emergency banner
  const pulseOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseOpacity, {
          toValue: 0.5,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseOpacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseOpacity]);

  // ── Load Data ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const plan = await getEvacuationPlan();
        if (cancelled) return;
        setRoutes(plan.routes);
        setRallyPoints(plan.rallyPoints);
        setInstructions(plan.instructions);
        setHasEmergency(true);
      } catch {
        if (!cancelled) setHasEmergency(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Map Region ─────────────────────────────────────────────
  const initialRegion: Region = useMemo(() => {
    if (routes.length === 0) {
      return {
        latitude: 30.0194,
        longitude: 31.76,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      };
    }
    // Fit all route coordinates
    const allCoords = routes.flatMap((r) => r.coordinates);
    const lats = allCoords.map((c) => c[0]);
    const lngs = allCoords.map((c) => c[1]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat) * 1.4 + 0.005,
      longitudeDelta: (maxLng - minLng) * 1.4 + 0.005,
    };
  }, [routes]);

  // ── Navigate to Nearest Rally Point ────────────────────────
  const handleNavigateToRally = useCallback(() => {
    if (rallyPoints.length === 0) return;
    // Use first rally point as nearest (mock)
    const rp = rallyPoints[0];
    const url = Platform.select({
      ios: `maps:0,0?daddr=${rp.lat},${rp.lng}`,
      android: `google.navigation:q=${rp.lat},${rp.lng}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${rp.lat},${rp.lng}`,
    });
    if (url) {
      Linking.openURL(url).catch(() => {
        // Fallback: do nothing
      });
    }
  }, [rallyPoints]);

  // ── Loading State ──────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          {t('alerts.evacuation.loading', 'Loading evacuation plan...')}
        </Text>
      </View>
    );
  }

  if (!hasEmergency || (routes.length === 0 && rallyPoints.length === 0)) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <MaterialCommunityIcons name="information" size={20} color="#92400E" />
          <Text style={styles.warningText}>
            {t('alerts.evacuation.noEmergency', 'No active evacuation emergency at this time.')}
          </Text>
        </View>
        <EmptyState
          icon="shield-check"
          title={t('alerts.evacuation.allClear.title', 'All Clear')}
          message={t(
            'alerts.evacuation.allClear.message',
            'There are no active evacuation orders. This screen will activate during emergencies.',
          )}
          actionLabel={t('alerts.evacuation.goBack', 'Go Back')}
          onAction={() => navigation.goBack()}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Emergency Info Banner */}
      <Animated.View style={[styles.emergencyBanner, { opacity: pulseOpacity }]}>
        <MaterialCommunityIcons name="alarm-light" size={20} color="#FFFFFF" />
        <Text style={styles.emergencyBannerText}>
          {t('alerts.evacuation.active', 'EMERGENCY EVACUATION ACTIVE')}
        </Text>
        <MaterialCommunityIcons name="alarm-light" size={20} color="#FFFFFF" />
      </Animated.View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton
        >
          {/* Evacuation Route Polylines */}
          {routes.map((route) => (
            <Polyline
              key={route.id}
              coordinates={route.coordinates.map(([lat, lng]) => ({
                latitude: lat,
                longitude: lng,
              }))}
              strokeColor={ROUTE_COLOR}
              strokeWidth={ROUTE_WIDTH}
              lineCap="round"
              lineJoin="round"
            />
          ))}

          {/* Rally Point Markers */}
          {rallyPoints.map((rp) => (
            <Marker
              key={rp.id}
              coordinate={{ latitude: rp.lat, longitude: rp.lng }}
              title={isAr ? rp.nameAr : rp.name}
              pinColor="#22C55E"
            >
              <View style={styles.rallyMarker}>
                <MaterialCommunityIcons name="flag-variant" size={24} color="#FFFFFF" />
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Map Legend */}
        <View style={[styles.legend, { backgroundColor: colors.surface + 'E6' }]}>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: ROUTE_COLOR }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>
              {t('alerts.evacuation.legend.route', 'Evacuation Route')}
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendRallyIcon}>
              <MaterialCommunityIcons name="flag-variant" size={12} color="#FFFFFF" />
            </View>
            <Text style={[styles.legendText, { color: colors.text }]}>
              {t('alerts.evacuation.legend.rally', 'Rally Point')}
            </Text>
          </View>
        </View>
      </View>

      {/* Instructions */}
      <ScrollView
        style={styles.instructionsContainer}
        contentContainerStyle={styles.instructionsContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.instructionsTitle, { color: colors.text }]}>
          {t('alerts.evacuation.instructions', 'Evacuation Instructions')}
        </Text>

        {instructions.map((inst) => {
          const icon = STEP_ICONS[inst.step] ?? 'numeric';
          const text = isAr ? inst.instructionAr : inst.instruction;
          return (
            <View key={inst.step} style={styles.stepRow}>
              <View style={[styles.stepCircle, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumber}>{inst.step}</Text>
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepIconRow}>
                  <MaterialCommunityIcons
                    name={icon}
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={[styles.stepText, { color: colors.text }]}>
                    {text}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* Rally Points List */}
        <Text style={[styles.rallyTitle, { color: colors.text }]}>
          {t('alerts.evacuation.rallyPoints', 'Rally Points')}
        </Text>
        {rallyPoints.map((rp) => (
          <Card key={rp.id} style={styles.rallyCard}>
            <View style={styles.rallyCardRow}>
              <View style={styles.rallyCardIcon}>
                <MaterialCommunityIcons name="flag-variant" size={20} color="#22C55E" />
              </View>
              <View style={styles.rallyCardText}>
                <Text style={[styles.rallyCardName, { color: colors.text }]}>
                  {isAr ? rp.nameAr : rp.name}
                </Text>
                <Text style={[styles.rallyCardCoords, { color: colors.textTertiary }]}>
                  {rp.lat.toFixed(4)}° N, {rp.lng.toFixed(4)}° E
                </Text>
              </View>
            </View>
          </Card>
        ))}

        {/* Navigate Button */}
        <Button
          title={t('alerts.evacuation.navigate', 'Navigate to Nearest Rally Point')}
          onPress={handleNavigateToRally}
          variant="primary"
          size="lg"
          fullWidth
          icon="navigation-variant"
          style={styles.navigateButton}
          accessibilityLabel={t('alerts.evacuation.navigate', 'Navigate to Nearest Rally Point')}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Emergency Banner
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: BANNER_BG,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  emergencyBannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Warning Banner (no emergency)
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  warningText: {
    flex: 1,
    color: '#92400E',
    fontSize: 13,
    fontWeight: '600',
  },

  // Map
  mapContainer: {
    height: '45%',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  legend: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendLine: {
    width: 20,
    height: 4,
    borderRadius: 2,
  },
  legendRallyIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Rally Point Marker
  rallyMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },

  // Instructions
  instructionsContainer: {
    flex: 1,
  },
  instructionsContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
  },
  stepIconRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },

  // Rally Points List
  rallyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 12,
  },
  rallyCard: {
    marginBottom: 10,
  },
  rallyCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rallyCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#22C55E18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rallyCardText: {
    flex: 1,
  },
  rallyCardName: {
    fontSize: 15,
    fontWeight: '600',
  },
  rallyCardCoords: {
    fontSize: 12,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },

  // Navigate Button
  navigateButton: {
    marginTop: 20,
  },
  bottomSpacer: {
    height: 32,
  },
});
