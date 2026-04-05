/**
 * LEZInfoScreen - Low Emission Zone information screen
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView from '../../utils/MapView';
import { useThemeColors } from '../../theme';
import { Card } from '../../components/common';
import { AccessibleText } from '../../components/common';

const LEZ_ZONES = [
  {
    id: 'lez-1',
    name: 'Government District LEZ',
    nameAr: 'منطقة انبعاثات منخفضة - الحي الحكومي',
    restriction: 'Euro 4+ only',
    restrictionAr: 'يورو 4+ فقط',
    hours: '06:00 - 22:00',
    lat: 30.022,
    lng: 31.758,
  },
  {
    id: 'lez-2',
    name: 'Central Business District LEZ',
    nameAr: 'منطقة انبعاثات منخفضة - حي الأعمال المركزي',
    restriction: 'Euro 5+ only',
    restrictionAr: 'يورو 5+ فقط',
    hours: '24/7',
    lat: 30.02,
    lng: 31.765,
  },
  {
    id: 'lez-3',
    name: 'Residential Area LEZ',
    nameAr: 'منطقة انبعاثات منخفضة - المنطقة السكنية',
    restriction: 'Euro 3+ only',
    restrictionAr: 'يورو 3+ فقط',
    hours: '07:00 - 20:00',
    lat: 30.018,
    lng: 31.755,
  },
];

export default function LEZInfoScreen() {
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const isAr = i18n.language === 'ar';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 30.0194,
          longitude: 31.76,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      />
      <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <MaterialCommunityIcons name="leaf" size={24} color="#059669" />
            <AccessibleText style={[styles.headerTitle, { color: colors.text }]}>
              {t('services.lowEmissions')}
            </AccessibleText>
          </View>
          <AccessibleText style={[styles.description, { color: colors.textSecondary }]}>
            {isAr
              ? 'مناطق الانبعاثات المنخفضة في العاصمة الإدارية الجديدة تهدف لتحسين جودة الهواء عبر تقييد المركبات ذات الانبعاثات العالية.'
              : 'Low Emission Zones in the New Administrative Capital aim to improve air quality by restricting high-emission vehicles.'}
          </AccessibleText>

          {LEZ_ZONES.map((zone) => (
            <Card key={zone.id} style={styles.card}>
              <View style={styles.zoneHeader}>
                <View style={[styles.zoneDot, { backgroundColor: '#059669' }]} />
                <AccessibleText style={[styles.zoneName, { color: colors.text }]}>
                  {isAr ? zone.nameAr : zone.name}
                </AccessibleText>
              </View>
              <View style={styles.zoneDetails}>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="car-off" size={16} color={colors.textSecondary} />
                  <AccessibleText style={[styles.detailText, { color: colors.textSecondary }]}>
                    {isAr ? zone.restrictionAr : zone.restriction}
                  </AccessibleText>
                </View>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color={colors.textSecondary} />
                  <AccessibleText style={[styles.detailText, { color: colors.textSecondary }]}>
                    {zone.hours}
                  </AccessibleText>
                </View>
              </View>
            </Card>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 0.35 },
  sheet: {
    flex: 0.65,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -16,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  description: { fontSize: 14, lineHeight: 22, marginBottom: 16 },
  card: { marginBottom: 12 },
  zoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  zoneDot: { width: 10, height: 10, borderRadius: 5 },
  zoneName: { fontSize: 15, fontWeight: '600', flex: 1 },
  zoneDetails: { gap: 6, paddingStart: 20 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 13 },
});
