/**
 * MultiModalTimeline - Vertical timeline for multimodal route steps
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../theme';
import type { RouteStep, TravelMode } from '../../types';

export interface MultiModalTimelineProps {
  steps: RouteStep[];
}

const MODE_ICONS: Record<TravelMode, keyof typeof MaterialCommunityIcons.glyphMap> = {
  driving: 'car',
  transit: 'bus',
  walking: 'walk',
  cycling: 'bike',
  multimodal: 'swap-horizontal',
};

const MODE_COLORS: Record<TravelMode, string> = {
  driving: '#3B82F6',
  transit: '#8B5CF6',
  walking: '#22C55E',
  cycling: '#F59E0B',
  multimodal: '#EC4899',
};

export function MultiModalTimeline({ steps }: MultiModalTimelineProps) {
  const theme = useAppTheme();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const modeIcon = MODE_ICONS[step.mode] ?? 'map-marker';
        const modeColor = MODE_COLORS[step.mode] ?? theme.brand.primary;
        const durationMin = Math.round(step.duration / 60);
        const instruction = isAr ? step.instructionAr : step.instruction;

        return (
          <View key={index} style={styles.stepRow}>
            {/* Timeline column */}
            <View style={styles.timelineColumn}>
              <View
                style={[styles.iconBubble, { backgroundColor: modeColor + '20' }]}
              >
                <MaterialCommunityIcons
                  name={modeIcon}
                  size={18}
                  color={modeColor}
                />
              </View>
              {!isLast && (
                <View style={[styles.connector, { backgroundColor: modeColor + '40' }]} />
              )}
            </View>

            {/* Content column */}
            <View style={[styles.contentColumn, !isLast && styles.contentColumnSpaced]}>
              {/* Mode label & duration */}
              <View style={styles.stepHeader}>
                <Text style={[styles.modeLabel, { color: modeColor }]}>
                  {step.mode === 'walking'
                    ? t('journey.timeline.walk')
                    : step.mode === 'transit' && step.transitDetails
                      ? t('journey.timeline.board', { route: step.transitDetails.routeName })
                      : instruction}
                </Text>
                <Text style={[styles.durationBadge, { color: theme.palette.textSecondary }]}>
                  {t('journey.timeline.duration', { minutes: durationMin })}
                </Text>
              </View>

              {/* Transit details */}
              {step.transitDetails && (
                <View style={styles.transitDetails}>
                  <Text
                    style={[styles.detailText, { color: theme.palette.textSecondary }]}
                    numberOfLines={1}
                  >
                    {step.transitDetails.departureStation} → {step.transitDetails.arrivalStation}
                  </Text>
                  <Text style={[styles.stopsText, { color: theme.palette.textTertiary }]}>
                    {step.transitDetails.numStops} {t('transit.stations')}
                  </Text>
                </View>
              )}

              {/* Transfer indicator between steps */}
              {!isLast &&
                steps[index + 1] &&
                step.mode !== steps[index + 1].mode && (
                  <View style={styles.transferRow}>
                    <MaterialCommunityIcons
                      name="swap-horizontal"
                      size={14}
                      color={theme.palette.textTertiary}
                    />
                    <Text
                      style={[
                        styles.transferText,
                        { color: theme.palette.textTertiary },
                      ]}
                    >
                      {t('journey.timeline.transfer')}
                    </Text>
                  </View>
                )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  stepRow: {
    flexDirection: 'row',
  },
  timelineColumn: {
    width: 40,
    alignItems: 'center',
  },
  iconBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connector: {
    flex: 1,
    width: 3,
    minHeight: 20,
    borderRadius: 1.5,
  },
  contentColumn: {
    flex: 1,
    paddingLeft: 12,
    paddingTop: 4,
  },
  contentColumnSpaced: {
    paddingBottom: 16,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  modeLabel: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  durationBadge: {
    fontSize: 12,
    fontWeight: '500',
  },
  transitDetails: {
    marginTop: 6,
    gap: 2,
  },
  detailText: {
    fontSize: 13,
  },
  stopsText: {
    fontSize: 12,
  },
  transferRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  transferText: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default MultiModalTimeline;
