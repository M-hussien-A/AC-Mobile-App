/**
 * JourneyPlannerScreen - Trip planning with origin/destination, mode selection,
 * route options, and departure time configuration.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Animated,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  I18nManager,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../theme';
import { JourneyStackParamList } from '../../navigation/types';
import { useJourneyStore } from '../../stores/journeyStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { planTrip } from '../../services/journeyService';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { RouteModeSelector } from '../../components/journey/RouteModeSelector';
import { TravelMode } from '../../types';

type Nav = NativeStackNavigationProp<JourneyStackParamList, 'JourneyPlanner'>;
type RouteParams = RouteProp<JourneyStackParamList, 'JourneyPlanner'>;

// ── Mock data for recent & saved locations ──────────────────────
const RECENT_LOCATIONS = [
  { id: '1', name: 'Government District', lat: 30.0194, lng: 31.76 },
  { id: '2', name: 'NAC Central Park', lat: 30.025, lng: 31.765 },
  { id: '3', name: 'Knowledge City', lat: 30.015, lng: 31.77 },
];

const SAVED_LOCATIONS = [
  { id: '1', name: 'Home', lat: 30.033, lng: 31.755, icon: 'home' as const },
  { id: '2', name: 'Work', lat: 30.019, lng: 31.761, icon: 'briefcase' as const },
];

type DepartureMode = 'now' | 'depart_at' | 'arrive_by';

export default function JourneyPlannerScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteParams>();
  const { t } = useTranslation();
  const colors = useThemeColors();

  const setCurrentPlan = useJourneyStore((s) => s.setCurrentPlan);
  const setLoading = useJourneyStore((s) => s.setLoading);
  const setError = useJourneyStore((s) => s.setError);

  const settingsAvoidTolls = useSettingsStore((s) => s.avoidTolls);
  const settingsAvoidHighways = useSettingsStore((s) => s.avoidHighways);
  const settingsAvoidWorkZones = useSettingsStore((s) => s.avoidWorkZones);

  // ── State ─────────────────────────────────────────────────────
  const [fromText, setFromText] = useState('');
  const [toText, setToText] = useState('');
  const [fromLocation, setFromLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [toLocation, setToLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [selectedMode, setSelectedMode] = useState<TravelMode>('driving');
  const [showOptions, setShowOptions] = useState(false);
  const [avoidTolls, setAvoidTolls] = useState(settingsAvoidTolls);
  const [avoidHighways, setAvoidHighways] = useState(settingsAvoidHighways);
  const [avoidWorkZones, setAvoidWorkZones] = useState(settingsAvoidWorkZones);
  const [departureMode, setDepartureMode] = useState<DepartureMode>('now');
  const [wheelchairAccess, setWheelchairAccess] = useState(false);
  const [visualImpairment, setVisualImpairment] = useState(false);
  const [isPlanning, setIsPlanning] = useState(false);
  const [fromFocused, setFromFocused] = useState(false);
  const [toFocused, setToFocused] = useState(false);

  const optionsHeight = useRef(new Animated.Value(0)).current;

  // ── Prefill from navigation params ────────────────────────────
  useEffect(() => {
    if (route.params?.destinationName) {
      setToText(route.params.destinationName);
      setToLocation({
        lat: route.params.destinationLat ?? 30.025,
        lng: route.params.destinationLng ?? 31.765,
        name: route.params.destinationName,
      });
    }
  }, [route.params]);

  // ── Options panel animation ───────────────────────────────────
  const toggleOptions = useCallback(() => {
    const toValue = showOptions ? 0 : 1;
    setShowOptions(!showOptions);
    Animated.timing(optionsHeight, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showOptions, optionsHeight]);

  const optionsMaxHeight = optionsHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 360],
  });

  // ── Use current location ──────────────────────────────────────
  const useCurrentLocation = useCallback(() => {
    const current = { lat: 30.022, lng: 31.758, name: t('journey.currentLocation') };
    setFromText(current.name);
    setFromLocation(current);
  }, [t]);

  // ── Swap fields ───────────────────────────────────────────────
  const swapLocations = useCallback(() => {
    const tempText = fromText;
    const tempLoc = fromLocation;
    setFromText(toText);
    setFromLocation(toLocation);
    setToText(tempText);
    setToLocation(tempLoc);
  }, [fromText, toText, fromLocation, toLocation]);

  // ── Select location from list ─────────────────────────────────
  const selectLocation = useCallback(
    (loc: { name: string; lat: number; lng: number }, field: 'from' | 'to') => {
      if (field === 'from') {
        setFromText(loc.name);
        setFromLocation({ lat: loc.lat, lng: loc.lng, name: loc.name });
        setFromFocused(false);
      } else {
        setToText(loc.name);
        setToLocation({ lat: loc.lat, lng: loc.lng, name: loc.name });
        setToFocused(false);
      }
    },
    [],
  );

  // ── Plan trip ─────────────────────────────────────────────────
  const handlePlanTrip = useCallback(async () => {
    if (!fromLocation && !fromText) {
      Alert.alert(t('common.error'), t('journey.from') + ' is required');
      return;
    }
    if (!toLocation && !toText) {
      Alert.alert(t('common.error'), t('journey.to') + ' is required');
      return;
    }

    const from = fromLocation || { lat: 30.022, lng: 31.758, name: fromText };
    const to = toLocation || { lat: 30.025, lng: 31.765, name: toText };

    setIsPlanning(true);
    setLoading(true);
    setError(null);

    try {
      const plan = await planTrip(from, to, selectedMode, {
        avoidTolls,
        avoidHighways,
        avoidWorkZones,
      });
      setCurrentPlan(plan);
      navigation.navigate('RouteResults', { planId: plan.id });
    } catch (err: any) {
      setError(err.message || t('common.error'));
      Alert.alert(t('common.error'), err.message || t('common.error'));
    } finally {
      setIsPlanning(false);
      setLoading(false);
    }
  }, [
    fromLocation, toLocation, fromText, toText, selectedMode,
    avoidTolls, avoidHighways, avoidWorkZones,
    navigation, setCurrentPlan, setLoading, setError, t,
  ]);

  // ── Autocomplete-like suggestions ─────────────────────────────
  const filteredRecent = (query: string) =>
    RECENT_LOCATIONS.filter((l) =>
      l.name.toLowerCase().includes(query.toLowerCase()),
    );

  const showFromSuggestions = fromFocused && fromText.length > 0;
  const showToSuggestions = toFocused && toText.length > 0;

  // ── Render ────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* From / To Fields */}
        <Card style={styles.fieldsCard}>
          {/* From field */}
          <View style={styles.fieldRow}>
            <MaterialCommunityIcons
              name="circle-outline"
              size={20}
              color={colors.primary}
              style={styles.fieldIcon}
            />
            <TextInput
              style={[styles.fieldInput, { color: colors.text, borderColor: colors.border }]}
              placeholder={t('journey.from')}
              placeholderTextColor={colors.placeholder}
              value={fromText}
              onChangeText={(text) => {
                setFromText(text);
                setFromLocation(null);
              }}
              onFocus={() => setFromFocused(true)}
              onBlur={() => setTimeout(() => setFromFocused(false), 200)}
              accessibilityLabel={t('journey.from')}
            />
            <Pressable
              onPress={useCurrentLocation}
              style={styles.gpsButton}
              accessibilityLabel={t('journey.currentLocation')}
            >
              <MaterialCommunityIcons name="crosshairs-gps" size={22} color={colors.primary} />
            </Pressable>
          </View>

          {/* From suggestions */}
          {showFromSuggestions && (
            <View style={[styles.suggestions, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {filteredRecent(fromText).map((loc) => (
                <Pressable
                  key={loc.id}
                  onPress={() => selectLocation(loc, 'from')}
                  style={styles.suggestionItem}
                >
                  <MaterialCommunityIcons name="history" size={16} color={colors.textSecondary} />
                  <Text style={[styles.suggestionText, { color: colors.text }]}>{loc.name}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Swap button */}
          <Pressable onPress={swapLocations} style={styles.swapButton} accessibilityLabel="Swap locations">
            <MaterialCommunityIcons name="swap-vertical" size={24} color={colors.primary} />
          </Pressable>

          {/* To field */}
          <View style={styles.fieldRow}>
            <MaterialCommunityIcons
              name="map-marker"
              size={20}
              color={colors.error}
              style={styles.fieldIcon}
            />
            <TextInput
              style={[styles.fieldInput, { color: colors.text, borderColor: colors.border }]}
              placeholder={t('journey.to')}
              placeholderTextColor={colors.placeholder}
              value={toText}
              onChangeText={(text) => {
                setToText(text);
                setToLocation(null);
              }}
              onFocus={() => setToFocused(true)}
              onBlur={() => setTimeout(() => setToFocused(false), 200)}
              accessibilityLabel={t('journey.to')}
            />
          </View>

          {/* To suggestions */}
          {showToSuggestions && (
            <View style={[styles.suggestions, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {filteredRecent(toText).map((loc) => (
                <Pressable
                  key={loc.id}
                  onPress={() => selectLocation(loc, 'to')}
                  style={styles.suggestionItem}
                >
                  <MaterialCommunityIcons name="history" size={16} color={colors.textSecondary} />
                  <Text style={[styles.suggestionText, { color: colors.text }]}>{loc.name}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </Card>

        {/* Recent & Saved Locations */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t('journey.savedLocations')}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {SAVED_LOCATIONS.map((loc) => (
              <Pressable
                key={loc.id}
                onPress={() => selectLocation(loc, toText ? 'from' : 'to')}
                style={[styles.chip, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
              >
                <MaterialCommunityIcons
                  name={loc.icon as any}
                  size={16}
                  color={colors.primary}
                />
                <Text style={[styles.chipText, { color: colors.text }]}>{loc.name}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 12 }]}>
            {t('journey.recentLocations')}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {RECENT_LOCATIONS.map((loc) => (
              <Pressable
                key={loc.id}
                onPress={() => selectLocation(loc, toText ? 'from' : 'to')}
                style={[styles.chip, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
              >
                <MaterialCommunityIcons name="history" size={16} color={colors.textSecondary} />
                <Text style={[styles.chipText, { color: colors.text }]}>{loc.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Mode Selector */}
        <View style={styles.section}>
          <RouteModeSelector selectedMode={selectedMode} onSelectMode={setSelectedMode} />
        </View>

        {/* Options Toggle */}
        <Pressable
          onPress={toggleOptions}
          style={[styles.optionsToggle, { borderColor: colors.border }]}
          accessibilityRole="button"
          accessibilityLabel="Route options"
        >
          <MaterialCommunityIcons name="tune-variant" size={20} color={colors.textSecondary} />
          <Text style={[styles.optionsToggleText, { color: colors.text }]}>
            {t('settings.navigationPreferences')}
          </Text>
          <MaterialCommunityIcons
            name={showOptions ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textSecondary}
          />
        </Pressable>

        {/* Options Panel (animated) */}
        <Animated.View style={[styles.optionsPanel, { maxHeight: optionsMaxHeight, overflow: 'hidden' }]}>
          <View style={[styles.optionsContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Avoid toggles */}
            <View style={styles.optionRow}>
              <Text style={[styles.optionLabel, { color: colors.text }]}>{t('journey.options.avoidTolls')}</Text>
              <Switch
                value={avoidTolls}
                onValueChange={setAvoidTolls}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={avoidTolls ? colors.primary : colors.surface}
              />
            </View>
            <View style={styles.optionRow}>
              <Text style={[styles.optionLabel, { color: colors.text }]}>{t('journey.options.avoidHighways')}</Text>
              <Switch
                value={avoidHighways}
                onValueChange={setAvoidHighways}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={avoidHighways ? colors.primary : colors.surface}
              />
            </View>
            <View style={styles.optionRow}>
              <Text style={[styles.optionLabel, { color: colors.text }]}>{t('journey.options.avoidWorkZones')}</Text>
              <Switch
                value={avoidWorkZones}
                onValueChange={setAvoidWorkZones}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={avoidWorkZones ? colors.primary : colors.surface}
              />
            </View>

            {/* Departure time */}
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <View style={styles.departureRow}>
              {(['now', 'depart_at', 'arrive_by'] as DepartureMode[]).map((mode) => {
                const labels: Record<DepartureMode, string> = {
                  now: t('journey.departure.now'),
                  depart_at: t('journey.departure.departAt'),
                  arrive_by: t('journey.departure.arriveBy'),
                };
                const isActive = departureMode === mode;
                return (
                  <Pressable
                    key={mode}
                    onPress={() => setDepartureMode(mode)}
                    style={[
                      styles.departureChip,
                      {
                        backgroundColor: isActive ? colors.primary : colors.surfaceVariant,
                        borderColor: isActive ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.departureChipText, { color: isActive ? '#FFFFFF' : colors.text }]}>
                      {labels[mode]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Accessibility */}
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <View style={styles.optionRow}>
              <View style={styles.optionLabelRow}>
                <MaterialCommunityIcons name="wheelchair-accessibility" size={18} color={colors.textSecondary} />
                <Text style={[styles.optionLabel, { color: colors.text, marginLeft: 8 }]}>
                  {t('journey.accessibility.wheelchair')}
                </Text>
              </View>
              <Switch
                value={wheelchairAccess}
                onValueChange={setWheelchairAccess}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={wheelchairAccess ? colors.primary : colors.surface}
              />
            </View>
            <View style={styles.optionRow}>
              <View style={styles.optionLabelRow}>
                <MaterialCommunityIcons name="eye-outline" size={18} color={colors.textSecondary} />
                <Text style={[styles.optionLabel, { color: colors.text, marginLeft: 8 }]}>
                  {t('journey.accessibility.visualImpairment')}
                </Text>
              </View>
              <Switch
                value={visualImpairment}
                onValueChange={setVisualImpairment}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={visualImpairment ? colors.primary : colors.surface}
              />
            </View>
          </View>
        </Animated.View>

        {/* Plan Trip Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={isPlanning ? t('common.loading') : t('journey.planTrip')}
            onPress={handlePlanTrip}
            variant="primary"
            size="lg"
            fullWidth
            loading={isPlanning}
            disabled={isPlanning}
            icon="map-marker-path"
          />
        </View>

        {/* Quick nav links */}
        <View style={styles.quickLinks}>
          <Pressable
            onPress={() => navigation.navigate('SavedRoutes')}
            style={[styles.quickLink, { borderColor: colors.border }]}
          >
            <MaterialCommunityIcons name="star-outline" size={20} color={colors.primary} />
            <Text style={[styles.quickLinkText, { color: colors.primary }]}>
              {t('journey.savedLocations')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('TripHistory')}
            style={[styles.quickLink, { borderColor: colors.border }]}
          >
            <MaterialCommunityIcons name="history" size={20} color={colors.primary} />
            <Text style={[styles.quickLinkText, { color: colors.primary }]}>
              {t('journey.recentLocations')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  fieldsCard: {
    marginBottom: 16,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldIcon: {
    marginRight: 10,
  },
  fieldInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  gpsButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  swapButton: {
    alignSelf: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  suggestions: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
    marginLeft: 30,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  suggestionText: {
    fontSize: 14,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  optionsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    gap: 8,
  },
  optionsToggleText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  optionsPanel: {},
  optionsContent: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  optionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 14,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 8,
  },
  departureRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  departureChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  departureChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  quickLinks: {
    flexDirection: 'row',
    gap: 12,
  },
  quickLink: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  quickLinkText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
