import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker } from '../../utils/MapView';
import { useThemeColors } from '../../theme';
import { Card, FilterChips } from '../../components/common';
import { AccessibleText } from '../../components/common';

const CATEGORIES = ['all', 'government', 'mosque', 'hospital', 'restaurant', 'park'];
const CATEGORY_ICONS: Record<string, string> = { government: 'office-building', mosque: 'mosque', hospital: 'hospital', restaurant: 'food', park: 'tree' };

const POIS = [
  { id: '1', name: 'Parliament Building', nameAr: 'مبنى البرلمان', category: 'government', lat: 30.022, lng: 31.758 },
  { id: '2', name: 'Al Fattah Al Aleem Mosque', nameAr: 'مسجد الفتاح العليم', category: 'mosque', lat: 30.02, lng: 31.762 },
  { id: '3', name: 'NAC Medical Center', nameAr: 'المركز الطبي للعاصمة', category: 'hospital', lat: 30.018, lng: 31.755 },
  { id: '4', name: 'Green River Park', nameAr: 'حديقة النهر الأخضر', category: 'park', lat: 30.025, lng: 31.77 },
  { id: '5', name: 'Capital Cafe', nameAr: 'كافيه العاصمة', category: 'restaurant', lat: 30.019, lng: 31.76 },
];

export default function PointsOfInterestScreen() {
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const [category, setCategory] = useState('all');
  const isAr = i18n.language === 'ar';

  const filtered = category === 'all' ? POIS : POIS.filter(p => p.category === category);
  const categoryOptions = CATEGORIES.map(c => ({ label: t(`services.poi.${c}`), value: c }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MapView style={styles.map} initialRegion={{ latitude: 30.0194, longitude: 31.76, latitudeDelta: 0.02, longitudeDelta: 0.02 }}>
        {filtered.map(p => (
          <Marker key={p.id} coordinate={{ latitude: p.lat, longitude: p.lng }} title={isAr ? p.nameAr : p.name}>
            <View style={[styles.marker, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name={(CATEGORY_ICONS[p.category] || 'map-marker') as any} size={16} color="#fff" />
            </View>
          </Marker>
        ))}
      </MapView>
      <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
        <FilterChips options={categoryOptions} selectedValue={category} onSelect={setCategory} />
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.row}>
                <MaterialCommunityIcons name={(CATEGORY_ICONS[item.category] || 'map-marker') as any} size={24} color={colors.primary} />
                <View style={styles.content}>
                  <AccessibleText style={[styles.name, { color: colors.text }]}>{isAr ? item.nameAr : item.name}</AccessibleText>
                  <AccessibleText style={[styles.cat, { color: colors.textSecondary }]}>{t(`services.poi.${item.category}`)}</AccessibleText>
                </View>
              </View>
            </Card>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 0.45 },
  marker: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  sheet: { flex: 0.55, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 },
  card: { marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  content: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600' },
  cat: { fontSize: 12, marginTop: 2 },
});
