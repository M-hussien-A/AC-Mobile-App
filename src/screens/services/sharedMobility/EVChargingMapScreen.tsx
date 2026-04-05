import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { useThemeColors } from '../../../theme';
import { Card, Button, SkeletonLoader } from '../../../components/common';
import { AccessibleText } from '../../../components/common';
import { getEVChargingStations } from '../../../services/mobilityService';
import { EVChargingStation } from '../../../types';
import { formatCurrency } from '../../../utils/helpers';

const STATUS_COLORS: Record<string, string> = { available: '#22C55E', occupied: '#EF4444', offline: '#9CA3AF' };

export default function EVChargingMapScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [stations, setStations] = useState<EVChargingStation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const data = await getEVChargingStations();
      setStations(data);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <View style={[styles.container, { backgroundColor: colors.background }]}><SkeletonLoader width="100%" height={300} /></View>;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MapView style={styles.map} initialRegion={{ latitude: 30.0194, longitude: 31.76, latitudeDelta: 0.02, longitudeDelta: 0.02 }}>
        {stations.map((s) => {
          const lat = (s as any).lat ?? (s as any).location?.latitude ?? 30.02;
          const lng = (s as any).lng ?? (s as any).location?.longitude ?? 31.76;
          const statusColor = STATUS_COLORS[s.status] || '#9CA3AF';
          return (
            <Marker key={s.id} coordinate={{ latitude: lat, longitude: lng }} title={s.name}>
              <View style={[styles.marker, { backgroundColor: statusColor }]}>
                <MaterialCommunityIcons name="ev-station" size={18} color="#fff" />
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
            <View style={styles.row}>
              <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[item.status] }]} />
              <AccessibleText style={[styles.stationName, { color: colors.text }]}>{item.name}</AccessibleText>
            </View>
            <AccessibleText style={[styles.detail, { color: colors.textSecondary }]}>
              {(item.connectorTypes || []).join(', ')} | {item.powerKW || 0} kW
            </AccessibleText>
            <AccessibleText style={[styles.detail, { color: colors.textSecondary }]}>
              {formatCurrency(item.pricePerKWhEGP || 3)}/kWh
            </AccessibleText>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
              <AccessibleText style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>{t(`mobility.ev.${item.status}`)}</AccessibleText>
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  marker: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  list: { position: 'absolute', bottom: 20, left: 0, right: 0 },
  listContent: { paddingHorizontal: 16, gap: 12 },
  card: { width: 200 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  stationName: { fontSize: 14, fontWeight: '600', flex: 1 },
  detail: { fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginTop: 8 },
  statusText: { fontSize: 11, fontWeight: '600' },
});
