import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Modal, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../../theme';
import { Card, Button } from '../../../components/common';
import { AccessibleText } from '../../../components/common';
import { PaymentMethodSelector, QRCodeDisplay } from '../../../components/payment';
import { processPayment } from '../../../services/paymentService';
import { formatCurrency } from '../../../utils/helpers';

export default function ParkingPaymentScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [method, setMethod] = useState<string>('wallet');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const amount = route.params?.amount ?? 30;

  const handlePay = async () => {
    setLoading(true);
    try {
      const result = await processPayment(amount, method as any, 'Parking');
      setQrCode(result.qrCode);
      setShowSuccess(true);
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
          <AccessibleText style={[styles.amountLabel, { color: colors.textSecondary }]}>{t('payment.amount')}</AccessibleText>
          <AccessibleText style={[styles.amount, { color: colors.primary }]}>{formatCurrency(amount)}</AccessibleText>
        </Card>

        <Card style={styles.card}>
          <AccessibleText style={[styles.sectionTitle, { color: colors.text }]}>{t('payment.selectMethod')}</AccessibleText>
          <PaymentMethodSelector selectedMethod={method} onSelect={setMethod} />
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button title={`${t('payment.confirm')} - ${formatCurrency(amount)}`} onPress={handlePay} variant="primary" loading={loading} fullWidth icon="check-circle" />
      </View>

      <Modal visible={showSuccess} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.successCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.successIcon, { backgroundColor: '#22C55E20' }]}>
              <MaterialCommunityIcons name="check-circle" size={60} color="#22C55E" />
            </View>
            <AccessibleText style={[styles.successTitle, { color: colors.text }]}>{t('payment.success')}</AccessibleText>
            <AccessibleText style={[styles.successMsg, { color: colors.textSecondary }]}>{t('parking.payment.qrMessage')}</AccessibleText>
            <QRCodeDisplay value={qrCode} size={180} />
            <View style={styles.successButtons}>
              <Button title={t('parking.session.viewSession')} onPress={() => { setShowSuccess(false); navigation.navigate('ParkingSession', { sessionId: 'SESSION-001' }); }} variant="primary" fullWidth />
              <Button title={t('common.done')} onPress={() => { setShowSuccess(false); navigation.goBack(); }} variant="secondary" fullWidth />
            </View>
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
  amountLabel: { fontSize: 14, textAlign: 'center' },
  amount: { fontSize: 36, fontWeight: '700', textAlign: 'center', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 24 },
  successCard: { width: '100%', borderRadius: 24, padding: 24, alignItems: 'center' },
  successIcon: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  successMsg: { fontSize: 14, textAlign: 'center', marginBottom: 20 },
  successButtons: { width: '100%', gap: 12, marginTop: 20 },
});
