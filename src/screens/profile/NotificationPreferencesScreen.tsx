import React from 'react';
import { View, ScrollView, StyleSheet, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme';
import { Card } from '../../components/common';
import { AccessibleText } from '../../components/common';
import { useSettingsStore } from '../../stores/settingsStore';

const CATEGORIES = [
  { key: 'traffic', icon: 'car' },
  { key: 'safety', icon: 'shield-check' },
  { key: 'transit', icon: 'bus' },
  { key: 'weather', icon: 'weather-cloudy' },
  { key: 'enforcement', icon: 'camera' },
  { key: 'parking', icon: 'parking' },
];

export default function NotificationPreferencesScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { notificationPreferences, setNotificationPreference } = useSettingsStore();

  const allEnabled = Object.values(notificationPreferences).every(v => v);
  const toggleAll = () => {
    const newValue = !allEnabled;
    CATEGORIES.forEach(c => setNotificationPreference(c.key, newValue));
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <AccessibleText style={[styles.masterLabel, { color: colors.text }]}>{t('settings.enableAll')}</AccessibleText>
          <Switch value={allEnabled} onValueChange={toggleAll} trackColor={{ true: colors.primary }} />
        </View>
      </Card>

      {CATEGORIES.map(({ key, icon }) => (
        <Card key={key} style={styles.card}>
          <View style={styles.row}>
            <MaterialCommunityIcons name={icon as any} size={24} color={colors.primary} />
            <AccessibleText style={[styles.label, { color: colors.text }]}>{t(`settings.notifications.${key}`)}</AccessibleText>
            <Switch
              value={notificationPreferences[key] ?? true}
              onValueChange={(v) => setNotificationPreference(key, v)}
              trackColor={{ true: colors.primary }}
            />
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { marginHorizontal: 16, marginTop: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  masterLabel: { flex: 1, fontSize: 16, fontWeight: '700' },
  label: { flex: 1, fontSize: 15 },
});
