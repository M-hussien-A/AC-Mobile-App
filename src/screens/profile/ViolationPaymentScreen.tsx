/**
 * ACUD ITS Traveler Mobile App - Violation Payment Screen
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../theme';
import { useUserStore } from '../../stores/userStore';
import * as violationService from '../../services/violationService';
import { PaymentMethodSelector, PaymentMethodOption } from '../../components/payment/PaymentMethodSelector';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { ProfileStackParamList } from '../../navigation/types';
import { Violation } from '../../types';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ViolationPayment'>;
type RouteParams = RouteProp<ProfileStackParamList, 'ViolationPayment'>;

export default function ViolationPaymentScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteParams>();
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const violations = useUserStore((s) => s.violations);

  const { violationId } = route.params;

  const [violation, setViolation] = useState<Violation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodOption>('wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  const loadViolation = useCallback(async () => {
    try {
      setError(null);
      // First check store
      const stored = violations.find((v) => v.id === violationId);
      if (stored) {
        setViolation(stored);
        setIsLoading(false);
        return;
      }
      // Otherwise fetch
      const data = await violationService.getViolationById(violationId);
      if (data) {
        setViolation(data);
      } else {
        setError(t('common.noResults'));
      }
    } catch (err: any) {
      setError(err?.message ?? t('common.error'));
    } finally {
      setIsLoading(false);
    }
  }, [violationId, violations, t]);

  useEffect(() => {
    loadViolation();
  }, [loadViolation]);

  const handlePay = useCallback(async () => {
    if (!violation) return;
    setIsProcessing(true);
    try {
      const result = await violationService.payViolation(violation.id, paymentMethod);
      if (result.success) {
        setTransactionId(result.transactionId);
        setPaymentSuccess(true);
      }
    } catch (err: any) {
      setError(err?.message ?? t('common.error'));
    } finally {
      setIsProcessing(false);
    }
  }, [violation, paymentMethod, t]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      i18n.language === 'ar' ? 'ar-EG' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' },
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !violation) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="alert-circle-outline"
          title={t('common.error')}
          message={error ?? t('common.noResults')}
          actionLabel={t('common.retry')}
          onAction={loadViolation}
        />
      </View>
    );
  }

  // Success state
  if (paymentSuccess) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <View style={[styles.successCircle, { backgroundColor: colors.success + '20' }]}>
          <MaterialCommunityIcons name="check-circle" size={64} color={colors.success} />
        </View>
        <Text style={[styles.successTitle, { color: colors.text }]}>
          {t('violationPayment.successTitle')}
        </Text>
        <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
          {t('violationPayment.successMessage')}
        </Text>
        <Card style={styles.txIdCard}>
          <Text style={[styles.txIdLabel, { color: colors.textSecondary }]}>
            {t('violationPayment.transactionId')}
          </Text>
          <Text style={[styles.txIdValue, { color: colors.text }]}>{transactionId}</Text>
        </Card>
        <Button
          title={t('violationPayment.done')}
          onPress={() => navigation.goBack()}
          fullWidth
          style={styles.doneBtn}
        />
      </View>
    );
  }

  const desc = i18n.language === 'ar' ? violation.typeAr : violation.type;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <Text style={[styles.heading, { color: colors.text }]}>
          {t('violationPayment.summary')}
        </Text>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              {t('violations.detail')}
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{desc}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              {t('violations.issuedAt')}
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatDate(violation.issuedAt)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              {t('violations.location')}
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {violation.locationName}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              {t('violations.fineAmount')}
            </Text>
            <Text style={[styles.amountValue, { color: colors.error }]}>
              {violation.fineAmount.toLocaleString()} {t('payment.wallet.currency')}
            </Text>
          </View>
        </Card>

        {/* Evidence placeholder */}
        <View style={[styles.evidencePlaceholder, { backgroundColor: colors.surfaceVariant }]}>
          <MaterialCommunityIcons name="camera" size={40} color={colors.textTertiary} />
          <Text style={[styles.evidenceText, { color: colors.textTertiary }]}>
            {t('violations.evidence')}
          </Text>
        </View>

        {/* Payment Method */}
        <Text style={[styles.heading, { color: colors.text }]}>
          {t('violationPayment.selectMethod')}
        </Text>
        <PaymentMethodSelector
          selectedMethod={paymentMethod}
          onSelect={setPaymentMethod}
        />

        {/* Pay Button */}
        <Button
          title={`${t('violationPayment.payFine')} - ${violation.fineAmount.toLocaleString()} ${t('payment.wallet.currency')}`}
          onPress={handlePay}
          loading={isProcessing}
          fullWidth
          style={styles.payBtn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 16,
  },
  summaryCard: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  evidencePlaceholder: {
    height: 140,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  evidenceText: {
    fontSize: 14,
    marginTop: 8,
  },
  payBtn: {
    marginTop: 32,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
  },
  txIdCard: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  txIdLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  txIdValue: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  doneBtn: {
    width: '100%',
  },
});
