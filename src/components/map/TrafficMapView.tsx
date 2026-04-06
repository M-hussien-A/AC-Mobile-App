/**
 * TrafficMapView - Themed wrapper around react-native-maps MapView
 *
 * Centers on the New Administrative Capital Government District by default.
 * Supports dark-mode via a custom Google Maps JSON style.
 */

import React, { useRef, useCallback } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region, MapMarkerProps } from '../../utils/MapView';
import { useAppTheme } from '../../theme';

// ── Constants ─────────────────────────────────────────────────

const NAC_GOV_DISTRICT: Region = {
  latitude: 30.0194,
  longitude: 31.76,
  latitudeDelta: 0.03,
  longitudeDelta: 0.03,
};

// ── Dark-mode map style (Google Maps JSON) ────────────────────

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#4b6878' }],
  },
  {
    featureType: 'land_parcel',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64779e' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#283d6a' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6f9ba5' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{ color: '#023e58' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3C7680' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#304a7d' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#98a5be' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1d2c4d' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#2c6675' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#255763' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#b0d5ce' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#98a5be' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1d2c4d' }],
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry.fill',
    stylers: [{ color: '#283d6a' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0e1626' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4e6d70' }],
  },
];

// ── Props ─────────────────────────────────────────────────────

export interface TrafficMapViewProps {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  onMarkerPress?: (event: { nativeEvent: MapMarkerProps['coordinate'] & { id?: string } }) => void;
  initialRegion?: Region;
}

// ── Component ─────────────────────────────────────────────────

const TrafficMapView = React.forwardRef<MapView, TrafficMapViewProps>(
  ({ style, children, onMarkerPress, initialRegion }, ref) => {
    const theme = useAppTheme();
    const mapRef = useRef<MapView | null>(null);

    const setRef = useCallback(
      (instance: MapView | null) => {
        mapRef.current = instance;
        if (typeof ref === 'function') {
          ref(instance);
        } else if (ref) {
          (ref as React.MutableRefObject<MapView | null>).current = instance;
        }
      },
      [ref],
    );

    return (
      <MapView
        ref={setRef}
        provider={PROVIDER_GOOGLE}
        style={[{ flex: 1 }, style]}
        initialRegion={initialRegion ?? NAC_GOV_DISTRICT}
        customMapStyle={theme.isDark ? DARK_MAP_STYLE : undefined}
        showsUserLocation
        showsMyLocationButton
        showsCompass
        showsTraffic={false}
        onMarkerPress={onMarkerPress as any}
        mapPadding={{ top: 0, right: 0, bottom: 60, left: 0 }}
      >
        {children}
      </MapView>
    );
  },
);

TrafficMapView.displayName = 'TrafficMapView';

export default React.memo(TrafficMapView);
