import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme';
import { Card, Button, EmptyState, SkeletonLoader } from '../../components/common';
import { AccessibleText } from '../../components/common';
import { getSavedRoutes } from '../../services/journeyService';
import { formatRelativeTime } from '../../utils/helpers';

export default function SavedRoutesScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const navigation = useNavigation<any>();
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await getSavedRoutes();
      setRoutes(data);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = (id: string) => {
    Alert.alert(t('common.confirm'), t('journey.deleteRouteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => setRoutes(r => r.filter(x => x.id !== id)) },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {[1,2,3].map(i => <SkeletonLoader key={i} width="100%" height={100} style={styles.skeleton} />)}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={routes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="map-marker-path" title={t('journey.noSavedRoutes')} message={t('journey.noSavedRoutesMsg')} />}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <MaterialCommunityIcons name="star" size={24} color={colors.accent} />
              <View style={styles.content}>
                <AccessibleText style={[styles.name, { color: colors.text }]}>{item.name}</AccessibleText>
                <AccessibleText style={[styles.route, { color: colors.textSecondary }]}>
                  {item.from?.name} → {item.to?.name}
                </AccessibleText>
                <View style={styles.meta}>
                  <AccessibleText style={[styles.time, { color: colors.textSecondary }]}>
                    ~{item.estimatedTimeMin} {t('units.min')}
                  </AccessibleText>
                  {item.lastUsed && (
                    <AccessibleText style={[styles.lastUsed, { color: colors.textSecondary }]}>
                      {formatRelativeTime(item.lastUsed)}
                    </AccessibleText>
                  )}
                </View>
              </View>
              <View style={styles.actions}>
                <Button title={t('journey.go')} onPress={() => navigation.navigate('Navigation', { routeId: item.id })} variant="primary" size="sm" />
                <MaterialCommunityIcons name="delete-outline" size={20} color="#EF4444" onPress={() => handleDelete(item.id)} style={styles.deleteBtn} />
              </View>
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, gap: 12 },
  card: {},
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  content: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700' },
  route: { fontSize: 13, marginTop: 4 },
  meta: { flexDirection: 'row', gap: 12, marginTop: 4 },
  time: { fontSize: 12 },
  lastUsed: { fontSize: 12 },
  actions: { alignItems: 'center', gap: 8 },
  deleteBtn: { padding: 4 },
  skeleton: { marginHorizontal: 16, marginTop: 12, borderRadius: 12 },
});
