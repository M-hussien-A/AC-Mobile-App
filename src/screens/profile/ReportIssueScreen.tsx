import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TextInput, Image, Modal, Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker } from '../../utils/MapView';
import { useThemeColors } from '../../theme';
import { Card, Button } from '../../components/common';
import { AccessibleText } from '../../components/common';
import { submitReport } from '../../services/reportService';

const CATEGORIES = [
  { key: 'roadCondition', icon: 'road-variant' },
  { key: 'signalMalfunction', icon: 'traffic-light' },
  { key: 'pothole', icon: 'circle-off-outline' },
  { key: 'hazard', icon: 'alert-outline' },
  { key: 'other', icon: 'dots-horizontal-circle' },
];

export default function ReportIssueScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState({ latitude: 30.0194, longitude: 31.76 });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [refNumber, setRefNumber] = useState('');

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsEditing: true });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!category || !description) return;
    setLoading(true);
    try {
      const result = await submitReport({ category, description, lat: location.latitude, lng: location.longitude, photoUri: photo || undefined });
      setRefNumber(result.referenceNumber);
      setShowSuccess(true);
    } catch (err: any) {
      Alert.alert(
        t('common.error'),
        err?.message ?? t('report.submitError', 'Failed to submit report. Please try again.'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <AccessibleText style={[styles.sectionTitle, { color: colors.text }]}>{t('report.selectCategory')}</AccessibleText>
          <View style={styles.categories}>
            {CATEGORIES.map(({ key, icon }) => (
              <Pressable key={key} onPress={() => setCategory(key)} style={[styles.categoryBtn, { backgroundColor: category === key ? colors.primary : colors.surface, borderColor: category === key ? colors.primary : colors.border }]}>
                <MaterialCommunityIcons name={icon as any} size={24} color={category === key ? '#fff' : colors.primary} />
                <AccessibleText style={[styles.categoryText, { color: category === key ? '#fff' : colors.text }]}>{t(`report.categories.${key}`)}</AccessibleText>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card style={styles.card}>
          <AccessibleText style={[styles.sectionTitle, { color: colors.text }]}>{t('report.photo')}</AccessibleText>
          {photo ? (
            <View>
              <Image source={{ uri: photo }} style={styles.photoPreview} />
              <Button title={t('report.removePhoto')} onPress={() => setPhoto(null)} variant="secondary" size="sm" />
            </View>
          ) : (
            <View style={styles.photoButtons}>
              <Button title={t('report.takePhoto')} onPress={takePhoto} variant="secondary" icon="camera" />
              <Button title={t('report.selectFromGallery')} onPress={pickImage} variant="secondary" icon="image" />
            </View>
          )}
        </Card>

        <Card style={styles.card}>
          <AccessibleText style={[styles.sectionTitle, { color: colors.text }]}>{t('report.location')}</AccessibleText>
          <MapView
            style={styles.map}
            initialRegion={{ ...location, latitudeDelta: 0.005, longitudeDelta: 0.005 }}
            onPress={(e: any) => setLocation(e.nativeEvent.coordinate)}
          >
            <Marker coordinate={location} draggable onDragEnd={(e: any) => setLocation(e.nativeEvent.coordinate)} />
          </MapView>
          <AccessibleText style={[styles.coords, { color: colors.textSecondary }]}>
            {location.latitude.toFixed(5)}° N, {location.longitude.toFixed(5)}° E
          </AccessibleText>
        </Card>

        <Card style={styles.card}>
          <AccessibleText style={[styles.sectionTitle, { color: colors.text }]}>{t('report.description')}</AccessibleText>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder={t('report.descriptionPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Card>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.divider }]}>
        <Button title={t('report.submit')} onPress={handleSubmit} variant="primary" loading={loading} fullWidth disabled={!category || !description} icon="send" />
      </View>

      <Modal visible={showSuccess} animationType="slide" transparent onRequestClose={() => { setShowSuccess(false); navigation.goBack(); }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.successCard, { backgroundColor: colors.surface }]}>
            <MaterialCommunityIcons name="check-circle" size={60} color="#22C55E" />
            <AccessibleText style={[styles.successTitle, { color: colors.text }]}>{t('report.submitted')}</AccessibleText>
            <AccessibleText style={[styles.refNum, { color: colors.primary }]}>#{refNumber}</AccessibleText>
            <AccessibleText style={[styles.successMsg, { color: colors.textSecondary }]}>{t('report.submittedMsg')}</AccessibleText>
            <Button title={t('common.done')} onPress={() => { setShowSuccess(false); navigation.goBack(); }} variant="primary" fullWidth />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  card: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryBtn: { alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, width: '30%' },
  categoryText: { fontSize: 11, marginTop: 4, textAlign: 'center' },
  photoButtons: { flexDirection: 'row', gap: 12 },
  photoPreview: { width: '100%', height: 200, borderRadius: 12, marginBottom: 8 },
  map: { height: 150, borderRadius: 12, marginBottom: 8 },
  coords: { fontSize: 12, textAlign: 'center' },
  textInput: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 14, minHeight: 100 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 24 },
  successCard: { width: '100%', borderRadius: 24, padding: 24, alignItems: 'center', gap: 12 },
  successTitle: { fontSize: 22, fontWeight: '700' },
  refNum: { fontSize: 18, fontWeight: '600' },
  successMsg: { fontSize: 14, textAlign: 'center' },
});
