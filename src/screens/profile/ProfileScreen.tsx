/**
 * ACUD ITS Traveler Mobile App - Profile Screen
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  I18nManager,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../theme';
import { useAuthStore } from '../../stores/authStore';
import { useUserStore } from '../../stores/userStore';
import * as userService from '../../services/userService';
import { Card } from '../../components/common/Card';
import { SkeletonLoader, SkeletonList } from '../../components/common/SkeletonLoader';
import { ProfileStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;

interface MenuItem {
  id: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  labelKey: string;
  screen?: keyof ProfileStackParamList;
  isDanger?: boolean;
  isAction?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'wallet', icon: 'wallet', labelKey: 'profile.menu.wallet', screen: 'Wallet' },
  { id: 'violations', icon: 'alert-octagon', labelKey: 'profile.menu.violations', screen: 'ViolationHistory' },
  { id: 'vehicles', icon: 'car', labelKey: 'profile.menu.savedVehicles' },
  { id: 'settings', icon: 'cog', labelKey: 'profile.menu.settings', screen: 'Settings' },
  { id: 'language', icon: 'translate', labelKey: 'profile.menu.language', screen: 'Language' },
  { id: 'accessibility', icon: 'human', labelKey: 'profile.menu.accessibility', screen: 'Accessibility' },
  { id: 'report', icon: 'flag', labelKey: 'profile.menu.reportIssue', screen: 'ReportIssue' },
  { id: 'about', icon: 'information', labelKey: 'profile.menu.about' },
  { id: 'logout', icon: 'logout', labelKey: 'profile.menu.logout', isDanger: true, isAction: true },
];

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const logout = useAuthStore((s) => s.logout);
  const profile = useUserStore((s) => s.profile);
  const setProfile = useUserStore((s) => s.setProfile);
  const setLoading = useUserStore((s) => s.setLoading);
  const isLoading = useUserStore((s) => s.isLoading);
  const setError = useUserStore((s) => s.setError);

  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err?.message ?? t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setProfile, t]);

  useEffect(() => {
    if (!profile) {
      loadProfile();
    }
  }, [profile, loadProfile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  }, [loadProfile]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      t('profile.logoutConfirmTitle'),
      t('profile.logoutConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.logoutConfirmYes'),
          style: 'destructive',
          onPress: () => logout(),
        },
      ],
    );
  }, [t, logout]);

  const handleMenuPress = useCallback(
    (item: MenuItem) => {
      if (item.isAction && item.id === 'logout') {
        handleLogout();
        return;
      }
      if (item.screen) {
        navigation.navigate(item.screen as any);
      }
    },
    [navigation, handleLogout],
  );

  const initials = profile
    ? `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase()
    : '??';

  const renderHeader = () => (
    <View>
      {/* Avatar & Info */}
      <View style={styles.avatarSection}>
        {isLoading && !profile ? (
          <View style={styles.avatarPlaceholder}>
            <SkeletonLoader width={80} height={80} borderRadius={40} />
            <SkeletonLoader width={160} height={20} style={{ marginTop: 12 }} />
            <SkeletonLoader width={200} height={14} style={{ marginTop: 8 }} />
          </View>
        ) : (
          <>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={[styles.userName, { color: colors.text }]}>
              {profile ? `${profile.firstName} ${profile.lastName}` : ''}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
              {profile?.email ?? ''}
            </Text>
          </>
        )}
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.primary }]}>12</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]} numberOfLines={1}>
            {t('profile.quickStats.tripsThisMonth')}
          </Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.primary }]}>8</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]} numberOfLines={1}>
            {t('profile.quickStats.parkingSessions')}
          </Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {profile?.walletBalanceEGP?.toLocaleString() ?? '0'}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]} numberOfLines={1}>
            {t('profile.quickStats.walletBalance')}
          </Text>
        </Card>
      </View>
    </View>
  );

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity
      style={[styles.menuItem, { borderBottomColor: colors.divider }]}
      onPress={() => handleMenuPress(item)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={t(item.labelKey)}
    >
      <View style={styles.menuItemLeft}>
        <MaterialCommunityIcons
          name={item.icon}
          size={22}
          color={item.isDanger ? colors.error : colors.icon}
          style={styles.menuItemIcon}
        />
        <Text
          style={[
            styles.menuItemLabel,
            { color: item.isDanger ? colors.error : colors.text },
          ]}
        >
          {t(item.labelKey)}
        </Text>
      </View>
      <MaterialCommunityIcons
        name={I18nManager.isRTL ? 'chevron-left' : 'chevron-right'}
        size={22}
        color={colors.textTertiary}
      />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={MENU_ITEMS}
        keyExtractor={(item) => item.id}
        renderItem={renderMenuItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 32,
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
  },
  avatarPlaceholder: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
  },
  userEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    marginRight: 14,
    width: 24,
    textAlign: 'center',
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
});
