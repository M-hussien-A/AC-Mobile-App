import React from 'react';
import { View, SectionList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme';
import { Card, EmptyState } from '../../components/common';
import { AccessibleText } from '../../components/common';

const HISTORY = [
  {
    title: '2026-04-05',
    data: [
      { id: '1', from: 'Government Quarter', to: 'NAC Commercial Center', mode: 'drive', distanceKm: 8.5, durationMin: 18, time: '08:30' },
      { id: '2', from: 'NAC Commercial Center', to: 'R5 District', mode: 'transit', distanceKm: 12, durationMin: 25, time: '17:00' },
    ],
  },
  {
    title: '2026-04-04',
    data: [
      { id: '3', from: 'R5 District', to: 'Government Quarter', mode: 'drive', distanceKm: 8.5, durationMin: 20, time: '07:45' },
      { id: '4', from: 'Government Quarter', to: 'Embassy District', mode: 'walk', distanceKm: 1.2, durationMin: 15, time: '12:30' },
    ],
  },
  {
    title: '2026-04-03',
    data: [
      { id: '5', from: 'R5 District', to: 'Government Quarter', mode: 'multimodal', distanceKm: 9, durationMin: 35, time: '08:00' },
    ],
  },
];

const MODE_ICONS: Record<string, string> = { drive: 'car', transit: 'bus', walk: 'walk', cycle: 'bicycle', multimodal: 'swap-horizontal' };

export default function TripHistoryScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SectionList
        sections={HISTORY}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderSectionHeader={({ section }) => (
          <AccessibleText style={[styles.sectionHeader, { color: colors.textSecondary }]}>{section.title}</AccessibleText>
        )}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
                <MaterialCommunityIcons name={(MODE_ICONS[item.mode] || 'car') as any} size={20} color={colors.primary} />
              </View>
              <View style={styles.content}>
                <AccessibleText style={[styles.route, { color: colors.text }]}>{item.from} → {item.to}</AccessibleText>
                <View style={styles.meta}>
                  <AccessibleText style={[styles.metaText, { color: colors.textSecondary }]}>{item.distanceKm} {t('units.km')}</AccessibleText>
                  <AccessibleText style={[styles.metaText, { color: colors.textSecondary }]}>{item.durationMin} {t('units.min')}</AccessibleText>
                  <AccessibleText style={[styles.metaText, { color: colors.textSecondary }]}>{item.time}</AccessibleText>
                </View>
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={<EmptyState icon="history" title={t('journey.noHistory')} message={t('journey.noHistoryMsg')} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  sectionHeader: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  card: { marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1 },
  route: { fontSize: 14, fontWeight: '600' },
  meta: { flexDirection: 'row', gap: 12, marginTop: 4 },
  metaText: { fontSize: 12 },
});
