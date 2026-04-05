/**
 * ACUD ITS Traveler Mobile App - Alerts List Screen
 *
 * Main alerts feed displaying categorized alerts with filtering,
 * swipe-to-dismiss, pull-to-refresh, and a floating SOS button.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Pressable,
  Modal,
  StyleSheet,
  I18nManager,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme';
import { AlertsStackParamList } from '../../navigation/types';
import { useAlertStore } from '../../stores/alertStore';
import * as alertService from '../../services/alertService';
import { AlertCard } from '../../components/alerts';
import { SkeletonCard, EmptyState, FilterChips, Badge } from '../../components/common';
import type { Alert, AlertCategory, IncidentSeverity } from '../../types';

// ── Types ──────────────────────────────────────────────────────
type Nav = NativeStackNavigationProp<AlertsStackParamList, 'AlertsList'>;

interface CategoryTab {
  key: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

// ── Constants ──────────────────────────────────────────────────
const SEVERITY_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Critical', value: 'critical' },
  { label: 'Major', value: 'major' },
  { label: 'Minor', value: 'minor' },
  { label: 'Info', value: 'info' },
];

// ── Component ──────────────────────────────────────────────────
export default function AlertsListScreen() {
  const navigation = useNavigation<Nav>();
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const isRTL = I18nManager.isRTL || i18n.language === 'ar';

  // Store
  const alerts = useAlertStore((s) => s.alerts);
  const selectedCategory = useAlertStore((s) => s.selectedCategory);
  const isLoading = useAlertStore((s) => s.isLoading);
  const setAlerts = useAlertStore((s) => s.setAlerts);
  const setCategory = useAlertStore((s) => s.setCategory);
  const setLoading = useAlertStore((s) => s.setLoading);
  const dismissAlert = useAlertStore((s) => s.dismissAlert);

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [severityFilter, setSeverityFilter] = useState('all');

  // ── Category Tabs ──────────────────────────────────────────
  const categoryTabs: CategoryTab[] = useMemo(
    () => [
      { key: 'all', label: t('alerts.categories.all', 'All'), icon: 'bell-outline' },
      { key: 'traffic', label: t('alerts.categories.traffic', 'Traffic'), icon: 'car' },
      { key: 'incident', label: t('alerts.categories.safety', 'Safety'), icon: 'shield-alert' },
      { key: 'transit', label: t('alerts.categories.transit', 'Transit'), icon: 'bus' },
      { key: 'weather', label: t('alerts.categories.weather', 'Weather'), icon: 'weather-partly-cloudy' },
      { key: 'enforcement', label: t('alerts.categories.enforcement', 'Enforcement'), icon: 'gavel' },
    ],
    [t],
  );

  // ── Derived Data ───────────────────────────────────────────
  const categoryCountMap = useMemo(() => {
    const map: Record<string, number> = { all: alerts.length };
    alerts.forEach((a) => {
      map[a.category] = (map[a.category] || 0) + 1;
    });
    return map;
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    let result = alerts;
    if (selectedCategory !== 'all') {
      result = result.filter((a) => a.category === selectedCategory);
    }
    if (severityFilter !== 'all') {
      result = result.filter((a) => a.severity === severityFilter);
    }
    return result;
  }, [alerts, selectedCategory, severityFilter]);

  // ── Data Loading ───────────────────────────────────────────
  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await alertService.getAlerts();
      setAlerts(data);
    } catch {
      // Error handled silently; empty state will show
    } finally {
      setLoading(false);
    }
  }, [setAlerts, setLoading]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await alertService.getAlerts();
      setAlerts(data);
    } catch {
      // Ignore
    } finally {
      setRefreshing(false);
    }
  }, [setAlerts]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // ── Handlers ───────────────────────────────────────────────
  const handleAlertPress = useCallback(
    (alert: Alert) => {
      navigation.navigate('AlertDetail', { alertId: alert.id });
    },
    [navigation],
  );

  const handleSOSPress = useCallback(() => {
    navigation.navigate('EmergencySOS');
  }, [navigation]);

  const handleCategorySelect = useCallback(
    (key: string) => {
      setCategory(key);
    },
    [setCategory],
  );

  // ── Render Helpers ─────────────────────────────────────────
  const renderCategoryTab = useCallback(
    (tab: CategoryTab) => {
      const isSelected = selectedCategory === tab.key;
      const count = categoryCountMap[tab.key] || 0;
      return (
        <Pressable
          key={tab.key}
          onPress={() => handleCategorySelect(tab.key)}
          style={[
            styles.categoryTab,
            {
              backgroundColor: isSelected ? colors.primary + '14' : 'transparent',
              borderBottomColor: isSelected ? colors.accent : 'transparent',
              borderBottomWidth: isSelected ? 3 : 0,
            },
          ]}
          accessibilityRole="tab"
          accessibilityState={{ selected: isSelected }}
          accessibilityLabel={`${tab.label}, ${count} alerts`}
        >
          <MaterialCommunityIcons
            name={tab.icon}
            size={20}
            color={isSelected ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.categoryLabel,
              { color: isSelected ? colors.primary : colors.textSecondary },
              isSelected && styles.categoryLabelSelected,
            ]}
          >
            {tab.label}
          </Text>
          {count > 0 && (
            <View
              style={[
                styles.countBadge,
                {
                  backgroundColor: isSelected ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.countText,
                  { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {count}
              </Text>
            </View>
          )}
        </Pressable>
      );
    },
    [selectedCategory, categoryCountMap, colors, handleCategorySelect],
  );

  const renderAlertCard = useCallback(
    ({ item }: { item: Alert }) => (
      <View style={styles.cardWrapper}>
        <AlertCard
          alert={item}
          onPress={() => handleAlertPress(item)}
          onDismiss={() => dismissAlert(item.id)}
        />
      </View>
    ),
    [handleAlertPress, dismissAlert],
  );

  const keyExtractor = useCallback((item: Alert) => item.id, []);

  // ── Filter Modal ───────────────────────────────────────────
  const renderFilterModal = () => (
    <Modal
      visible={filterModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setFilterModalVisible(false)}
        />
        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.surface },
          ]}
        >
          <View style={styles.modalHandle}>
            <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
          </View>

          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {t('alerts.filter.title', 'Filter Alerts')}
          </Text>

          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>
            {t('alerts.filter.severity', 'Severity')}
          </Text>

          <FilterChips
            options={SEVERITY_OPTIONS.map((o) => ({
              label: t(`alerts.filter.${o.value}`, o.label),
              value: o.value,
            }))}
            selectedValue={severityFilter}
            onSelect={(val) => setSeverityFilter(val as string)}
            style={styles.filterChips}
          />

          <Pressable
            onPress={() => {
              setSeverityFilter('all');
              setFilterModalVisible(false);
            }}
            style={[styles.resetButton, { borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel={t('alerts.filter.reset', 'Reset Filters')}
          >
            <Text style={[styles.resetButtonText, { color: colors.primary }]}>
              {t('alerts.filter.reset', 'Reset Filters')}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setFilterModalVisible(false)}
            style={[styles.applyButton, { backgroundColor: colors.primary }]}
            accessibilityRole="button"
            accessibilityLabel={t('alerts.filter.apply', 'Apply Filters')}
          >
            <Text style={styles.applyButtonText}>
              {t('alerts.filter.apply', 'Apply Filters')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  // ── Main Render ────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.isDark ? 'light-content' : 'dark-content'} />

      {/* Category Tabs + Filter Button */}
      <View style={[styles.tabBar, { borderBottomColor: colors.divider }]}>
        <FlatList
          data={categoryTabs}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => renderCategoryTab(item)}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.tabBarContent}
          inverted={isRTL}
        />
        <Pressable
          onPress={() => setFilterModalVisible(true)}
          style={[styles.filterButton, { backgroundColor: colors.surfaceVariant }]}
          accessibilityRole="button"
          accessibilityLabel={t('alerts.filter.button', 'Filter')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons
            name="filter-variant"
            size={20}
            color={severityFilter !== 'all' ? colors.accent : colors.icon}
          />
        </Pressable>
      </View>

      {/* Loading Skeleton */}
      {isLoading && !refreshing ? (
        <View style={styles.skeletonContainer}>
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} style={styles.skeletonCard} />
          ))}
        </View>
      ) : filteredAlerts.length === 0 ? (
        /* Empty State */
        <EmptyState
          icon="bell-off-outline"
          title={t('alerts.empty.title', 'No Alerts')}
          message={t(
            'alerts.empty.message',
            'There are no alerts in this category right now.',
          )}
          actionLabel={t('alerts.empty.refresh', 'Refresh')}
          onAction={handleRefresh}
        />
      ) : (
        /* Alert List */
        <FlatList
          data={filteredAlerts}
          renderItem={renderAlertCard}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      )}

      {/* Floating SOS Button */}
      <Pressable
        onPress={handleSOSPress}
        style={({ pressed }) => [
          styles.sosFloating,
          isRTL ? styles.sosFloatingRTL : null,
          { opacity: pressed ? 0.85 : 1 },
        ]}
        accessibilityRole="button"
        accessibilityLabel={t('alerts.sos.floating', 'Emergency SOS')}
      >
        <Text style={styles.sosFloatingText}>SOS</Text>
      </Pressable>

      {renderFilterModal()}
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Category Tabs
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabBarContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
    marginBottom: -StyleSheet.hairlineWidth,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  categoryLabelSelected: {
    fontWeight: '700',
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  // List
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  cardWrapper: {
    marginBottom: 12,
  },
  // Skeleton
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  skeletonCard: {
    marginBottom: 12,
  },
  // SOS Floating Button
  sosFloating: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#DC2626',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  sosFloatingRTL: {
    right: undefined,
    left: 20,
  },
  sosFloatingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  // Filter Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  modalHandle: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  filterChips: {
    marginBottom: 24,
  },
  resetButton: {
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
