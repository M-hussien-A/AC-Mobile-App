/**
 * ACUD ITS Traveler Mobile App - Violation History Screen
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../theme';
import { useUserStore } from '../../stores/userStore';
import * as violationService from '../../services/violationService';
import { FilterChips } from '../../components/common/FilterChips';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import { ProfileStackParamList } from '../../navigation/types';
import { Violation, ViolationStatus } from '../../types';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ViolationHistory'>;

const VIOLATION_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  redLight: 'traffic-light',
  speed: 'speedometer',
  wrongDirection: 'swap-horizontal',
  laneViolation: 'road-variant',
  illegalParking: 'car-off',
};

const STATUS_COLORS: Record<ViolationStatus, string> = {
  pending: '#F59E0B',
  paid: '#10B981',
  disputed: '#3B82F6',
  overdue: '#EF4444',
  cancelled: '#9CA3AF',
};

export default function ViolationHistoryScreen() {
  const navigation = useNavigation<Nav>();
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const violations = useUserStore((s) => s.violations);
  const setViolations = useUserStore((s) => s.setViolations);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);

  const filterOptions = useMemo(() => [
    { label: t('violations.statusAll'), value: 'all' },
    { label: t('violations.status.pending'), value: 'pending' },
    { label: t('violations.status.paid'), value: 'paid' },
    { label: t('violations.status.disputed'), value: 'disputed' },
    { label: t('violations.status.overdue'), value: 'overdue' },
  ], [t]);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const data = await violationService.getViolations();
      setViolations(data);
    } catch (err: any) {
      setError(err?.message ?? t('common.error'));
    } finally {
      setIsLoading(false);
    }
  }, [t, setViolations]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const filteredViolations = useMemo(() => {
    if (filter === 'all') return violations;
    return violations.filter((v) => v.status === filter);
  }, [violations, filter]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      i18n.language === 'ar' ? 'ar-EG' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' },
    );
  };

  const getViolationIcon = (type: string): keyof typeof MaterialCommunityIcons.glyphMap => {
    return VIOLATION_ICONS[type] ?? 'alert-circle';
  };

  const renderViolation = ({ item }: { item: Violation }) => {
    const statusColor = STATUS_COLORS[item.status] ?? colors.textSecondary;
    const desc = i18n.language === 'ar' ? item.typeAr : item.type;
    const canPay = item.status === 'pending' || item.status === 'overdue';

    return (
      <Card
        style={styles.violationCard}
        onPress={() => setSelectedViolation(item)}
        accessibilityLabel={desc}
      >
        <View style={styles.cardTop}>
          <View style={[styles.typeIcon, { backgroundColor: statusColor + '20' }]}>
            <MaterialCommunityIcons
              name={getViolationIcon(item.type)}
              size={24}
              color={statusColor}
            />
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.violationType, { color: colors.text }]}>
              {desc}
            </Text>
            <Text style={[styles.violationDate, { color: colors.textSecondary }]}>
              {formatDate(item.issuedAt)} - {item.locationName}
            </Text>
            <Text style={[styles.violationPlate, { color: colors.textTertiary }]}>
              {item.vehiclePlateNumber}
            </Text>
          </View>
        </View>

        <View style={styles.cardBottom}>
          <Text style={[styles.fineAmount, { color: colors.text }]}>
            {item.fineAmount.toLocaleString()} {t('payment.wallet.currency')}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {t(`violations.status.${item.status}`)}
            </Text>
          </View>
        </View>

        {canPay && (
          <Button
            title={t('violations.payNow')}
            onPress={() => navigation.navigate('ViolationPayment', { violationId: item.id })}
            size="sm"
            style={styles.payBtn}
          />
        )}
      </Card>
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
      {/* Filters */}
      <View style={styles.filterRow}>
        <FilterChips
          options={filterOptions}
          selectedValue={filter}
          onSelect={(v) => setFilter(v as string)}
        />
      </View>

      {isLoading ? (
        <View style={styles.skeletonPad}>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} style={styles.skeletonCardSpacing} />
          ))}
        </View>
      ) : filteredViolations.length === 0 ? (
        <EmptyState
          icon="check-circle-outline"
          title={t('violations.noViolations')}
          message={t('violations.noViolationsMessage')}
        />
      ) : (
        <FlatList
          data={filteredViolations}
          keyExtractor={(item) => item.id}
          renderItem={renderViolation}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        />
      )}

      {/* Detail Modal */}
      <Modal visible={!!selectedViolation} animationType="slide" transparent onRequestClose={() => setSelectedViolation(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {t('violations.detail')}
                </Text>
                <TouchableOpacity onPress={() => setSelectedViolation(null)}>
                  <MaterialCommunityIcons name="close" size={24} color={colors.icon} />
                </TouchableOpacity>
              </View>

              {selectedViolation && (
                <>
                  {/* Evidence placeholder */}
                  <View style={[styles.evidencePlaceholder, { backgroundColor: colors.surfaceVariant }]}>
                    <MaterialCommunityIcons name="camera" size={48} color={colors.textTertiary} />
                    <Text style={[styles.evidenceText, { color: colors.textTertiary }]}>
                      {t('violations.evidence')}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      {t('violations.location')}
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {selectedViolation.locationName}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      {t('violations.vehicle')}
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {selectedViolation.vehiclePlateNumber}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      {t('violations.issuedAt')}
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {formatDate(selectedViolation.issuedAt)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      {t('violations.dueDate')}
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {formatDate(selectedViolation.dueDate)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      {t('violations.fineAmount')}
                    </Text>
                    <Text style={[styles.detailAmountValue, { color: colors.error }]}>
                      {selectedViolation.fineAmount.toLocaleString()} {t('payment.wallet.currency')}
                    </Text>
                  </View>

                  {/* Speed info for speed violations */}
                  {selectedViolation.type === 'speed' && (
                    <View style={[styles.speedInfo, { backgroundColor: colors.surfaceVariant }]}>
                      <Text style={[styles.speedText, { color: colors.error }]}>
                        {t('violations.speedRecorded', { speed: 95 })}
                      </Text>
                      <Text style={[styles.speedText, { color: colors.textSecondary }]}>
                        {t('violations.speedLimitLabel', { limit: 60 })}
                      </Text>
                    </View>
                  )}

                  {(selectedViolation.status === 'pending' || selectedViolation.status === 'overdue') && (
                    <Button
                      title={t('violations.payNow')}
                      onPress={() => {
                        setSelectedViolation(null);
                        navigation.navigate('ViolationPayment', { violationId: selectedViolation.id });
                      }}
                      fullWidth
                      style={styles.modalPayBtn}
                    />
                  )}
                </>
              )}
            </ScrollView>
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
  filterRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  skeletonPad: {
    paddingHorizontal: 16,
  },
  skeletonCardSpacing: {
    marginBottom: 12,
  },
  violationCard: {
    gap: 12,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  violationType: {
    fontSize: 15,
    fontWeight: '600',
  },
  violationDate: {
    fontSize: 13,
    marginTop: 2,
  },
  violationPlate: {
    fontSize: 12,
    marginTop: 2,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fineAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  payBtn: {
    marginTop: 4,
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  evidencePlaceholder: {
    height: 160,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  evidenceText: {
    fontSize: 14,
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailAmountValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  speedInfo: {
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
    gap: 4,
  },
  speedText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalPayBtn: {
    marginTop: 20,
  },
});
