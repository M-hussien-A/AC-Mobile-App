import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../../theme';
import { Card, Button } from '../../../components/common';
import { AccessibleText } from '../../../components/common';
import { PaymentMethodSelector, QRCodeDisplay } from '../../../components/payment';
import { purchaseFare } from '../../../services/transitService';
import { formatCurrency } from '../../../utils/helpers';

const STATIONS = [
  { id: 'S1', name: 'Government District', nameAr: 'الحي الحكومي' },
  { id: 'S2', name: 'Parliament', nameAr: 'مجلس النواب' },
  { id: 'S3', name: 'Central Station', nameAr: 'المحطة المركزية' },
  { id: 'S4', name: 'Embassy District', nameAr: 'حي السفارات' },
  { id: 'S5', name: 'Business District', nameAr: 'حي الأعمال' },
];

export default function TransitFarePaymentScreen() {
  const navigation = useNavigation<any>();
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const [fromStation, setFromStation] = useState(0);
  const [toStation, setToStation] = useState(2);
  const [method, setMethod] = useState('wallet');
  const [loading, setLoading] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [ticket, setTicket] = useState<any>(null);

  const isAr = i18n.language === 'ar';
  const fare = Math.abs(toStation - fromStation) * 5 + 5;

  const handlePurchase = async () => {
    if (fromStation === toStation) {
      Alert.alert(t('common.error'), t('transit.sameStationError') || 'Please select different stations');
      return;
    }
    setLoading(true);
    try {
      const result = await purchaseFare(STATIONS[fromStation].id, STATIONS[toStation].id);
      setTicket(result);
      setShowTicket(true);
    } catch (e) {
      Alert.alert(t('common.error'), (e as Error).message || t('payment.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <AccessibleText style={[styles.sectionTitle, { color: colors.text }]}>{t('transit.fromStation')}</AccessibleText>
          <View style={styles.stationList}>
            {STATIONS.map((s, i) => (
              <Button key={s.id} title={isAr ? s.nameAr : s.name} onPress={() => setFromStation(i)} variant={fromStation === i ? 'primary' : 'secondary'} size="sm" />
            ))}
          </View>
        </Card>

        <Card style={styles.card}>
          <AccessibleText style={[styles.sectionTitle, { color: colors.text }]}>{t('transit.toStation')}</AccessibleText>
          <View style={styles.stationList}>
            {STATIONS.map((s, i) => (
              <Button key={s.id} title={isAr ? s.nameAr : s.name} onPress={() => setToStation(i)} variant={toStation === i ? 'primary' : 'secondary'} size="sm" />
            ))}
          </View>
        </Card>

        <Card style={[styles.card, { backgroundColor: colors.primary + '10' }]}>
          <AccessibleText style={[styles.fareLabel, { color: colors.textSecondary }]}>{t('transit.fare')}</AccessibleText>
          <AccessibleText style={[styles.fareValue, { color: colors.primary }]}>{formatCurrency(fare)}</AccessibleText>
        </Card>

        <Card style={styles.card}>
          <AccessibleText style={[styles.sectionTitle, { color: colors.text }]}>{t('payment.selectMethod')}</AccessibleText>
          <PaymentMethodSelector selectedMethod={method} onSelect={setMethod} />
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button title={t('transit.purchaseTicket')} onPress={handlePurchase} variant="primary" loading={loading} fullWidth icon="ticket" />
      </View>

      <Modal visible={showTicket} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.ticketCard, { backgroundColor: colors.surface }]}>
            <MaterialCommunityIcons name="check-circle" size={50} color="#22C55E" />
            <AccessibleText style={[styles.ticketTitle, { color: colors.text }]}>{t('transit.ticketPurchased')}</AccessibleText>
            <AccessibleText style={[styles.ticketRoute, { color: colors.textSecondary }]}>
              {isAr ? STATIONS[fromStation].nameAr : STATIONS[fromStation].name} → {isAr ? STATIONS[toStation].nameAr : STATIONS[toStation].name}
            </AccessibleText>
            {ticket && <QRCodeDisplay value={ticket.qrCode} size={180} />}
            <AccessibleText style={[styles.validity, { color: colors.textSecondary }]}>{t('transit.validFor2Hours')}</AccessibleText>
            <Button title={t('common.done')} onPress={() => { setShowTicket(false); navigation.goBack(); }} variant="primary" fullWidth />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  card: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  stationList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fareLabel: { fontSize: 14, textAlign: 'center' },
  fareValue: { fontSize: 32, fontWeight: '700', textAlign: 'center', marginTop: 4 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 24 },
  ticketCard: { width: '100%', borderRadius: 24, padding: 24, alignItems: 'center', gap: 12 },
  ticketTitle: { fontSize: 22, fontWeight: '700' },
  ticketRoute: { fontSize: 14 },
  validity: { fontSize: 13 },
});
