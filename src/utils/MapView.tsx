/**
 * Cross-platform MapView wrapper.
 * On native, re-exports from react-native-maps.
 * On web, renders an interactive Google Maps iframe showing the Government District.
 */
import React from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';

// ── NAC Government District center ───────────────────────────
const DEFAULT_CENTER = { latitude: 30.0194, longitude: 31.76 };
const DEFAULT_ZOOM = 15;

// ── Web MapView using Google Maps embed ──────────────────────
function MapViewWeb(props: any) {
  const { style, children, initialRegion, region } = props;
  const r = region ?? initialRegion;
  const lat = r?.latitude ?? DEFAULT_CENTER.latitude;
  const lng = r?.longitude ?? DEFAULT_CENTER.longitude;
  const zoom = r?.latitudeDelta ? Math.round(Math.log2(360 / (r.latitudeDelta || 0.03))) : DEFAULT_ZOOM;

  const mapSrc = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d${3000}!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2seg!4v1`;

  return (
    <View style={[styles.container, style]}>
      {Platform.OS === 'web' ? (
        <iframe
          src={mapSrc}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: 'inherit',
          } as any}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Map"
        />
      ) : (
        <Text style={styles.label}>Map View</Text>
      )}
      {children && (
        <View style={styles.childrenOverlay} pointerEvents="box-none">
          {children}
        </View>
      )}
    </View>
  );
}

const Noop: React.FC<any> = ({ children }) => (children ? <>{children}</> : null);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  label: { color: '#6b7280', fontSize: 16, fontWeight: '600' },
  childrenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
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
