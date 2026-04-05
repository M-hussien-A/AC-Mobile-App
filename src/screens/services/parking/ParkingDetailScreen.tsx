import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../../theme';
import { Card, Button } from '../../../components/common';
import { AccessibleText } from '../../../components/common';
import { AvailabilityGauge } from '../../../components/parking';
import { getParkingById } from '../../../services/parkingService';
import { ParkingFacility } from '../../../types';
import { formatCurrency } from '../../../utils/helpers';

export default function ParkingDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const [facility, setFacility] = useState<ParkingFacility | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await getParkingById(route.params?.facilityId);
      if (data) setFacility(data);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /></View>;
  if (!facility) return <View style={[styles.center, { backgroundColor: colors.background }]}><AccessibleText>{t('common.noResults')}</AccessibleText></View>;

  const isAr = i18n.language === 'ar';
  const name = isAr ? (facility as any).nameAr || facility.name : facility.name;
  const ratePerHour = (facility as any).ratePerHour ?? (facility as any).pricePerHourEGP ?? 10;
  const ratePerDay = (facility as any).ratePerDay ?? (facility as any).pricePerDayEGP ?? ratePerHour * 5;
  const isFull = facility.availableSpaces === 0;
  const amenities = (facility as any).amenities ?? (facility as any).features ?? [];

  const FEATURE_ICONS: Record<string, { icon: string; label: string }> = {
    ev_charging: { icon: 'ev-station', label: t('parking.features.evCharging') },
    'ev-charging': { icon: 'ev-station', label: t('parking.features.evCharging') },
    disabled_access: { icon: 'wheelchair-accessibility', label: t('parking.features.disabledAccess') },
    'handicap-accessible': { icon: 'wheelchair-accessibility', label: t('parking.features.disabledAccess') },
    cctv: { icon: 'cctv', label: t('parking.features.cctv') },
    covered: { icon: 'garage', label: t('parking.features.covered') },
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={styles.card}>
        <AccessibleText style={[styles.name, { color: colors.text }]}>{name}</AccessibleText>
        <View style={[styles.typeBadge, { backgroundColor: colors.primary + '20' }]}>
          <AccessibleText style={[styles.typeText, { color: colors.primary }]}>{t(`parking.type.${facility.type}`)}</AccessibleText>
        </View>
      </Card>

      <Card style={styles.card}>
        <AccessibleText style={[styles.sectionTitle, { color: colors.text }]}>{t('parking.availability')}</AccessibleText>
        <AvailabilityGauge available={facility.availableSpaces} total={facility.totalSpaces} />
      </Card>

      <Card style={styles.card}>
        <AccessibleText style={[styles.sectionTitle, { color: colors.text }]}>{t('parking.pricing')}</AccessibleText>
        <View style={styles.priceRow}>
          <AccessibleText style={[styles.priceLabel, { color: colors.textSecondary }]}>{t('parking.perHour')}</AccessibleText>
          <AccessibleText style={[styles.priceValue, { color: colors.text }]}>{formatCurrency(ratePerHour)}</AccessibleText>
        </View>
        <View style={styles.priceRow}>
          <AccessibleText style={[styles.priceLabel, { color: colors.textSecondary }]}>{t('parking.perDay')}</AccessibleText>
          <AccessibleText style={[styles.priceValue, { color: colors.text }]}>{formatCurrency(ratePerDay)}</AccessibleText>
        </View>
      </Card>

      <Card style={styles.card}>
        <AccessibleText style={[styles.sectionTitle, { color: colors.text }]}>{t('parking.featuresTitle')}</AccessibleText>
        <View style={styles.features}>
          {amenities.map((f: string) => {
            const feat = FEATURE_ICONS[f];
            if (!feat) return null;
            return (
              <View key={f} style={[styles.featureChip, { backgroundColor: colors.primary + '15' }]}>
                <MaterialCommunityIcons name={feat.icon as any} size={16} color={colors.primary} />
                <AccessibleText style={[styles.featureText, { color: colors.primary }]}>{feat.label}</AccessibleText>
              </View>
            );
          })}
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.row}>
          <MaterialCommunityIcons name="clock-outline" size={18} color={colors.textSecondary} />
          <AccessibleText style={[styles.hours, { color: colors.text }]}>
            {t('parking.operatingHours')}: {facility.operatingHours}
          </AccessibleText>
        </View>
      </Card>

      <View style={styles.buttons}>
        <Button
          title={t('parking.reserve')}
          onPress={() => navigation.navigate('ParkingReservation', { facilityId: facility.id })}
          variant="primary"
          disabled={isFull}
          fullWidth
          icon="calendar-check"
        />
        <Button
          title={t('parking.navigateHere')}
          onPress={() => navigation.navigate('JourneyTab')}
          variant="secondary"
          fullWidth
          icon="navigation"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { marginHorizontal: 16, marginBottom: 12 },
  name: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  typeText: { fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB' },
  priceLabel: { fontSize: 14 },
  priceValue: { fontSize: 16, fontWeight: '700' },
  features: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  featureChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  featureText: { fontSize: 12, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hours: { fontSize: 14 },
  buttons: { padding: 16, gap: 12 },
});
