/**
 * DMSMessageListScreen - Lists active DMS (Dynamic Message Sign) messages
 * with filter chips by message type.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  I18nManager,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme';
import { Card, FilterChips, EmptyState, SkeletonLoader } from '../../components/common';
import { AccessibleText } from '../../components/common';
import { getActiveDmsMessages, getDmsByType } from '../../services/dmsService';
import type { DMSMessage } from '../../types';
import type { HomeStackParamList } from '../../navigation/types';
import { formatRelativeTime } from '../../utils/helpers';

// ── Types ────────────────────────────────────────────────────────

type Nav = NativeStackNavigationProp<HomeStackParamList, 'DMSMessageList'>;

const DMS_TYPES = ['all', 'advisory', 'incident', 'speed', 'event', 'closure'];

// ── Helpers ──────────────────────────────────────────────────────

function priorityColor(priority: number): string {
  if (priority <= 1) return '#DC2626';
  if (priority <= 2) return '#F59E0B';
  return '#3B82F6';
}

function priorityLabel(priority: number): string {
  if (priority <= 1) return 'high';
  if (priority <= 2) return 'medium';
  return 'low';
}

// ── Component ────────────────────────────────────────────────────

export default function DMSMessageListScreen() {
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const navigation = useNavigation<Nav>();
  const isRTL = I18nManager.isRTL;
  const isAr = i18n.language === 'ar';

  const [messages, setMessages] = useState<DMSMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState('all');

  const loadData = useCallback(async (type: string) => {
    try {
      const data = type === 'all'
        ? await getActiveDmsMessages()
        : await getDmsByType(type);
      setMessages(data);
    } catch {
      // Silently handle; empty state will show
      setMessages([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(selectedType);
  }, [selectedType, loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(selectedType);
  }, [loadData, selectedType]);

  const handleTypeSelect = useCallback((type: string | string[]) => {
    const value = Array.isArray(type) ? type[0] : type;
    setSelectedType(value);
    setLoading(true);
  }, []);

  const filterOptions = DMS_TYPES.map((type) => ({
    label: t(`dms.types.${type}`),
    value: type,
  }));

  const renderItem = useCallback(
    ({ item }: { item: DMSMessage }) => {
      const messageType = (item as any).messageType;

      return (
        <Card
          style={styles.card}
          onPress={() => navigation.navigate('TrafficMap')}
          accessibilityLabel={`${item.signId}: ${isAr ? item.messageAr : item.message}`}
        >
          <View
            style={[
              styles.cardHeader,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <View style={[styles.signIconWrap, { backgroundColor: `${colors.primary}15` }]}>
              <MaterialCommunityIcons name="sign-text" size={22} color={colors.primary} />
            </View>
            <View style={[styles.cardHeaderText, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
              <AccessibleText style={[styles.dmsName, { color: colors.text }]}>
                {item.signId}
              </AccessibleText>
              <AccessibleText style={[styles.statusLabel, { color: colors.textSecondary }]}>
                {item.status === 'active' ? t('dms.active') : t('dms.inactive')}
              </AccessibleText>
            </View>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: priorityColor(item.priority) + '20' },
              ]}
            >
              <AccessibleText
                style={[styles.priorityText, { color: priorityColor(item.priority) }]}
              >
                {t(`dms.priority.${priorityLabel(item.priority)}`)}
              </AccessibleText>
            </View>
          </View>

          {/* Message display box */}
          <View style={[styles.messageBox, { backgroundColor: colors.background }]}>
            <AccessibleText style={[styles.message, { color: colors.accent }]}>
              {isAr ? item.messageAr : item.message}
            </AccessibleText>
          </View>

          {/* Footer with type badge and update time */}
          <View
            style={[
              styles.cardFooter,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            {messageType && (
              <View style={[styles.typeBadge, { backgroundColor: colors.primary + '15' }]}>
                <AccessibleText style={[styles.typeText, { color: colors.primary }]}>
                  {t(`dms.types.${messageType}`)}
                </AccessibleText>
              </View>
            )}
            <AccessibleText style={[styles.updated, { color: colors.textSecondary }]}>
              {t('dms.lastUpdated')}: {formatRelativeTime(item.updatedAt)}
            </AccessibleText>
          </View>
        </Card>
      );
    },
    [colors, isAr, isRTL, navigation, t],
  );

  // ── Loading state ────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.skeletonWrap}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonLoader
              key={i}
              width="100%"
              height={140}
              borderRadius={12}
              style={styles.skeleton}
            />
          ))}
        </View>
      </View>
    );
  }

  // ── Main render ──────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FilterChips
        options={filterOptions}
        selectedValue={selectedType}
        onSelect={handleTypeSelect}
      />
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="sign-text"
            title={t('common.noResults')}
            message={t('dms.noMessages')}
          />
        }
      />
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    marginBottom: 4,
  },
  cardHeader: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  signIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderText: {
    flex: 1,
  },
  dmsName: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  messageBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    fontFamily: 'monospace',
    lineHeight: 22,
  },
  cardFooter: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  updated: {
    fontSize: 11,
  },
  skeletonWrap: {
    padding: 16,
  },
  skeleton: {
    marginBottom: 12,
  },
});
