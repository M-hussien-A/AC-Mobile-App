import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView from '../../../utils/MapView';
import { useThemeColors } from '../../../theme';
import { Card, Button } from '../../../components/common';
import { AccessibleText } from '../../../components/common';

export default function RideHailingScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MapView style={styles.map} initialRegion={{ latitude: 30.0194, longitude: 31.76, latitudeDelta: 0.02, longitudeDelta: 0.02 }} showsUserLocation />
      <View style={[styles.overlay, { backgroundColor: colors.surface }]}>
        <View style={styles.comingSoon}>
          <MaterialCommunityIcons name="car-side" size={60} color={colors.primary} />
          <AccessibleText style={[styles.title, { color: colors.text }]}>{t('mobility.rideHailing')}</AccessibleText>
          <AccessibleText style={[styles.subtitle, { color: colors.textSecondary }]}>{t('common.comingSoon')}</AccessibleText>
          <AccessibleText style={[styles.desc, { color: colors.textSecondary }]}>{t('mobility.rideHailingDesc')}</AccessibleText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 32 },
  comingSoon: { alignItems: 'center', gap: 8 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 16, fontWeight: '600' },
  desc: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
