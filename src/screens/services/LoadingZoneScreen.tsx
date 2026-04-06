import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Pressable, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker } from '../../utils/MapView';
import { useThemeColors } from '../../theme';
import { Card, SkeletonLoader, EmptyState } from '../../components/common';
import { AccessibleText } from '../../components/common';
import { getLoadingZones } from '../../services/mobilityService';
import { LoadingZone } from '../../types';

const STATUS_COLORS: Record<string, string> = { available: '#22C55E', occupied: '#EF4444', restricted: '#F59E0B' };

export default function LoadingZoneScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [zones, setZones] = useState<LoadingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLoadingZones();
      setZones(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <View style={[styles.container, { backgroundColor: colors.background }]}><SkeletonLoader width="100%" height={300} /></View>;

  if (error) return (
    <View style={[styles.errorCenter, { backgroundColor: colors.background }]}>
      <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.error} />
      <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      <Pressable style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={loadData}>
        <Text style={styles.retryBtnText}>{t('common.retry')}</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MapView style={styles.map} initialRegion={{ latitude: 30.0194, longitude: 31.76, latitudeDelta: 0.02, longitudeDelta: 0.02 }}>
        {zones.map((z) => {
          const lat = (z as any).lat ?? (z as any).location?.latitude ?? 30.02;
          const lng = (z as any).lng ?? (z as any).location?.longitude ?? 31.76;
          return (
            <Marker key={z.id} coordinate={{ latitude: lat, longitude: lng }} title={z.name}>
              <View style={[styles.marker, { backgroundColor: STATUS_COLORS[z.status] || '#9CA3AF' }]}>
                <MaterialCommunityIcons name="truck" size={16} color="#fff" />
              </View>
            </Marker>
          );
        })}
      </MapView>
      <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
        <FlatList
          data={zones}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<EmptyState icon="truck" title={t('common.noResults')} message="" />}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.row}>
                <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[item.status] }]} />
                <View style={styles.content}>
                  <AccessibleText style={[styles.name, { color: colors.text }]}>{item.name}</AccessibleText>
                  <AccessibleText style={[styles.restriction, { color: colors.textSecondary }]}>
                    {item.timeRestriction} | {t('common.max')} {item.maxDurationMin} {t('units.min')}
                  </AccessibleText>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
                  <AccessibleText style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>{t(`services.loading.${item.status}`)}</AccessibleText>
                </View>
              </View>
            </Card>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 0.5 },
  marker: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  sheet: { flex: 0.5, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 },
  card: { marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  content: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600' },
  restriction: { fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600' },
  errorCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorText: { fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  retryBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
