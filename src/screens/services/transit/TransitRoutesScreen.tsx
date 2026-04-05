import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Pressable, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../../theme';
import { Card, FilterChips, SearchBar, SkeletonLoader, EmptyState } from '../../../components/common';
import { AccessibleText } from '../../../components/common';
import { getTransitRoutes } from '../../../services/transitService';
import { TransitRoute } from '../../../types';

const MODE_ICONS: Record<string, string> = { metro: 'train', tram: 'tram', bus: 'bus', lrt: 'train', monorail: 'tram' };
const MODES = ['all', 'metro', 'tram', 'bus'];

export default function TransitRoutesScreen() {
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const navigation = useNavigation<any>();
  const [routes, setRoutes] = useState<TransitRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState('all');
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTransitRoutes();
      setRoutes(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const isAr = i18n.language === 'ar';
  const filtered = routes.filter(r => {
    const modeMatch = selectedMode === 'all' || r.mode === selectedMode;
    const searchMatch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || (r as any).shortName?.includes(search);
    return modeMatch && searchMatch;
  });

  const modeOptions = MODES.map(m => ({ label: t(`transit.modes.${m}`), value: m }));

  if (loading) return <View style={[styles.container, { backgroundColor: colors.background }]}>{[1,2,3,4].map(i => <SkeletonLoader key={i} width="100%" height={80} style={styles.skeleton} />)}</View>;

  if (error) return (
    <View style={[styles.errorCenter, { backgroundColor: colors.background }]}>
      <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.error} />
      <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      <Pressable style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={loadData}>
        <Text style={styles.retryText}>{t('common.retry')}</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SearchBar value={search} onChangeText={setSearch} placeholder={t('transit.searchRoutes')} />
      <FilterChips options={modeOptions} selectedValue={selectedMode} onSelect={setSelectedMode} />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="bus" title={t('common.noResults')} message={t('transit.noRoutes')} />}
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => navigation.navigate('TransitSchedule', { routeId: item.id })}>
            <View style={styles.row}>
              <View style={[styles.routeBadge, { backgroundColor: (item as any).color || colors.primary }]}>
                <MaterialCommunityIcons name={(MODE_ICONS[item.mode] || 'bus') as any} size={20} color="#fff" />
                <AccessibleText style={styles.routeNumber}>{(item as any).shortName || item.id}</AccessibleText>
              </View>
              <View style={styles.content}>
                <AccessibleText style={[styles.routeName, { color: colors.text }]}>{isAr ? item.nameAr : item.name}</AccessibleText>
                <View style={styles.meta}>
                  <AccessibleText style={[styles.metaText, { color: colors.textSecondary }]}>
                    {t('transit.frequency')}: {typeof item.frequency === 'number' ? `${item.frequency} ${t('units.min')}` : item.frequency}
                  </AccessibleText>
                  <AccessibleText style={[styles.metaText, { color: colors.textSecondary }]}>
                    {item.stations?.length || 0} {t('transit.stations')}
                  </AccessibleText>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, gap: 8 },
  card: {},
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  routeBadge: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  routeNumber: { color: '#fff', fontSize: 10, fontWeight: '700', marginTop: 2 },
  content: { flex: 1 },
  routeName: { fontSize: 15, fontWeight: '600' },
  meta: { flexDirection: 'row', gap: 12, marginTop: 4 },
  metaText: { fontSize: 12 },
  skeleton: { marginHorizontal: 16, marginTop: 12, borderRadius: 12 },
  errorCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorText: { fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
