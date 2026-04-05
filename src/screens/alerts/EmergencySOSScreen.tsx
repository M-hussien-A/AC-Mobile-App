/**
 * ACUD ITS Traveler Mobile App - Emergency SOS Screen
 *
 * CRITICAL SAFETY SCREEN
 * Ultra-clear, one-hand operable emergency SOS interface with:
 * - GPS location auto-capture
 * - 3-second press-and-hold activation
 * - Emergency type selection
 * - People count stepper
 * - Emergency contact numbers
 * - Post-send confirmation with elapsed timer
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert as RNAlert,
  Platform,
  StatusBar,
  Linking,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '../../theme';
import { AlertsStackParamList } from '../../navigation/types';
import { SOSButton } from '../../components/alerts';
import { sendSOS } from '../../services/reportService';

// ── Types ──────────────────────────────────────────────────────
type Nav = NativeStackNavigationProp<AlertsStackParamList, 'EmergencySOS'>;

type EmergencyType = 'accident' | 'medical' | 'security';

interface EmergencyTypeOption {
  type: EmergencyType;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
}

// ── Constants ──────────────────────────────────────────────────
const EMERGENCY_TYPES: EmergencyTypeOption[] = [
  { type: 'accident', icon: 'car-crash', label: 'Accident' },
  { type: 'medical', icon: 'hospital', label: 'Medical' },
  { type: 'security', icon: 'shield-alert', label: 'Security' },
];

const EMERGENCY_CONTACTS = [
  { label: 'Police', number: '122', icon: 'police-badge' as const },
  { label: 'Ambulance', number: '123', icon: 'ambulance' as const },
  { label: 'Fire', number: '180', icon: 'fire-truck' as const },
];

const BG_COLOR_TOP = '#DC2626';
const BG_COLOR_BOTTOM = '#991B1B';

// ── Component ──────────────────────────────────────────────────
export default function EmergencySOSScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const colors = useThemeColors();

  // State
  const [phase, setPhase] = useState<'ready' | 'activated' | 'sent' | 'cancelled'>('ready');
  const [selectedType, setSelectedType] = useState<EmergencyType | null>(null);
  const [peopleCount, setPeopleCount] = useState(1);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sending, setSending] = useState(false);

  // GPS mock
  const gpsLat = 30.0194;
  const gpsLng = 31.76;
  const locationLabel = 'Government District, NAC';

  // Pulse animation for ready state
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (phase === 'ready') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.06,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [phase, pulseAnim]);

  // Elapsed timer after SOS sent
  useEffect(() => {
    if (phase !== 'sent') return;
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // ── Handlers ───────────────────────────────────────────────
  const handleSOSActivated = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setPhase('activated');
  }, []);

  const handleSendSOS = useCallback(async () => {
    if (!selectedType) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setSending(true);
    try {
      const result = await sendSOS(selectedType, gpsLat, gpsLng, peopleCount);
      setReferenceNumber(result.referenceNumber);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPhase('sent');
    } catch {
      RNAlert.alert(
        t('alerts.sos.error.title', 'Error'),
        t('alerts.sos.error.message', 'Failed to send SOS. Please try calling emergency services directly.'),
      );
    } finally {
      setSending(false);
    }
  }, [selectedType, peopleCount, t]);

  const handleCancelSOS = useCallback(() => {
    RNAlert.alert(
      t('alerts.sos.cancel.title', 'Cancel SOS?'),
      t('alerts.sos.cancel.message', 'Are you sure you want to cancel the SOS request?'),
      [
        { text: t('alerts.sos.cancel.no', 'No'), style: 'cancel' },
        {
          text: t('alerts.sos.cancel.yes', 'Yes, Cancel'),
          style: 'destructive',
          onPress: () => {
            setPhase('cancelled');
            setTimeout(() => navigation.goBack(), 1500);
          },
        },
      ],
    );
  }, [navigation, t]);

  const handleCallEmergency = useCallback((number: string) => {
    Linking.openURL(`tel:${number}`);
  }, []);

  const incrementPeople = useCallback(() => {
    setPeopleCount((c) => Math.min(c + 1, 50));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const decrementPeople = useCallback(() => {
    setPeopleCount((c) => Math.max(c - 1, 1));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const formatElapsed = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ── Sent Confirmation ──────────────────────────────────────
  if (phase === 'sent') {
    return (
      <View style={[styles.container, styles.sentContainer]}>
        <StatusBar barStyle="light-content" />
        <ScrollView
          contentContainerStyle={styles.sentScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Success Icon */}
          <View style={styles.successCircle}>
            <MaterialCommunityIcons name="check-bold" size={64} color="#FFFFFF" />
          </View>

          <Text style={styles.sentTitle}>
            {t('alerts.sos.sent.title', 'SOS Sent')}
          </Text>
          <Text style={styles.sentSubtitle}>
            {t('alerts.sos.sent.subtitle', 'Help is on the way')}
          </Text>

          {/* Reference Number */}
          <View style={styles.refBox}>
            <Text style={styles.refLabel}>
              {t('alerts.sos.sent.reference', 'Reference Number')}
            </Text>
            <Text style={styles.refNumber}>{referenceNumber}</Text>
          </View>

          {/* Elapsed Timer */}
          <View style={styles.timerSection}>
            <Text style={styles.timerLabel}>
              {t('alerts.sos.sent.elapsed', 'Time since SOS')}
            </Text>
            <Text style={styles.timerValue}>{formatElapsed(elapsedSeconds)}</Text>
          </View>

          {/* Location */}
          <View style={styles.sentLocationRow}>
            <MaterialCommunityIcons name="map-marker" size={20} color="rgba(255,255,255,0.8)" />
            <Text style={styles.sentLocationText}>
              {gpsLat.toFixed(4)}° N, {gpsLng.toFixed(4)}° E
            </Text>
          </View>

          {/* Emergency Contacts */}
          <Text style={styles.sentSectionTitle}>
            {t('alerts.sos.emergencyContacts', 'Emergency Contacts')}
          </Text>
          <View style={styles.contactsRow}>
            {EMERGENCY_CONTACTS.map((contact) => (
              <Pressable
                key={contact.number}
                onPress={() => handleCallEmergency(contact.number)}
                style={styles.contactChip}
                accessibilityRole="button"
                accessibilityLabel={`${t(`alerts.sos.contacts.${contact.label.toLowerCase()}`, contact.label)}: ${contact.number}`}
              >
                <MaterialCommunityIcons name={contact.icon} size={20} color="#FFFFFF" />
                <Text style={styles.contactLabel}>{contact.label}</Text>
                <Text style={styles.contactNumber}>{contact.number}</Text>
              </Pressable>
            ))}
          </View>

          {/* Cancel SOS Button */}
          <Pressable
            onPress={handleCancelSOS}
            style={styles.cancelSOSButton}
            accessibilityRole="button"
            accessibilityLabel={t('alerts.sos.cancel.button', 'Cancel SOS')}
          >
            <Text style={styles.cancelSOSText}>
              {t('alerts.sos.cancel.button', 'Cancel SOS')}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // ── Cancelled State ────────────────────────────────────────
  if (phase === 'cancelled') {
    return (
      <View style={[styles.container, { backgroundColor: BG_COLOR_TOP }]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.centeredContent}>
          <MaterialCommunityIcons name="close-circle" size={64} color="rgba(255,255,255,0.8)" />
          <Text style={styles.sentTitle}>
            {t('alerts.sos.cancelled', 'SOS Cancelled')}
          </Text>
        </View>
      </View>
    );
  }

  // ── Ready / Activated Phase ────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: BG_COLOR_TOP }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* GPS Location Display */}
        <View style={styles.locationCard}>
          <MaterialCommunityIcons name="crosshairs-gps" size={18} color="rgba(255,255,255,0.9)" />
          <View style={styles.locationTextGroup}>
            <Text style={styles.locationCoords}>
              {gpsLat.toFixed(4)}° N, {gpsLng.toFixed(4)}° E
            </Text>
            <Text style={styles.locationName}>{locationLabel}</Text>
          </View>
        </View>

        {/* SOS Button */}
        <Animated.View
          style={[
            styles.sosSection,
            phase === 'ready' && { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <SOSButton
            onActivate={handleSOSActivated}
            disabled={phase === 'activated' && sending}
          />
        </Animated.View>

        <Text style={styles.instructionText}>
          {phase === 'ready'
            ? t('alerts.sos.instruction', 'Press and hold for 3 seconds')
            : t('alerts.sos.selectType', 'Select emergency type and send')}
        </Text>

        {/* Emergency Type Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {t('alerts.sos.emergencyType', 'Emergency Type')}
          </Text>
          <View style={styles.typeRow}>
            {EMERGENCY_TYPES.map((option) => {
              const isSelected = selectedType === option.type;
              return (
                <Pressable
                  key={option.type}
                  onPress={() => {
                    setSelectedType(option.type);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }}
                  style={[
                    styles.typeButton,
                    isSelected && styles.typeButtonSelected,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={t(`alerts.sos.types.${option.type}`, option.label)}
                >
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={32}
                    color={isSelected ? BG_COLOR_TOP : '#FFFFFF'}
                  />
                  <Text
                    style={[
                      styles.typeLabel,
                      isSelected && styles.typeLabelSelected,
                    ]}
                  >
                    {t(`alerts.sos.types.${option.type}`, option.label)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* People Count Stepper */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {t('alerts.sos.peopleCount', 'Number of People')}
          </Text>
          <View style={styles.stepperRow}>
            <Pressable
              onPress={decrementPeople}
              style={[styles.stepperButton, peopleCount <= 1 && styles.stepperButtonDisabled]}
              disabled={peopleCount <= 1}
              accessibilityRole="button"
              accessibilityLabel={t('alerts.sos.decrease', 'Decrease')}
            >
              <MaterialCommunityIcons
                name="minus"
                size={28}
                color={peopleCount <= 1 ? 'rgba(255,255,255,0.3)' : '#FFFFFF'}
              />
            </Pressable>
            <Text style={styles.stepperValue}>{peopleCount}</Text>
            <Pressable
              onPress={incrementPeople}
              style={styles.stepperButton}
              accessibilityRole="button"
              accessibilityLabel={t('alerts.sos.increase', 'Increase')}
            >
              <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* Emergency Contacts */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {t('alerts.sos.emergencyContacts', 'Emergency Contacts')}
          </Text>
          <View style={styles.contactsRow}>
            {EMERGENCY_CONTACTS.map((contact) => (
              <Pressable
                key={contact.number}
                onPress={() => handleCallEmergency(contact.number)}
                style={styles.contactChip}
                accessibilityRole="button"
                accessibilityLabel={`${t(`alerts.sos.contacts.${contact.label.toLowerCase()}`, contact.label)}: ${contact.number}`}
              >
                <MaterialCommunityIcons name={contact.icon} size={20} color="#FFFFFF" />
                <Text style={styles.contactLabel}>{contact.label}</Text>
                <Text style={styles.contactNumber}>{contact.number}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Send SOS / Cancel Buttons (visible after activation) */}
        {phase === 'activated' && (
          <View style={styles.actionButtons}>
            <Pressable
              onPress={handleSendSOS}
              disabled={!selectedType || sending}
              style={[
                styles.sendButton,
                (!selectedType || sending) && styles.sendButtonDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel={t('alerts.sos.send', 'Send SOS')}
            >
              <MaterialCommunityIcons name="send" size={22} color={BG_COLOR_TOP} />
              <Text style={styles.sendButtonText}>
                {sending
                  ? t('alerts.sos.sending', 'Sending...')
                  : t('alerts.sos.send', 'Send SOS')}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setPhase('ready');
                setSelectedType(null);
                setPeopleCount(1);
              }}
              style={styles.cancelButton}
              accessibilityRole="button"
              accessibilityLabel={t('alerts.sos.cancel.label', 'Cancel')}
            >
              <Text style={styles.cancelButtonText}>
                {t('alerts.sos.cancel.label', 'Cancel')}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Bottom spacer for one-hand reach */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR_TOP,
  },
  mainScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  centeredContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },

  // GPS Location
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    marginBottom: 24,
  },
  locationTextGroup: {
    flex: 1,
  },
  locationCoords: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  locationName: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginTop: 2,
  },

  // SOS Section
  sosSection: {
    marginBottom: 12,
  },
  instructionText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 28,
  },

  // Sections
  section: {
    width: '100%',
    marginBottom: 24,
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },

  // Emergency Type Buttons
  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    gap: 8,
    minHeight: 88,
  },
  typeButtonSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  typeLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  typeLabelSelected: {
    color: BG_COLOR_TOP,
  },

  // Stepper
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  stepperButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonDisabled: {
    opacity: 0.4,
  },
  stepperValue: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    minWidth: 48,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },

  // Emergency Contacts
  contactsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  contactChip: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 4,
  },
  contactLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '600',
  },
  contactNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  // Action Buttons
  actionButtons: {
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: BG_COLOR_TOP,
    fontSize: 18,
    fontWeight: '800',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // ── Sent Confirmation ──────────────────────────────────
  sentContainer: {
    backgroundColor: '#166534',
  },
  sentScrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  sentTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
  },
  sentSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 28,
  },
  refBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  refLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  refNumber: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  timerValue: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  sentLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 28,
  },
  sentLocationText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  sentSectionTitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  cancelSOSButton: {
    marginTop: 28,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    width: '100%',
  },
  cancelSOSText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  bottomSpacer: {
    height: 40,
  },
});
