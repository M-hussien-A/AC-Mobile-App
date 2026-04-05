/**
 * ACUD ITS Traveler Mobile App - Transaction History Screen
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../theme';
import { useUserStore } from '../../stores/userStore';
import * as paymentService from '../../services/paymentService';
import { FilterChips } from '../../components/common/FilterChips';
import { EmptyState } from '../../components/common/EmptyState';
import { SkeletonList } from '../../components/common/SkeletonLoader';
import { ProfileStackParamList } from '../../navigation/types';

interface Transaction {
  id: string;
  type: 'parking' | 'transit' | 'fine' | 'topUp';
  description: string;
  descriptionAr: string;
  amountEGP: number;
  date: string;
}

const TRANSACTION_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  parking: 'car',
  transit: 'bus',
  fine: 'alert',
  topUp: 'plus-circle',
};

const FILTER_MAP: Record<string, string | null> = {
  all: null,
  parking: 'parking',
  transit: 'transit',
  fine: 'fine',
  topUp: 'topUp',
};

export default function TransactionHistoryScreen() {
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const transactions = useUserStore((s) => s.transactions);
  const setTransactions = useUserStore((s) => s.setTransactions);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  const filterOptions = useMemo(() => [
    { label: t('transactions.filterAll'), value: 'all' },
    { label: t('transactions.filterParking'), value: 'parking' },
    { label: t('transactions.filterTransit'), value: 'transit' },
    { label: t('transactions.filterFines'), value: 'fine' },
    { label: t('transactions.filterTopUps'), value: 'topUp' },
  ], [t]);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const data = await paymentService.getTransactions();
      setTransactions(data as Transaction[]);
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

  const filteredTransactions = useMemo(() => {
    const typeFilter = FILTER_MAP[filter];
    if (!typeFilter) return transactions;
    return transactions.filter((tx) => tx.type === typeFilter);
  }, [transactions, filter]);

  const sections = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filteredTransactions.forEach((tx) => {
      const dateKey = new Date(tx.date).toLocaleDateString(
        i18n.language === 'ar' ? 'ar-EG' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' },
      );
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(tx);
    });
    return Object.entries(groups).map(([title, data]) => ({ title, data }));
  }, [filteredTransactions, i18n.language]);

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString(
      i18n.language === 'ar' ? 'ar-EG' : 'en-US',
      { hour: '2-digit', minute: '2-digit' },
    );
  };

  const renderItem = ({ item }: { item: Transaction }) => {
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
          <Text style={[styles.txTime, { color: colors.textTertiary }]}>
            {formatTime(item.date)}
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

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        {section.title}
      </Text>
    </View>
  );

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
      {/* Filters */}
      <View style={styles.filterRow}>
        <FilterChips
          options={filterOptions}
          selectedValue={filter}
          onSelect={(v) => setFilter(v as string)}
        />
      </View>

      {isLoading ? (
        <SkeletonList count={8} style={styles.skeletonPad} />
      ) : sections.length === 0 ? (
        <EmptyState
          icon="receipt"
          title={t('transactions.noTransactions')}
          message={t('transactions.noTransactionsMessage')}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 32,
  },
  skeletonPad: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
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
  txTime: {
    fontSize: 12,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
});
