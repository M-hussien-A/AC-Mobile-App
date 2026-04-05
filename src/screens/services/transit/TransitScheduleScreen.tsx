import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../../theme';
import { Card, Button } from '../../../components/common';
import { AccessibleText } from '../../../components/common';
import { RouteLineDiagram } from '../../../components/transit';
import { TransitAlertBanner } from '../../../components/transit';
import { getRouteById } from '../../../services/transitService';
import { TransitRoute } from '../../../types';

export default function TransitScheduleScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const [transitRoute, setTransitRoute] = useState<TransitRoute | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const data = await getRouteById(route.params?.routeId);
      if (data) setTransitRoute(data);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /></View>;
  if (!transitRoute) return <View style={[styles.center, { backgroundColor: colors.background }]}><AccessibleText>{t('common.noResults')}</AccessibleText></View>;

  const isAr = i18n.language === 'ar';
  const lineColor = (transitRoute as any).color || colors.primary;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderLeftColor: lineColor, borderLeftWidth: 4 }]}>
        <AccessibleText style={[styles.routeName, { color: colors.text }]}>{isAr ? transitRoute.nameAr : transitRoute.name}</AccessibleText>
        <AccessibleText style={[styles.routeInfo, { color: colors.textSecondary }]}>
          {t('transit.frequency')}: {typeof transitRoute.frequency === 'number' ? `${transitRoute.frequency} ${t('units.min')}` : transitRoute.frequency}
        </AccessibleText>
        <AccessibleText style={[styles.routeInfo, { color: colors.textSecondary }]}>
          {t('transit.operatingHours')}: {transitRoute.operatingHours}
        </AccessibleText>
      </View>

      <TransitAlertBanner message={t('transit.serviceNormal')} severity="info" />

      <Card style={styles.card}>
        <AccessibleText style={[styles.sectionTitle, { color: colors.text }]}>{t('transit.stations')}</AccessibleText>
        <RouteLineDiagram stations={transitRoute.stations} lineColor={lineColor} onStationPress={() => {}} />
      </Card>

      <View style={styles.footer}>
        <Button
          title={t('transit.buyTicket')}
          onPress={() => navigation.navigate('TransitFarePayment', { routeId: transitRoute.id })}
          variant="primary"
          fullWidth
          icon="ticket"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 16, marginHorizontal: 16, marginTop: 8 },
  routeName: { fontSize: 22, fontWeight: '700' },
  routeInfo: { fontSize: 14, marginTop: 4 },
  card: { marginHorizontal: 16, marginTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  footer: { padding: 16 },
});
