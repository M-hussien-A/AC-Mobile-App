/**
 * WalletBalance - Large balance display with gradient background
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../theme';

export interface WalletBalanceProps {
  balance: number;
}

export function WalletBalance({ balance }: WalletBalanceProps) {
  const theme = useAppTheme();
  const { t } = useTranslation();

  const formattedBalance = balance.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.brand.primary }]}>
      {/* Decorative overlay for gradient-like effect */}
      <View style={[styles.overlay, { backgroundColor: theme.brand.primaryDark }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="wallet" size={24} color="#FFFFFF" />
          <Text style={styles.label}>{t('payment.wallet.balance')}</Text>
        </View>

        <View style={styles.amountRow}>
          <Text style={styles.amount}>{formattedBalance}</Text>
          <Text style={styles.currency}>{t('payment.wallet.currency')}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
    borderTopLeftRadius: 16,
    borderBottomRightRadius: 16,
    transform: [{ skewX: '-20deg' }, { translateX: 60 }],
  },
  content: {
    padding: 24,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    fontWeight: '500',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  amount: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
  },
  currency: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default WalletBalance;
