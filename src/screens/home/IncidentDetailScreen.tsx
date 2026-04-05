import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker } from '../../utils/MapView';
import { useThemeColors } from '../../theme';
import { Card } from '../../components/common';
import { SeverityBadge } from '../../components/alerts';
import { AccessibleText } from '../../components/common';
import { getIncidentById } from '../../services/incidentService';
import { getDmsById } from '../../services/dmsService';
import { Incident, DMSMessage } from '../../types';
import { formatRelativeTime, getIncidentTypeIcon, getSeverityColor } from '../../utils/helpers';

export default function IncidentDetailScreen() {
  const route = useRoute<any>();
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [relatedDms, setRelatedDms] = useState<DMSMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await getIncidentById(route.params?.incidentId);
      if (data) {
        setIncident(data);
        if (data.relatedDmsIds?.length) {
          const dmsResults = await Promise.all(data.relatedDmsIds.map((id: string) => getDmsById(id)));
          setRelatedDms(dmsResults.filter(Boolean) as DMSMessage[]);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (!incident) {
    return <View style={[styles.center, { backgroundColor: colors.background }]}><AccessibleText style={{ color: colors.textSecondary }}>{t('common.noResults')}</AccessibleText></View>;
  }

  const isAr = i18n.language === 'ar';
  const title = isAr ? incident.titleAr : incident.title;
  const description = isAr ? incident.descriptionAr : incident.description;
  const lat = (incident as any).lat ?? (incident as any).location?.latitude ?? 30.0194;
  const lng = (incident as any).lng ?? (incident as any).location?.longitude ?? 31.76;

  const timeline = [
    { status: 'detected', time: incident.startTime, icon: 'eye' },
    { status: 'confirmed', time: incident.startTime, icon: 'check-circle' },
    { status: 'responding', time: incident.startTime, icon: 'truck' },
    ...(incident.status === 'cleared' ? [{ status: 'cleared', time: incident.startTime, icon: 'check-all' }] : []),
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: getSeverityColor(incident.severity) + '15' }]}>
        <View style={styles.headerRow}>
          <MaterialCommunityIcons name={getIncidentTypeIcon(incident.type) as any} size={32} color={getSeverityColor(incident.severity)} />
          <View style={styles.headerText}>
            <AccessibleText style={[styles.title, { color: colors.text }]}>{title}</AccessibleText>
            <View style={styles.badges}>
              <SeverityBadge severity={incident.severity as any} />
              <View style={[styles.statusBadge, { backgroundColor: incident.status === 'cleared' ? '#22C55E' : colors.primary }]}>
                <AccessibleText style={styles.statusText}>{t(`incidents.status.${incident.status}`)}</AccessibleText>
              </View>
            </View>
          </View>
        </View>
      </View>

      <Card style={styles.card}>
        <MapView
          style={styles.map}
          initialRegion={{ latitude: lat, longitude: lng, latitudeDelta: 0.005, longitudeDelta: 0.005 }}
        >
          <Marker coordinate={{ latitude: lat, longitude: lng }} pinColor={getSeverityColor(incident.severity)} />
        </MapView>
      </Card>

      <Card style={styles.card}>
        <AccessibleText style={[styles.sectionTitle, { color: colors.text }]}>{t('incidents.details')}</AccessibleText>
        <DetailRow label={t('incidents.type')} value={t(`incidents.types.${incident.type}`)} colors={colors} />
        <DetailRow label={t('incidents.source')} value={incident.source} colors={colors} />
        <DetailRow label={t('incidents.location')} value={incident.roadName} colors={colors} />
        <DetailRow label={t('incidents.lanesAffected')} value={incident.lanesAffected} colors={colors} />
        <DetailRow label={t('incidents.startTime')} value={formatRelativeTime(incident.startTime)} colors={colors} />
        <DetailRow label={t('incidents.estimatedDuration')} value={`${incident.estimatedDuration} ${t('units.min')}`} colors={colors} />
      </Card>

      <Card style={styles.card}>
        <AccessibleText style={[styles.sectionTitle, { color: colors.text }]}>{t('incidents.impact')}</AccessibleText>
        <AccessibleText style={[styles.body, { color: colors.textSecondary }]}>{description}</AccessibleText>
      </Card>

      {relatedDms.length > 0 && (
        <Card style={styles.card}>
          <AccessibleText style={[styles.sectionTitle, { color: colors.text }]}>{t('dms.relatedMessages')}</AccessibleText>
          {relatedDms.map((dms) => (
            <View key={dms.id} style={[styles.dmsCard, { backgroundColor: colors.surface }]}>
              <AccessibleText style={[styles.dmsName, { color: colors.text }]}>{dms.dmsName}</AccessibleText>
              <AccessibleText style={[styles.dmsMessage, { color: colors.accent }]}>
                {isAr ? dms.currentMessageAr : dms.currentMessage}
              </AccessibleText>
            </View>
          ))}
        </Card>
      )}

      <Card style={styles.card}>
        <AccessibleText style={[styles.sectionTitle, { color: colors.text }]}>{t('incidents.timeline')}</AccessibleText>
        {timeline.map((item, index) => (
          <View key={item.status} style={styles.timelineItem}>
            <View style={styles.timelineDot}>
              <View style={[styles.dot, { backgroundColor: index <= timeline.findIndex(t => t.status === incident.status) ? colors.primary : colors.border }]} />
              {index < timeline.length - 1 && <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />}
            </View>
            <View style={styles.timelineContent}>
              <AccessibleText style={[styles.timelineStatus, { color: colors.text }]}>{t(`incidents.status.${item.status}`)}</AccessibleText>
              <AccessibleText style={[styles.timelineTime, { color: colors.textSecondary }]}>{formatRelativeTime(item.time)}</AccessibleText>
            </View>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

function DetailRow({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={styles.detailRow}>
      <AccessibleText style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</AccessibleText>
      <AccessibleText style={[styles.detailValue, { color: colors.text }]}>{value}</AccessibleText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 16, marginBottom: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerText: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  badges: { flexDirection: 'row', gap: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  card: { marginHorizontal: 16, marginBottom: 12 },
  map: { height: 200, borderRadius: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  body: { fontSize: 14, lineHeight: 22 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB' },
  detailLabel: { fontSize: 14 },
  detailValue: { fontSize: 14, fontWeight: '600' },
  dmsCard: { padding: 12, borderRadius: 8, marginTop: 8 },
  dmsName: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  dmsMessage: { fontSize: 14, fontFamily: 'monospace' },
  timelineItem: { flexDirection: 'row', gap: 12 },
  timelineDot: { alignItems: 'center', width: 20 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  timelineLine: { width: 2, flex: 1, minHeight: 30 },
  timelineContent: { flex: 1, paddingBottom: 16 },
  timelineStatus: { fontSize: 14, fontWeight: '600' },
  timelineTime: { fontSize: 12, marginTop: 2 },
});
