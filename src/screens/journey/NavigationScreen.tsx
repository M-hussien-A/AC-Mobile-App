/**
 * NavigationScreen - Full-screen turn-by-turn navigation with mock GPS simulation.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Modal,
  StatusBar,
  Platform,
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
import { NavigationBar } from '../../components/journey/NavigationBar';
import { SpeedDisplay } from '../../components/traffic/SpeedDisplay';
import TrafficMapView from '../../components/map/TrafficMapView';
import { RouteStepManeuver } from '../../types';

type Nav = NativeStackNavigationProp<JourneyStackParamList, 'Navigation'>;
type ScreenRoute = RouteProp<JourneyStackParamList, 'Navigation'>;

// ── Mock route polyline points ──���───────────────────────────────
const MOCK_ROUTE_POINTS = [
  { latitude: 30.022, longitude: 31.758 },
  { latitude: 30.0215, longitude: 31.7585 },
  { latitude: 30.021, longitude: 31.759 },
  { latitude: 30.0205, longitude: 31.7595 },
  { latitude: 30.020, longitude: 31.760 },
  { latitude: 30.0195, longitude: 31.7605 },
  { latitude: 30.019, longitude: 31.761 },
  { latitude: 30.0195, longitude: 31.762 },
  { latitude: 30.020, longitude: 31.763 },
  { latitude: 30.021, longitude: 31.7635 },
  { latitude: 30.022, longitude: 31.764 },
  { latitude: 30.023, longitude: 31.7645 },
  { latitude: 30.024, longitude: 31.765 },
  { latitude: 30.025, longitude: 31.765 },
];

// ── Mock navigation instructions ───────────��────────────────────
const MOCK_STEPS = [
  { instruction: 'Head east on Government Boulevard', distance: '500 m', maneuver: 'depart' as RouteStepManeuver, distanceM: 500 },
  { instruction: 'Turn right onto Central Avenue', distance: '300 m', maneuver: 'turn_right' as RouteStepManeuver, distanceM: 300 },
  { instruction: 'Continue straight past the park', distance: '600 m', maneuver: 'straight' as RouteStepManeuver, distanceM: 600 },
  { instruction: 'Turn left onto Knowledge City Road', distance: '400 m', maneuver: 'turn_left' as RouteStepManeuver, distanceM: 400 },
  { instruction: 'Merge onto Ring Road', distance: '800 m', maneuver: 'merge' as RouteStepManeuver, distanceM: 800 },
  { instruction: 'Take exit towards NAC Central Park', distance: '200 m', maneuver: 'exit' as RouteStepManeuver, distanceM: 200 },
  { instruction: 'Arrive at destination', distance: '0 m', maneuver: 'arrive' as RouteStepManeuver, distanceM: 0 },
];

// ── Alert types ─────────────────────────────────────────────────
type AlertType = 'queue' | 'speed_camera' | 'incident';

interface NavAlert {
  type: AlertType;
  message: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
}

const MANEUVER_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  depart: 'flag-checkered',
  arrive: 'map-marker-check',
  turn_left: 'arrow-left-bold',
  turn_right: 'arrow-right-bold',
  straight: 'arrow-up-bold',
  merge: 'call-merge',
  exit: 'exit-run',
};

export default function NavigationScreen() {
  const navigation = useNavigation<Nav>();
  const screenRoute = useRoute<ScreenRoute>();
  const { t } = useTranslation();
  const colors = useThemeColors();

  const selectedRoute = useJourneyStore((s) => s.selectedRoute);
  const stopNavigation = useJourneyStore((s) => s.stopNavigation);
  const currentStepIndex = useJourneyStore((s) => s.currentStepIndex);
  const nextStep = useJourneyStore((s) => s.nextStep);

  // ── State ─────────────────────────────────────────────────────
  const [positionIndex, setPositionIndex] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(60);
  const [speedLimit] = useState(80);
  const [activeAlerts, setActiveAlerts] = useState<NavAlert[]>([]);
  const [showRerouteModal, setShowRerouteModal] = useState(false);
  const [etaMinutes, setEtaMinutes] = useState(12);
  const [distanceRemaining, setDistanceRemaining] = useState(3.2);
  const [stepIndex, setStepIndex] = useState(0);

  const mapRef = useRef<MapView>(null);
  const alertOpacity = useRef(new Animated.Value(0)).current;

  const currentPosition = MOCK_ROUTE_POINTS[positionIndex] || MOCK_ROUTE_POINTS[0];
  const currentMockStep = MOCK_STEPS[stepIndex] || MOCK_STEPS[0];

  // ── Mock GPS movement ─────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setPositionIndex((prev) => {
        const next = prev + 1;
        if (next >= MOCK_ROUTE_POINTS.length) {
          clearInterval(interval);
          return prev;
        }
        return next;
      });

      // Simulate speed variance
      setCurrentSpeed(55 + Math.random() * 30);

      // Update ETA and distance
      setEtaMinutes((prev) => Math.max(0, prev - 0.3));
      setDistanceRemaining((prev) => Math.max(0, prev - 0.15));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // ── Step advancement ───────���──────────────────────────────────
  useEffect(() => {
    // Advance step roughly based on position
    const stepThresholds = [0, 2, 4, 6, 8, 10, 12];
    const newStepIndex = stepThresholds.findIndex(
      (threshold, idx) =>
        positionIndex >= threshold &&
        (idx === stepThresholds.length - 1 || positionIndex < stepThresholds[idx + 1]),
    );
    if (newStepIndex >= 0 && newStepIndex !== stepIndex) {
      setStepIndex(newStepIndex);
    }
  }, [positionIndex, stepIndex]);

  // ── Center map on position ──────────────��─────────────────────
  useEffect(() => {
    if (mapRef.current && currentPosition) {
      mapRef.current.animateToRegion(
        {
          latitude: currentPosition.latitude,
          longitude: currentPosition.longitude,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        },
        500,
      );
    }
  }, [currentPosition]);

  // ── Mock alerts ───────────────────────────────────────��───────
  useEffect(() => {
    // Queue warning at position 3
    if (positionIndex === 3) {
      showAlert({
        type: 'queue',
        message: t('navigation.queueAhead'),
        icon: 'car-brake-alert',
        color: '#F39C12',
      });
    }
    // Speed camera at position 6
    if (positionIndex === 6) {
      showAlert({
        type: 'speed_camera',
        message: t('navigation.speedCameraAhead'),
        icon: 'camera',
        color: '#E67E22',
      });
    }
    // Incident at position 9
    if (positionIndex === 9) {
      showAlert({
        type: 'incident',
        message: t('navigation.incidentAhead'),
        icon: 'alert-circle',
        color: '#E74C3C',
      });
    }
  }, [positionIndex, t]);

  // ── Reroute prompt after 10 seconds ───────────���───────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowRerouteModal(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  // ── Show alert animation ───────────���──────────────────────────
  const showAlert = useCallback(
    (alert: NavAlert) => {
      setActiveAlerts([alert]);
      Animated.sequence([
        Animated.timing(alertOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(alertOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setActiveAlerts([]));
    },
    [alertOpacity],
  );

  // ── End navigation ──────────────���─────────────────────���───────
  const handleEndNavigation = useCallback(() => {
    stopNavigation();
    navigation.goBack();
  }, [stopNavigation, navigation]);

  // ── Accept reroute ─────────────────────���─────────────────���────
  const handleAcceptReroute = useCallback(() => {
    setShowRerouteModal(false);
    setEtaMinutes((prev) => Math.max(0, prev - 5));
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Full screen map */}
      <TrafficMapView ref={mapRef} style={StyleSheet.absoluteFillObject}>
        {/* Route polyline */}
        <Polyline
          coordinates={MOCK_ROUTE_POINTS}
          strokeColor={colors.primary}
          strokeWidth={6}
          lineCap="round"
          lineJoin="round"
        />

        {/* Travelled portion (dimmed) */}
        {positionIndex > 0 && (
          <Polyline
            coordinates={MOCK_ROUTE_POINTS.slice(0, positionIndex + 1)}
            strokeColor="#999999"
            strokeWidth={6}
            lineCap="round"
            lineJoin="round"
            zIndex={2}
          />
        )}

        {/* User position marker */}
        <Marker coordinate={currentPosition} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.userMarker}>
            <View style={styles.userMarkerInner} />
          </View>
        </Marker>

        {/* Destination marker */}
        <Marker
          coordinate={MOCK_ROUTE_POINTS[MOCK_ROUTE_POINTS.length - 1]}
          anchor={{ x: 0.5, y: 1 }}
        >
          <MaterialCommunityIcons name="map-marker" size={36} color={colors.error} />
        </Marker>
      </TrafficMapView>

      {/* Navigation instruction bar (top overlay) */}
      <View style={styles.topOverlay}>
        <NavigationBar
          instruction={currentMockStep.instruction}
          distance={currentMockStep.distance}
          duration={`${Math.round(etaMinutes)} ${t('units.min')}`}
          nextTurnIcon={MANEUVER_ICONS[currentMockStep.maneuver] || 'arrow-up-bold'}
        />
      </View>

      {/* Alert overlays */}
      {activeAlerts.length > 0 && (
        <Animated.View style={[styles.alertOverlay, { opacity: alertOpacity }]}>
          {activeAlerts.map((alert, idx) => (
            <View
              key={idx}
              style={[styles.alertBanner, { backgroundColor: alert.color }]}
            >
              <MaterialCommunityIcons name={alert.icon} size={22} color="#FFFFFF" />
              <Text style={styles.alertText}>{alert.message}</Text>
            </View>
          ))}
        </Animated.View>
      )}

      {/* Speed indicator (bottom-left) */}
      <View style={styles.speedContainer}>
        <SpeedDisplay currentSpeed={Math.round(currentSpeed)} speedLimit={speedLimit} />
      </View>

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.surface }]}>
        <View style={styles.bottomStats}>
          <View style={styles.bottomStat}>
            <MaterialCommunityIcons name="map-marker-distance" size={18} color={colors.textSecondary} />
            <Text style={[styles.bottomStatValue, { color: colors.text }]}>
              {distanceRemaining.toFixed(1)} {t('units.km')}
            </Text>
          </View>
          <View style={styles.bottomStat}>
            <MaterialCommunityIcons name="clock-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.bottomStatValue, { color: colors.text }]}>
              {Math.round(etaMinutes)} {t('units.min')}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={handleEndNavigation}
          style={[styles.endButton, { backgroundColor: colors.error }]}
          accessibilityRole="button"
          accessibilityLabel={t('navigation.endNavigation')}
        >
          <MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
          <Text style={styles.endButtonText}>{t('navigation.endNavigation')}</Text>
        </Pressable>
      </View>

      {/* Reroute Modal */}
      <Modal
        visible={showRerouteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRerouteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.rerouteModal, { backgroundColor: colors.surface }]}>
            <View style={styles.rerouteHeader}>
              <MaterialCommunityIcons name="swap-horizontal" size={28} color={colors.primary} />
              <Text style={[styles.rerouteTitle, { color: colors.text }]}>
                {t('navigation.reroute')}
              </Text>
            </View>
            <Text style={[styles.rerouteMessage, { color: colors.textSecondary }]}>
              Faster route available - save 5 min?
            </Text>
            <View style={styles.rerouteButtons}>
              <Button
                title={t('common.cancel')}
                onPress={() => setShowRerouteModal(false)}
                variant="secondary"
                size="md"
                style={styles.rerouteButton}
              />
              <Button
                title={t('common.confirm')}
                onPress={handleAcceptReroute}
                variant="primary"
                size="md"
                style={styles.rerouteButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  alertOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 160 : 140,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  alertText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  speedContainer: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    zIndex: 10,
  },
  userMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(66, 133, 244, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4285F4',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomStats: {
    flexDirection: 'row',
    gap: 20,
  },
  bottomStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bottomStatValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 6,
  },
  endButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  rerouteModal: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  rerouteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  rerouteTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  rerouteMessage: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  rerouteButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  rerouteButton: {
    flex: 1,
  },
});
