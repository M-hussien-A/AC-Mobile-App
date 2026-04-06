/**
 * TripHistoryScreen - Display past trip history grouped by date.
 */

import React, { useCallback } from 'react';
import { View, SectionList, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme';
import { Card, EmptyState } from '../../components/common';
import { AccessibleText } from '../../components/common';
import { JourneyStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<JourneyStackParamList, 'TripHistory'>;

interface HistoryItem {
  id: string;
  from: string;
  to: string;
  mode: string;
  distanceKm: number;
  durationMin: number;
  time: string;
}

const HISTORY: { title: string; data: HistoryItem[] }[] = [
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

const MODE_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  drive: 'car',
  transit: 'bus',
  walk: 'walk',
  cycle: 'bicycle',
  multimodal: 'swap-horizontal',
};

const MODE_COLORS: Record<string, string> = {
  drive: '#3B82F6',
  transit: '#8B5CF6',
  walk: '#22C55E',
  cycle: '#F59E0B',
  multimodal: '#EC4899',
};

export default function TripHistoryScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const navigation = useNavigation<Nav>();

  const handleReplay = useCallback(
    (item: HistoryItem) => {
      navigation.navigate('JourneyPlanner', {
        destinationName: item.to,
      });
    },
    [navigation],
  );

  const formatSectionDate = useCallback(
    (dateStr: string) => {
      try {
        const date = new Date(dateStr + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffDays = Math.round(
          (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (diffDays === 0) return t('common.today');
        if (diffDays === 1) return t('common.yesterday');
        return dateStr;
      } catch {
        return dateStr;
      }
    },
    [t],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SectionList
        sections={HISTORY}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <AccessibleText
            style={[styles.sectionHeader, { color: colors.textSecondary }]}
          >
            {formatSectionDate(section.title)}
          </AccessibleText>
        )}
        renderItem={({ item }) => {
          const modeColor = MODE_COLORS[item.mode] || colors.primary;
          return (
            <Pressable onPress={() => handleReplay(item)}>
              <Card style={styles.card}>
                <View style={styles.row}>
                  <View
                    style={[styles.iconCircle, { backgroundColor: modeColor + '18' }]}
                  >
                    <MaterialCommunityIcons
                      name={MODE_ICONS[item.mode] || 'car'}
                      size={20}
                      color={modeColor}
                    />
                  </View>
                  <View style={styles.content}>
                    <AccessibleText
                      style={[styles.route, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {item.from} → {item.to}
                    </AccessibleText>
                    <View style={styles.meta}>
                      <View style={styles.metaItem}>
                        <MaterialCommunityIcons
                          name="map-marker-distance"
                          size={13}
                          color={colors.textSecondary}
                        />
                        <AccessibleText
                          style={[styles.metaText, { color: colors.textSecondary }]}
                        >
                          {item.distanceKm} {t('units.km')}
                        </AccessibleText>
                      </View>
                      <View style={styles.metaItem}>
                        <MaterialCommunityIcons
                          name="clock-outline"
                          size={13}
                          color={colors.textSecondary}
                        />
                        <AccessibleText
                          style={[styles.metaText, { color: colors.textSecondary }]}
                        >
                          {item.durationMin} {t('units.min')}
                        </AccessibleText>
                      </View>
                      <View style={styles.metaItem}>
                        <MaterialCommunityIcons
                          name="clock-time-four-outline"
                          size={13}
                          color={colors.textTertiary}
                        />
                        <AccessibleText
                          style={[styles.metaText, { color: colors.textTertiary }]}
                        >
                          {item.time}
                        </AccessibleText>
                      </View>
                    </View>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={colors.textTertiary}
                  />
                </View>
              </Card>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="history"
            title={t('journey.noHistory')}
            message={t('journey.noHistoryMsg')}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: { marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { flex: 1 },
  route: { fontSize: 14, fontWeight: '600' },
  meta: { flexDirection: 'row', gap: 14, marginTop: 6, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12 },
});
