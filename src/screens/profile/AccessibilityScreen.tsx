import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme';
import { Card } from '../../components/common';
import { AccessibleText } from '../../components/common';
import Slider from '@react-native-community/slider';

export default function AccessibilityScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [fontSize, setFontSize] = useState(1);
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={styles.card}>
        <AccessibleText style={[styles.sectionTitle, { color: colors.text }]}>{t('settings.fontSize')}</AccessibleText>
        <View style={styles.sliderRow}>
          <AccessibleText style={[styles.sliderLabel, { color: colors.textSecondary, fontSize: 12 }]}>A</AccessibleText>
          <View style={styles.slider}>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${fontSize * 50}%`, backgroundColor: colors.primary }]} />
            </View>
            <View style={styles.sliderButtons}>
              {[0.8, 1, 1.2, 1.5].map((v) => (
                <Pressable key={v} onPress={() => setFontSize(v)} style={[styles.sliderDot, fontSize === v && { backgroundColor: colors.primary }]}>
                  <View />
                </Pressable>
              ))}
            </View>
          </View>
          <AccessibleText style={[styles.sliderLabel, { color: colors.textSecondary, fontSize: 20 }]}>A</AccessibleText>
        </View>
        <AccessibleText style={[styles.previewText, { color: colors.text, fontSize: 14 * fontSize }]}>
          {t('settings.fontSizePreview')}
        </AccessibleText>
      </Card>

      <Card style={styles.card}>
        <View style={styles.toggleRow}>
          <MaterialCommunityIcons name="contrast-box" size={24} color={colors.primary} />
          <View style={styles.toggleContent}>
            <AccessibleText style={[styles.toggleLabel, { color: colors.text }]}>{t('settings.highContrast')}</AccessibleText>
            <AccessibleText style={[styles.toggleDesc, { color: colors.textSecondary }]}>{t('settings.highContrastDesc')}</AccessibleText>
          </View>
          <Switch value={highContrast} onValueChange={setHighContrast} trackColor={{ true: colors.primary }} />
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.toggleRow}>
          <MaterialCommunityIcons name="motion-sensor-off" size={24} color={colors.primary} />
          <View style={styles.toggleContent}>
            <AccessibleText style={[styles.toggleLabel, { color: colors.text }]}>{t('settings.reduceMotion')}</AccessibleText>
            <AccessibleText style={[styles.toggleDesc, { color: colors.textSecondary }]}>{t('settings.reduceMotionDesc')}</AccessibleText>
          </View>
          <Switch value={reduceMotion} onValueChange={setReduceMotion} trackColor={{ true: colors.primary }} />
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="text-to-speech" size={24} color={colors.primary} />
          <View style={styles.toggleContent}>
            <AccessibleText style={[styles.toggleLabel, { color: colors.text }]}>{t('settings.screenReader')}</AccessibleText>
            <AccessibleText style={[styles.toggleDesc, { color: colors.textSecondary }]}>{t('settings.screenReaderDesc')}</AccessibleText>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}

import { Pressable } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { marginHorizontal: 16, marginTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  sliderLabel: { fontWeight: '700' },
  slider: { flex: 1 },
  sliderTrack: { height: 4, backgroundColor: '#E5E7EB', borderRadius: 2 },
  sliderFill: { height: 4, borderRadius: 2 },
  sliderButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -8 },
  sliderDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#E5E7EB', borderWidth: 2, borderColor: '#fff' },
  previewText: { textAlign: 'center', padding: 8 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleContent: { flex: 1 },
  toggleLabel: { fontSize: 15, fontWeight: '600' },
  toggleDesc: { fontSize: 12, marginTop: 2, lineHeight: 18 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
});
