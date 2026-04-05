/**
 * Cross-platform MapView wrapper.
 * On native, re-exports from react-native-maps.
 * On web, provides lightweight stubs so the app renders without crashing.
 */
import React from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';

// ── Web stubs ────────────────────────────────────────────────
function MapViewWeb(props: any) {
  const { style, children } = props;
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>Map View</Text>
      {children}
    </View>
  );
}

const Noop: React.FC<any> = ({ children }) => (children ? <>{children}</> : null);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { color: '#6b7280', fontSize: 16, fontWeight: '600' },
});

const PROVIDER_GOOGLE_STUB = 'google';

// Type stubs so imports like `Region` and `MapMarkerProps` don't break on web
export type Region = { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };
export type MapMarkerProps = any;

// ── Exports (platform-dependent) ────────────────────────────
let MapView: React.ComponentType<any>;
let Marker: React.ComponentType<any>;
let Polyline: React.ComponentType<any>;
let Polygon: React.ComponentType<any>;
let Circle: React.ComponentType<any>;
let Callout: React.ComponentType<any>;
let PROVIDER_GOOGLE: string;

if (Platform.OS === 'web') {
  MapView = MapViewWeb;
  Marker = Noop;
  Polyline = Noop;
  Polygon = Noop;
  Circle = Noop;
  Callout = Noop;
  PROVIDER_GOOGLE = PROVIDER_GOOGLE_STUB;
} else {
  /* eslint-disable @typescript-eslint/no-var-requires */
  const RNMaps = require('react-native-maps');
  MapView = RNMaps.default;
  Marker = RNMaps.Marker;
  Polyline = RNMaps.Polyline;
  Polygon = RNMaps.Polygon;
  Circle = RNMaps.Circle;
  Callout = RNMaps.Callout;
  PROVIDER_GOOGLE = RNMaps.PROVIDER_GOOGLE;
}

export default MapView;
export { Marker, Polyline, Polygon, Circle, Callout, PROVIDER_GOOGLE };
