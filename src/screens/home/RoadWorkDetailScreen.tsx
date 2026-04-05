import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Polygon, Marker } from 'react-native-maps';
import { useThemeColors } from '../../theme';
import { Card, Button } from '../../components/common';
import { AccessibleText } from '../../components/common';

export default function RoadWorkDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const colors = useThemeColors();

  const workZone = {
    id: route.params?.workZoneId || 'WZ-001',
    name: 'Al Amal Axis Road Widening',
    nameAr: 'توسيع محور الأمل',
    type: 'active',
    lanesAffected: '2 of 4 lanes closed',
    startDate: '2026-03-15',
    endDate: '2026-05-30',
    schedule: 'Daily 22:00 - 06:00',
    coordinates: [
      { latitude: 30.02, longitude: 31.755 },
      { latitude: 30.022, longitude: 31.755 },
      { latitude: 30.022, longitude: 31.758 },
      { latitude: 30.02, longitude: 31.758 },
    ],
    center: { latitude: 30.021, longitude: 31.7565 },
    expectedDelay: '10-15 min',
    alternativeRoute: 'Use South 90th Street via Heliopolis Axis',
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: '#F59E0B20' }]}>
        <View style={styles.headerRow}>
          <MaterialCommunityIcons name="hard-hat" size={32} color="#F59E0B" />
          <View style={styles.headerText}>
            <AccessibleText style={[styles.title, { color: colors.text }]}>{workZone.name}</AccessibleText>
            <View style={[styles.typeBadge, { backgroundColor: workZone.type === 'active' ? '#F59E0B' : colors.primary }]}>
              <AccessibleText style={styles.typeText}>{t(`roadWork.${workZone.type}`)}</AccessibleText>
            </View>
          </View>
        </View>
      </View>

      <Card style={styles.card}>
        <MapView
          style={styles.map}
          initialRegion={{ ...workZone.center, latitudeDelta: 0.005, longitudeDelta: 0.005 }}
        >
          <Polygon
            coordinates={workZone.coordinates}
            fillColor="rgba(245, 158, 11, 0.3)"
            strokeColor="#F59E0B"
            strokeWidth={2}
          />
          <Marker coordinate={workZone.center}>
            <MaterialCommunityIcons name="hard-hat" size={24} color="#F59E0B" />
          </Marker>
        </MapView>
      </Card>

      <Card style={styles.card}>
        <AccessibleText style={[styles.sectionTitle, { color: colors.text }]}>{t('roadWork.details')}</AccessibleText>
        <DetailRow icon="map-marker" label={t('roadWork.lanesAffected')} value={workZone.lanesAffected} colors={colors} />
        <DetailRow icon="calendar-start" label={t('roadWork.startDate')} value={workZone.startDate} colors={colors} />
        <DetailRow icon="calendar-end" label={t('roadWork.endDate')} value={workZone.endDate} colors={colors} />
        <DetailRow icon="clock-outline" label={t('roadWork.schedule')} value={workZone.schedule} colors={colors} />
      </Card>

      <Card style={styles.card}>
        <AccessibleText style={[styles.sectionTitle, { color: colors.text }]}>{t('roadWork.trafficImpact')}</AccessibleText>
        <View style={[styles.impactBox, { backgroundColor: '#FEF3C720' }]}>
          <MaterialCommunityIcons name="clock-alert" size={20} color="#F59E0B" />
          <AccessibleText style={[styles.impactText, { color: colors.text }]}>
            {t('roadWork.expectedDelay')}: {workZone.expectedDelay}
          </AccessibleText>
        </View>
        <View style={[styles.impactBox, { backgroundColor: '#22C55E20', marginTop: 8 }]}>
          <MaterialCommunityIcons name="directions" size={20} color="#22C55E" />
          <AccessibleText style={[styles.impactText, { color: colors.text }]}>
            {workZone.alternativeRoute}
          </AccessibleText>
        </View>
      </Card>

      <View style={styles.buttonContainer}>
        <Button title={t('roadWork.navigateAround')} onPress={() => navigation.navigate('JourneyTab')} variant="primary" icon="directions" fullWidth />
      </View>
    </ScrollView>
  );
}

function DetailRow({ icon, label, value, colors }: { icon: string; label: string; value: string; colors: any }) {
  return (
    <View style={styles.detailRow}>
      <MaterialCommunityIcons name={icon as any} size={18} color={colors.textSecondary} />
      <AccessibleText style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</AccessibleText>
      <AccessibleText style={[styles.detailValue, { color: colors.text }]}>{value}</AccessibleText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerText: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  typeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  card: { marginHorizontal: 16, marginBottom: 12 },
  map: { height: 200, borderRadius: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB' },
  detailLabel: { fontSize: 14, flex: 1 },
  detailValue: { fontSize: 14, fontWeight: '600' },
  impactBox: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 8 },
  impactText: { fontSize: 14, flex: 1 },
  buttonContainer: { padding: 16 },
});
