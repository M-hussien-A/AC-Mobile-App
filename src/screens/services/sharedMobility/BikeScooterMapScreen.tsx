import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { useThemeColors } from '../../../theme';
import { Card, SkeletonLoader } from '../../../components/common';
import { AccessibleText } from '../../../components/common';
import { getBikeScooterStations } from '../../../services/mobilityService';
import { BikeScooterStation } from '../../../types';
import { formatCurrency } from '../../../utils/helpers';

export default function BikeScooterMapScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [stations, setStations] = useState<BikeScooterStation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const data = await getBikeScooterStations();
      setStations(data);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <View style={[styles.container, { backgroundColor: colors.background }]}><SkeletonLoader width="100%" height={300} /><SkeletonLoader width="100%" height={80} style={{ marginTop: 8 }} /></View>;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MapView style={styles.map} initialRegion={{ latitude: 30.0194, longitude: 31.76, latitudeDelta: 0.02, longitudeDelta: 0.02 }}>
        {stations.map((s) => {
          const lat = (s as any).lat ?? (s as any).location?.latitude ?? 30.02;
          const lng = (s as any).lng ?? (s as any).location?.longitude ?? 31.76;
          return (
            <Marker key={s.id} coordinate={{ latitude: lat, longitude: lng }} title={s.name}>
              <View style={[styles.marker, { backgroundColor: colors.primary }]}>
                <MaterialCommunityIcons name="bicycle" size={16} color="#fff" />
                <AccessibleText style={styles.markerText}>{(s.availableBikes || 0) + (s.availableScooters || 0)}</AccessibleText>
              </View>
            </Marker>
          );
        })}
      </MapView>
      <FlatList
        data={stations}
        keyExtractor={(item) => item.id}
        horizontal
        style={styles.list}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <AccessibleText style={[styles.stationName, { color: colors.text }]}>{item.name}</AccessibleText>
            <View style={styles.counts}>
              <View style={styles.countItem}>
                <MaterialCommunityIcons name="bicycle" size={16} color={colors.primary} />
                <AccessibleText style={{ color: colors.text }}>{item.availableBikes || 0}</AccessibleText>
              </View>
              <View style={styles.countItem}>
                <MaterialCommunityIcons name="scooter" size={16} color={colors.accent} />
                <AccessibleText style={{ color: colors.text }}>{item.availableScooters || 0}</AccessibleText>
              </View>
              <View style={styles.countItem}>
                <MaterialCommunityIcons name="parking" size={16} color={colors.textSecondary} />
                <AccessibleText style={{ color: colors.text }}>{item.totalDocks || 0}</AccessibleText>
              </View>
            </View>
            <AccessibleText style={[styles.price, { color: colors.textSecondary }]}>{formatCurrency(item.pricePerMinEGP || 1)}/{t('units.min')}</AccessibleText>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  marker: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  markerText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  list: { position: 'absolute', bottom: 20, left: 0, right: 0 },
  listContent: { paddingHorizontal: 16, gap: 12 },
  card: { width: 180 },
  stationName: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  counts: { flexDirection: 'row', gap: 12, marginBottom: 6 },
  countItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  price: { fontSize: 12 },
});
