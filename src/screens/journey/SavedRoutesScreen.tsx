/**
 * SavedRoutesScreen - Display saved/favorite routes with quick navigation action.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme';
import { Card, Button, EmptyState, SkeletonLoader } from '../../components/common';
import { AccessibleText } from '../../components/common';
import { JourneyStackParamList } from '../../navigation/types';
import { useJourneyStore } from '../../stores/journeyStore';
import { getSavedRoutes } from '../../services/journeyService';
import { planTrip } from '../../services/journeyService';
import { formatRelativeTime } from '../../utils/helpers';
import { SavedRoute } from '../../types';

type Nav = NativeStackNavigationProp<JourneyStackParamList, 'SavedRoutes'>;

export default function SavedRoutesScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const navigation = useNavigation<Nav>();
  const setCurrentPlan = useJourneyStore((s) => s.setCurrentPlan);
  const startNavigation = useJourneyStore((s) => s.startNavigation);

  const [routes, setRoutes] = useState<(SavedRoute & { _estimatedTimeMin?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const data = await getSavedRoutes();
      setRoutes(data as any[]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert(t('common.confirm'), t('journey.deleteRouteConfirm'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => setRoutes((r) => r.filter((x) => x.id !== id)),
        },
      ]);
    },
    [t],
  );

  const handleNavigate = useCallback(
    async (item: SavedRoute & { _estimatedTimeMin?: number }) => {
      setNavigatingId(item.id);
      try {
        const from = {
          lat: item.origin.latitude,
          lng: item.origin.longitude,
          name: item.originName,
        };
        const to = {
          lat: item.destination.latitude,
          lng: item.destination.longitude,
          name: item.destinationName,
        };
        const plan = await planTrip(from, to, item.preferredMode);
        setCurrentPlan(plan);
        if (plan.routes.length > 0) {
          startNavigation(plan.routes[0]);
          navigation.navigate('Navigation', { routeId: plan.routes[0].id });
        } else {
          navigation.navigate('RouteResults', { planId: plan.id });
        }
      } catch {
        Alert.alert(t('common.error'), t('common.retry'));
      } finally {
        setNavigatingId(null);
      }
    },
    [navigation, setCurrentPlan, startNavigation, t],
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {[1, 2, 3].map((i) => (
          <SkeletonLoader
            key={i}
            width="100%"
            height={100}
            style={styles.skeleton}
          />
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={routes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="map-marker-path"
            title={t('journey.noSavedRoutes')}
            message={t('journey.noSavedRoutesMsg')}
          />
        }
        renderItem={({ item }) => {
          const estimatedMin = (item as any)._estimatedTimeMin;
          return (
            <Card style={styles.card}>
              <View style={styles.row}>
                <View style={[styles.iconCircle, { backgroundColor: colors.accent + '20' }]}>
                  <MaterialCommunityIcons
                    name="star"
                    size={22}
                    color={colors.accent}
                  />
                </View>
                <View style={styles.content}>
                  <AccessibleText style={[styles.name, { color: colors.text }]}>
                    {item.name}
                  </AccessibleText>
                  <AccessibleText
                    style={[styles.route, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {item.originName} → {item.destinationName}
                  </AccessibleText>
                  <View style={styles.meta}>
                    {estimatedMin != null && (
                      <View style={styles.metaChip}>
                        <MaterialCommunityIcons
                          name="clock-outline"
                          size={13}
                          color={colors.textSecondary}
                        />
                        <AccessibleText
                          style={[styles.time, { color: colors.textSecondary }]}
                        >
                          ~{estimatedMin} {t('units.min')}
                        </AccessibleText>
                      </View>
                    )}
                    {item.lastUsed && (
                      <AccessibleText
                        style={[styles.lastUsed, { color: colors.textTertiary }]}
                      >
                        {formatRelativeTime(item.lastUsed)}
                      </AccessibleText>
                    )}
                  </View>
                </View>
                <View style={styles.actions}>
                  <Button
                    title={t('journey.go')}
                    onPress={() => handleNavigate(item)}
                    variant="primary"
                    size="sm"
                    icon="navigation-variant"
                    loading={navigatingId === item.id}
                    disabled={navigatingId !== null}
                  />
                  <Pressable
                    onPress={() => handleDelete(item.id)}
                    style={styles.deleteBtn}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={t('common.delete')}
                  >
                    <MaterialCommunityIcons
                      name="delete-outline"
                      size={20}
                      color={colors.error}
                    />
                  </Pressable>
                </View>
              </View>
            </Card>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, gap: 12 },
  card: {},
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700' },
  route: { fontSize: 13, marginTop: 4 },
  meta: { flexDirection: 'row', gap: 12, marginTop: 6, alignItems: 'center' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  time: { fontSize: 12 },
  lastUsed: { fontSize: 12 },
  actions: { alignItems: 'center', gap: 10 },
  deleteBtn: { padding: 6 },
  skeleton: { marginHorizontal: 16, marginTop: 12, borderRadius: 12 },
});
