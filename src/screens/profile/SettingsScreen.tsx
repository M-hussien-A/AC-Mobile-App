/**
 * ACUD ITS Traveler Mobile App - Settings Screen
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  I18nManager,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../theme';
import { useSettingsStore } from '../../stores/settingsStore';
import { ProfileStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'Settings'>;

const MAP_LAYERS = [
  { key: 'trafficFlow', labelKey: 'settings.mapLayerTraffic' },
  { key: 'incidents', labelKey: 'settings.mapLayerIncidents' },
  { key: 'parking', labelKey: 'settings.mapLayerParking' },
  { key: 'transit', labelKey: 'settings.mapLayerTransit' },
  { key: 'weather', labelKey: 'settings.mapLayerWeather' },
];

export default function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [dataSharing, setDataSharing] = useState(false);

  const isDarkMode = useSettingsStore((s) => s.isDarkMode);
  const toggleDarkMode = useSettingsStore((s) => s.toggleDarkMode);
  const units = useSettingsStore((s) => s.units);
  const setUnits = useSettingsStore((s) => s.setUnits);
  const defaultMapLayers = useSettingsStore((s) => s.defaultMapLayers);
  const setDefaultMapLayers = useSettingsStore((s) => s.setDefaultMapLayers);
  const avoidTolls = useSettingsStore((s) => s.avoidTolls);
  const avoidHighways = useSettingsStore((s) => s.avoidHighways);
  const avoidWorkZones = useSettingsStore((s) => s.avoidWorkZones);
  const setAvoidOption = useSettingsStore((s) => s.setAvoidOption);

  const toggleMapLayer = useCallback(
    (layer: string) => {
      if (defaultMapLayers.includes(layer)) {
        setDefaultMapLayers(defaultMapLayers.filter((l) => l !== layer));
      } else {
        setDefaultMapLayers([...defaultMapLayers, layer]);
      }
    },
    [defaultMapLayers, setDefaultMapLayers],
  );

  const handleClearCache = useCallback(() => {
    Alert.alert(
      t('settings.cacheClearedTitle'),
      t('settings.cacheClearedMessage'),
    );
  }, [t]);

  const renderSectionHeader = (title: string) => (
    <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
      {title}
    </Text>
  );

  const renderToggleRow = (
    label: string,
    value: boolean,
    onToggle: (val: boolean) => void,
    icon?: keyof typeof MaterialCommunityIcons.glyphMap,
  ) => (
    <View style={[styles.row, { borderBottomColor: colors.divider }]}>
      <View style={styles.rowLeft}>
        {icon && (
          <MaterialCommunityIcons name={icon} size={20} color={colors.icon} style={styles.rowIcon} />
        )}
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary + '60' }}
        thumbColor={value ? colors.primary : colors.surfaceVariant}
      />
    </View>
  );

  const renderCheckboxRow = (label: string, checked: boolean, onToggle: () => void) => (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.divider }]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      <MaterialCommunityIcons
        name={checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
        size={22}
        color={checked ? colors.primary : colors.textTertiary}
      />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Appearance */}
        {renderSectionHeader(t('settings.appearance'))}
        {renderToggleRow(
          t('settings.darkMode'),
          isDarkMode,
          () => toggleDarkMode(),
          'brightness-6',
        )}

        {/* Units */}
        {renderSectionHeader(t('settings.unitsSection'))}
        <View style={styles.unitsRow}>
          <TouchableOpacity
            style={[
              styles.unitOption,
              {
                backgroundColor: units === 'km' ? colors.primary : colors.surfaceVariant,
                borderColor: units === 'km' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setUnits('km')}
          >
            <Text
              style={[styles.unitText, { color: units === 'km' ? '#FFFFFF' : colors.text }]}
            >
              {t('settings.unitsKm')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.unitOption,
              {
                backgroundColor: units === 'miles' ? colors.primary : colors.surfaceVariant,
                borderColor: units === 'miles' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setUnits('miles')}
          >
            <Text
              style={[styles.unitText, { color: units === 'miles' ? '#FFFFFF' : colors.text }]}
            >
              {t('settings.unitsMiles')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Map */}
        {renderSectionHeader(t('settings.mapSection'))}
        {MAP_LAYERS.map((layer) =>
          renderCheckboxRow(
            t(layer.labelKey),
            defaultMapLayers.includes(layer.key),
            () => toggleMapLayer(layer.key),
          ),
        )}

        {/* Navigation */}
        {renderSectionHeader(t('settings.navigationSection'))}
        {renderToggleRow(
          t('settings.avoidTolls'),
          avoidTolls,
          (val) => setAvoidOption('avoidTolls', val),
        )}
        {renderToggleRow(
          t('settings.avoidHighways'),
          avoidHighways,
          (val) => setAvoidOption('avoidHighways', val),
        )}
        {renderToggleRow(
          t('settings.avoidWorkZones'),
          avoidWorkZones,
          (val) => setAvoidOption('avoidWorkZones', val),
        )}

        {/* Notifications */}
        {renderSectionHeader(t('settings.notificationsSection', 'Notifications'))}
        <TouchableOpacity
          style={[styles.row, { borderBottomColor: colors.divider }]}
          onPress={() => navigation.navigate('NotificationPreferences')}
          activeOpacity={0.7}
        >
          <View style={styles.rowLeft}>
            <MaterialCommunityIcons name="bell-outline" size={20} color={colors.icon} style={styles.rowIcon} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>
              {t('settings.notificationPreferences', 'Notification Preferences')}
            </Text>
          </View>
          <MaterialCommunityIcons
            name={I18nManager.isRTL ? 'chevron-left' : 'chevron-right'}
            size={22}
            color={colors.textTertiary}
          />
        </TouchableOpacity>

        {/* Privacy */}
        {renderSectionHeader(t('settings.privacySection'))}
        {renderToggleRow(
          t('settings.dataSharing'),
          dataSharing,
          (val) => setDataSharing(val),
          'shield-account',
        )}
        <TouchableOpacity
          style={[styles.row, { borderBottomColor: colors.divider }]}
          onPress={handleClearCache}
          activeOpacity={0.7}
        >
          <View style={styles.rowLeft}>
            <MaterialCommunityIcons name="cached" size={20} color={colors.error} style={styles.rowIcon} />
            <Text style={[styles.rowLabel, { color: colors.error }]}>
              {t('settings.clearCache')}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIcon: {
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  unitsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  unitOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  unitText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
