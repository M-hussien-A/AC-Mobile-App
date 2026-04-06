import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../../theme';
import { Card, Button } from '../../../components/common';
import { AccessibleText } from '../../../components/common';
import { SessionTimer } from '../../../components/parking';
import { getActiveSession, endSession } from '../../../services/parkingService';
import { formatCurrency } from '../../../utils/helpers';

export default function ParkingSessionScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [session, setSession] = useState<any>(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (session?.startTime) {
        setElapsed(Math.floor((Date.now() - new Date(session.startTime).getTime()) / 60000));
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [session]);

  async function loadSession() {
    try {
      const data = await getActiveSession();
      setSession(data);
      if (data?.startTime) {
        setElapsed(Math.floor((Date.now() - new Date(data.startTime).getTime()) / 60000));
      }
    } catch (e) {
      // No active session
    } finally {
      setLoading(false);
    }
  }

  const handleEnd = () => {
    Alert.alert(t('parking.session.endConfirm'), t('parking.session.endConfirmMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('parking.session.endSession'), style: 'destructive', onPress: async () => {
          try {
            const result = await endSession(session.id);
            Alert.alert(t('parking.session.ended'), `${t('common.total')}: ${formatCurrency(result.finalAmount)}`);
            navigation.goBack();
          } catch (e) {
            Alert.alert(t('common.error'), (e as Error).message || t('common.genericError'));
          }
        }
      },
    ]);
  };

  if (loading) return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /></View>;
  if (!session) return <View style={[styles.center, { backgroundColor: colors.background }]}><MaterialCommunityIcons name="car-off" size={48} color={colors.textSecondary} /><AccessibleText style={{ color: colors.textSecondary, marginTop: 12, fontSize: 16 }}>{t('parking.session.noActive')}</AccessibleText></View>;

  const costSoFar = Math.ceil(elapsed / 60) * (session.amountEGP || 15);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="car" size={28} color={colors.primary} />
          <View style={styles.headerText}>
            <AccessibleText style={[styles.facilityName, { color: colors.text }]}>{session.facilityName}</AccessibleText>
            <AccessibleText style={[styles.plate, { color: colors.textSecondary }]}>{session.vehiclePlate}</AccessibleText>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: '#22C55E20' }]}>
            <AccessibleText style={[styles.statusText, { color: '#22C55E' }]}>{t('parking.session.active')}</AccessibleText>
          </View>
        </View>
      </Card>

      <Card style={styles.card}>
        <SessionTimer startTime={session.startTime} endTime={session.endTime} onTimeUp={() => {}} />
      </Card>

      <Card style={styles.card}>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <AccessibleText style={[styles.statLabel, { color: colors.textSecondary }]}>{t('parking.session.elapsed')}</AccessibleText>
            <AccessibleText style={[styles.statValue, { color: colors.text }]}>{elapsed} {t('units.min')}</AccessibleText>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <AccessibleText style={[styles.statLabel, { color: colors.textSecondary }]}>{t('parking.session.costSoFar')}</AccessibleText>
            <AccessibleText style={[styles.statValue, { color: colors.primary }]}>{formatCurrency(costSoFar)}</AccessibleText>
          </View>
        </View>
      </Card>

      <View style={styles.buttons}>
        <Button title={t('parking.session.extend')} onPress={() => Alert.alert(t('parking.session.extend'), t('parking.session.extendMsg'))} variant="secondary" fullWidth icon="clock-plus" />
        <Button title={t('parking.session.endSession')} onPress={handleEnd} variant="danger" fullWidth icon="stop-circle" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingTop: 12, paddingBottom: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { marginHorizontal: 16, marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerText: { flex: 1 },
  facilityName: { fontSize: 18, fontWeight: '700' },
  plate: { fontSize: 14, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 12 },
  statValue: { fontSize: 20, fontWeight: '700', marginTop: 4 },
  divider: { width: 1, height: 40 },
  buttons: { padding: 16, gap: 12 },
});
