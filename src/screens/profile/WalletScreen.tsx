/**
 * ACUD ITS Traveler Mobile App - Wallet Screen
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../theme';
import { useUserStore } from '../../stores/userStore';
import * as paymentService from '../../services/paymentService';
import { WalletBalance } from '../../components/payment/WalletBalance';
import { PaymentMethodSelector, PaymentMethodOption } from '../../components/payment/PaymentMethodSelector';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { SkeletonList } from '../../components/common/SkeletonLoader';
import { ProfileStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'Wallet'>;

interface Transaction {
  id: string;
  type: 'parking' | 'transit' | 'fine' | 'topUp';
  description: string;
  descriptionAr: string;
  amountEGP: number;
  date: string;
}

const TOP_UP_PRESETS = [100, 200, 500, 1000];

const TRANSACTION_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  parking: 'car',
  transit: 'bus',
  fine: 'alert',
  topUp: 'plus-circle',
};

export default function WalletScreen() {
  const navigation = useNavigation<Nav>();
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const transactions = useUserStore((s) => s.transactions);
  const setTransactions = useUserStore((s) => s.setTransactions);

  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodOption>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [bal, txns] = await Promise.all([
        paymentService.getWalletBalance(),
        paymentService.getTransactions(),
      ]);
      setBalance(bal);
      setTransactions(txns as Transaction[]);
    } catch (err: any) {
      setError(err?.message ?? t('common.error'));
    } finally {
      setIsLoading(false);
    }
  }, [t, setTransactions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleTopUp = useCallback(async () => {
    const amount = selectedAmount ?? parseInt(customAmount, 10);
    if (!amount || amount <= 0) return;

    setIsProcessing(true);
    try {
      const result = await paymentService.topUpWallet(amount, 'card');
      setBalance(result.newBalance);
      setShowTopUp(false);
      setSelectedAmount(null);
      setCustomAmount('');
      Alert.alert(t('wallet.topUpSuccess'), `+${amount} ${t('payment.wallet.currency')}`);
      await loadData();
    } catch (err: any) {
      Alert.alert(t('common.error'), err?.message ?? t('common.error'));
    } finally {
      setIsProcessing(false);
    }
  }, [selectedAmount, customAmount, t, loadData]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const recentTransactions = transactions.slice(0, 5);

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isPositive = item.amountEGP > 0;
    const icon = TRANSACTION_ICONS[item.type] ?? 'cash';
    const desc = i18n.language === 'ar' ? item.descriptionAr : item.description;

    return (
      <View style={[styles.txRow, { borderBottomColor: colors.divider }]}>
        <View style={[styles.txIcon, { backgroundColor: colors.surfaceVariant }]}>
          <MaterialCommunityIcons name={icon} size={20} color={colors.icon} />
        </View>
        <View style={styles.txInfo}>
          <Text style={[styles.txDesc, { color: colors.text }]} numberOfLines={1}>
            {desc}
          </Text>
          <Text style={[styles.txDate, { color: colors.textTertiary }]}>
            {formatDate(item.date)}
          </Text>
        </View>
        <Text
          style={[
            styles.txAmount,
            { color: isPositive ? colors.success : colors.error },
          ]}
        >
          {isPositive ? '+' : ''}{item.amountEGP.toLocaleString()} {t('payment.wallet.currency')}
        </Text>
      </View>
    );
  };

  if (error && !isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="alert-circle-outline"
          title={t('common.error')}
          message={error}
          actionLabel={t('common.retry')}
          onAction={loadData}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Balance Card */}
        <View style={styles.balanceSection}>
          <WalletBalance balance={balance} />
        </View>

        {/* Top Up Button */}
        <View style={styles.topUpSection}>
          <Button
            title={t('wallet.topUp')}
            icon="plus"
            onPress={() => setShowTopUp(true)}
            fullWidth
          />
        </View>

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('wallet.recentTransactions')}
          </Text>
        </View>

        {isLoading ? (
          <SkeletonList count={4} style={styles.skeletonPad} />
        ) : recentTransactions.length === 0 ? (
          <EmptyState
            icon="receipt"
            title={t('wallet.noTransactions')}
            message={t('wallet.noTransactionsMessage')}
          />
        ) : (
          <>
            {recentTransactions.map((tx) => (
              <View key={tx.id}>{renderTransaction({ item: tx })}</View>
            ))}
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => navigation.navigate('TransactionHistory')}
            >
              <Text style={[styles.viewAllText, { color: colors.primary }]}>
                {t('wallet.viewAll')}
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color={colors.primary} />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Top Up Modal */}
      <Modal visible={showTopUp} animationType="slide" transparent onRequestClose={() => setShowTopUp(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t('wallet.topUpTitle')}
              </Text>
              <TouchableOpacity onPress={() => setShowTopUp(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.icon} />
              </TouchableOpacity>
            </View>

            {/* Preset Amounts */}
            <View style={styles.presetRow}>
              {TOP_UP_PRESETS.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor:
                        selectedAmount === amount ? colors.primary : colors.surfaceVariant,
                      borderColor:
                        selectedAmount === amount ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => {
                    setSelectedAmount(amount);
                    setCustomAmount('');
                  }}
                >
                  <Text
                    style={[
                      styles.presetText,
                      {
                        color: selectedAmount === amount ? '#FFFFFF' : colors.text,
                      },
                    ]}
                  >
                    {amount} {t('payment.wallet.currency')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Payment Method */}
            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
              {t('wallet.selectPaymentMethod')}
            </Text>
            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onSelect={setPaymentMethod}
            />

            {/* Confirm */}
            <View style={styles.modalActions}>
              <Button
                title={`${t('wallet.confirmTopUp')} - ${selectedAmount ?? 0} ${t('payment.wallet.currency')}`}
                onPress={handleTopUp}
                loading={isProcessing}
                disabled={!selectedAmount && !customAmount}
                fullWidth
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  balanceSection: {
    padding: 20,
  },
  topUpSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  skeletonPad: {
    paddingHorizontal: 20,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  txDesc: {
    fontSize: 14,
    fontWeight: '500',
  },
  txDate: {
    fontSize: 12,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  presetChip: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  presetText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  modalActions: {
    marginTop: 24,
  },
});
