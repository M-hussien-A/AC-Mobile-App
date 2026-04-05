import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../../theme';
import { Card, Button } from '../../../components/common';
import { AccessibleText } from '../../../components/common';
import { reserveParking } from '../../../services/parkingService';
import { useUserStore } from '../../../stores/userStore';
import { formatCurrency } from '../../../utils/helpers';

const DURATION_OPTIONS = [1, 2, 4, 8];

export default function ParkingReservationScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const profile = useUserStore((s) => s.profile);
  const [duration, setDuration] = useState(2);
  const [selectedVehicle, setSelectedVehicle] = useState(0);
  const [loading, setLoading] = useState(false);
  const ratePerHour = 15;
  const totalPrice = ratePerHour * duration;
  const vehicles = profile?.savedVehicles ?? [{ plate: 'ABC 1234', make: 'Toyota', model: 'Camry' }];

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const result = await reserveParking(route.params?.facilityId, new Date().toISOString(), duration, vehicles[selectedVehicle].plate);
      navigation.navigate('ParkingPayment', { reservationId: result.reservationId, amount: result.amount });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={styles.card}>
        <AccessibleText style={[styles.sectionTitle, { color: colors.text }]}>{t('parking.reservation.selectTime')}</AccessibleText>
        <AccessibleText style={[styles.label, { color: colors.textSecondary }]}>{t('parking.reservation.startTime')}</AccessibleText>
        <View style={[styles.timeBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="clock-outline" size={20} color={colors.primary} />
          <AccessibleText style={[styles.timeText, { color: colors.text }]}>{new Date().toLocaleTimeString('en-EG', { hour: '2-digit', minute: '2-digit' })}</AccessibleText>
        </View>
      </Card>

      <Card style={styles.card}>
        <AccessibleText style={[styles.sectionTitle, { color: colors.text }]}>{t('parking.reservation.duration')}</AccessibleText>
        <View style={styles.durationGrid}>
          {DURATION_OPTIONS.map((d) => (
            <Button
              key={d}
              title={`${d}${t('units.hours')}`}
              onPress={() => setDuration(d)}
              variant={duration === d ? 'primary' : 'secondary'}
              size="sm"
            />
          ))}
        </View>
      </Card>

      <Card style={styles.card}>
        <AccessibleText style={[styles.sectionTitle, { color: colors.text }]}>{t('parking.reservation.selectVehicle')}</AccessibleText>
        {vehicles.map((v, idx) => (
          <Button
            key={v.plate}
            title={`${v.plate} - ${v.make} ${v.model}`}
            onPress={() => setSelectedVehicle(idx)}
            variant={selectedVehicle === idx ? 'primary' : 'secondary'}
            icon="car"
            fullWidth
          />
        ))}
      </Card>

      <Card style={[styles.card, { backgroundColor: colors.primary + '10' }]}>
        <AccessibleText style={[styles.sectionTitle, { color: colors.text }]}>{t('parking.reservation.priceSummary')}</AccessibleText>
        <View style={styles.priceRow}>
          <AccessibleText style={{ color: colors.textSecondary }}>{t('parking.perHour')}</AccessibleText>
          <AccessibleText style={{ color: colors.text }}>{formatCurrency(ratePerHour)}</AccessibleText>
        </View>
        <View style={styles.priceRow}>
          <AccessibleText style={{ color: colors.textSecondary }}>{t('parking.reservation.duration')}</AccessibleText>
          <AccessibleText style={{ color: colors.text }}>{duration} {t('units.hours')}</AccessibleText>
        </View>
        <View style={[styles.priceRow, styles.totalRow]}>
          <AccessibleText style={[styles.totalLabel, { color: colors.text }]}>{t('common.total')}</AccessibleText>
          <AccessibleText style={[styles.totalValue, { color: colors.primary }]}>{formatCurrency(totalPrice)}</AccessibleText>
        </View>
      </Card>

      <View style={styles.buttonContainer}>
        <Button title={t('parking.reservation.confirmPay')} onPress={handleConfirm} variant="primary" loading={loading} fullWidth icon="check-circle" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { marginHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  label: { fontSize: 13, marginBottom: 6 },
  timeBox: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, borderWidth: 1 },
  timeText: { fontSize: 16, fontWeight: '600' },
  durationGrid: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  totalRow: { borderTopWidth: 1, borderTopColor: '#E5E7EB', marginTop: 8, paddingTop: 12 },
  totalLabel: { fontSize: 16, fontWeight: '700' },
  totalValue: { fontSize: 20, fontWeight: '700' },
  buttonContainer: { padding: 16 },
});
