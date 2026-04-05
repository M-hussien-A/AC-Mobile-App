import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme';
import { Card, FilterChips, EmptyState, SkeletonLoader } from '../../components/common';
import { AccessibleText } from '../../components/common';
import { getActiveDmsMessages, getDmsByType } from '../../services/dmsService';
import { DMSMessage } from '../../types';
import { formatRelativeTime } from '../../utils/helpers';

const DMS_TYPES = ['all', 'advisory', 'incident', 'speed', 'event', 'closure'];

export default function DMSMessageListScreen() {
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const navigation = useNavigation<any>();
  const [messages, setMessages] = useState<DMSMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState('all');

  const loadData = useCallback(async (type: string) => {
    try {
      const data = await getDmsByType(type);
      setMessages(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(selectedType); }, [selectedType]);

  const onRefresh = () => { setRefreshing(true); loadData(selectedType); };
  const isAr = i18n.language === 'ar';

  const filterOptions = DMS_TYPES.map(type => ({
    label: t(`dms.types.${type}`),
    value: type,
  }));

  const renderItem = ({ item }: { item: DMSMessage }) => {
    const lat = (item as any).lat ?? (item as any).location?.latitude;
    const lng = (item as any).lng ?? (item as any).location?.longitude;
    return (
      <Card style={styles.card} onPress={() => navigation.navigate('TrafficMap', { focusLat: lat, focusLng: lng })}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="sign-text" size={24} color={colors.primary} />
          <View style={styles.cardHeaderText}>
            <AccessibleText style={[styles.dmsName, { color: colors.text }]}>{item.dmsName}</AccessibleText>
            <AccessibleText style={[styles.location, { color: colors.textSecondary }]}>{item.location}</AccessibleText>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: colors.primary + '20' }]}>
            <AccessibleText style={[styles.typeText, { color: colors.primary }]}>{t(`dms.types.${item.messageType}`)}</AccessibleText>
          </View>
        </View>
        <View style={[styles.messageBox, { backgroundColor: colors.background }]}>
          <AccessibleText style={[styles.message, { color: colors.accent }]}>
            {isAr ? item.currentMessageAr : item.currentMessage}
          </AccessibleText>
        </View>
        <AccessibleText style={[styles.updated, { color: colors.textSecondary }]}>
          {t('dms.lastUpdated')}: {formatRelativeTime(item.lastUpdated)}
        </AccessibleText>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {[1,2,3,4].map(i => <SkeletonLoader key={i} width="100%" height={120} style={styles.skeleton} />)}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FilterChips options={filterOptions} selectedValue={selectedType} onSelect={setSelectedType} />
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={<EmptyState icon="sign-text" title={t('common.noResults')} message={t('dms.noMessages')} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, gap: 12 },
  card: { marginBottom: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  cardHeaderText: { flex: 1 },
  dmsName: { fontSize: 15, fontWeight: '700' },
  location: { fontSize: 12, marginTop: 2 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  typeText: { fontSize: 11, fontWeight: '600' },
  messageBox: { padding: 12, borderRadius: 8, marginBottom: 8 },
  message: { fontSize: 14, fontFamily: 'monospace', lineHeight: 22 },
  updated: { fontSize: 11 },
  skeleton: { marginHorizontal: 16, marginTop: 12, borderRadius: 12 },
});
