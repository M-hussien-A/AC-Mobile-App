import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../../theme';
import { Card, EmptyState, SkeletonLoader } from '../../../components/common';
import { SeverityBadge } from '../../../components/alerts';
import { AccessibleText } from '../../../components/common';
import { getAlerts } from '../../../services/alertService';
import { Alert as AlertType } from '../../../types';
import { formatRelativeTime } from '../../../utils/helpers';

export default function TransitAlertsScreen() {
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const data = await getAlerts('transit');
      setAlerts(data);
    } finally {
      setLoading(false);
    }
  }

  const isAr = i18n.language === 'ar';

  if (loading) return <View style={[styles.container, { backgroundColor: colors.background }]}>{[1,2,3].map(i => <SkeletonLoader key={i} width="100%" height={80} style={styles.skeleton} />)}</View>;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="bus-alert" title={t('transit.noAlerts')} message={t('transit.noAlertsMsg')} />}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <SeverityBadge severity={item.severity as any} />
              <AccessibleText style={[styles.time, { color: colors.textSecondary }]}>{formatRelativeTime(item.timestamp)}</AccessibleText>
            </View>
            <AccessibleText style={[styles.title, { color: colors.text }]}>{isAr ? item.titleAr : item.title}</AccessibleText>
            <AccessibleText style={[styles.body, { color: colors.textSecondary }]}>{isAr ? item.bodyAr : item.body}</AccessibleText>
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
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  body: { fontSize: 13, lineHeight: 20 },
  time: { fontSize: 11 },
  skeleton: { marginHorizontal: 16, marginTop: 12, borderRadius: 12 },
});
