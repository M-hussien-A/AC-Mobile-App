import React from 'react';
import { View, ScrollView, StyleSheet, Pressable, I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme';
import { Card } from '../../components/common';
import { AccessibleText } from '../../components/common';
import { useSettingsStore } from '../../stores/settingsStore';

const LANGUAGES = [
  { code: 'ar', name: 'العربية', nameEn: 'Arabic', preview: 'مرحباً بك في بوابة معلومات المسافر', direction: 'RTL' },
  { code: 'en', name: 'English', nameEn: 'English', preview: 'Welcome to the Traveler Information Portal', direction: 'LTR' },
];

export default function LanguageScreen() {
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const { language, setLanguage } = useSettingsStore();

  const handleSelect = (code: string) => {
    setLanguage(code as 'ar' | 'en');
    i18n.changeLanguage(code);
    const isRTL = code === 'ar';
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <AccessibleText style={[styles.header, { color: colors.textSecondary }]}>{t('settings.selectLanguage')}</AccessibleText>
      {LANGUAGES.map((lang) => {
        const isSelected = language === lang.code;
        return (
          <Pressable key={lang.code} onPress={() => handleSelect(lang.code)}>
            <Card style={[styles.card, isSelected && { borderColor: colors.accent, borderWidth: 2 }]}>
              <View style={styles.row}>
                <View style={styles.langInfo}>
                  <AccessibleText style={[styles.langName, { color: colors.text }]}>{lang.name}</AccessibleText>
                  <AccessibleText style={[styles.langNameEn, { color: colors.textSecondary }]}>{lang.nameEn} ({lang.direction})</AccessibleText>
                </View>
                {isSelected && <MaterialCommunityIcons name="check-circle" size={24} color={colors.accent} />}
              </View>
              <View style={[styles.previewBox, { backgroundColor: colors.background }]}>
                <AccessibleText style={[styles.preview, { color: colors.text, textAlign: lang.code === 'ar' ? 'right' : 'left' }]}>
                  {lang.preview}
                </AccessibleText>
              </View>
            </Card>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 14, padding: 16, paddingBottom: 8 },
  card: { marginHorizontal: 16, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  langInfo: {},
  langName: { fontSize: 22, fontWeight: '700' },
  langNameEn: { fontSize: 14, marginTop: 2 },
  previewBox: { padding: 12, borderRadius: 8 },
  preview: { fontSize: 14, lineHeight: 22 },
});
