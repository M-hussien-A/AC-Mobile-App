/**
 * IncidentMarker - Map marker for traffic incidents
 *
 * Shows a warning-triangle icon coloured by severity.
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Marker, Callout } from '../../utils/MapView';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme';
import { severity as severityColors } from '../../theme';
import type { Incident, IncidentSeverity } from '../../types';

// ── Helpers ───────────────────────────────────────────────────

function getSeverityColor(sev: IncidentSeverity): string {
  switch (sev) {
    case 'critical':
      return severityColors.critical;
    case 'major':
      return '#F97316'; // orange-500
    case 'minor':
      return severityColors.warning;
    case 'info':
      return severityColors.info;
    default:
      return severityColors.info;
  }
}

// ── Props ─────────────────────────────────────────────────────

export interface IncidentMarkerProps {
  incident: Incident;
  onPress?: (incident: Incident) => void;
}

// ── Component ─────────────────────────────────────────────────

const IncidentMarker: React.FC<IncidentMarkerProps> = ({ incident, onPress }) => {
  const { i18n } = useTranslation();
  const theme = useAppTheme();
  const isAr = i18n.language === 'ar';
  const color = getSeverityColor(incident.severity);
  const displayTitle = isAr ? incident.titleAr : incident.title;
  const displayDesc = isAr ? incident.descriptionAr : incident.description;

  return (
    <Marker
      coordinate={{
        latitude: incident.location.latitude,
        longitude: incident.location.longitude,
      }}
      tracksViewChanges={false}
      onPress={() => onPress?.(incident)}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      {/* Triangle icon */}
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <MaterialCommunityIcons name="alert" size={18} color="#FFFFFF" />
      </View>

      {/* Callout */}
      <Callout tooltip style={styles.calloutContainer}>
        <View style={[styles.callout, { backgroundColor: theme.palette.card }]}>
          <View style={styles.calloutHeader}>
            <View style={[styles.severityBadge, { backgroundColor: color }]}>
              <Text style={styles.severityText}>
                {incident.severity.toUpperCase()}
              </Text>
            </View>
            <Text
              style={[styles.typeText, { color: theme.palette.textSecondary }]}
              numberOfLines={1}
            >
              {incident.type.replace(/_/g, ' ')}
            </Text>
          </View>

          <Text
            style={[styles.calloutTitle, { color: theme.palette.text }]}
            numberOfLines={2}
          >
            {displayTitle}
          </Text>

          {displayDesc ? (
            <Text
              style={[styles.calloutDesc, { color: theme.palette.textSecondary }]}
              numberOfLines={3}
            >
              {displayDesc}
            </Text>
          ) : null}

          {/* Arrow */}
          <View style={[styles.calloutArrow, { borderTopColor: theme.palette.card }]} />
        </View>
      </Callout>
    </Marker>
  );
};

// ── Styles ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      },
      android: { elevation: 4 },
    }),
  },
  calloutContainer: {
    width: 240,
  },
  callout: {
    borderRadius: 12,
    padding: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: { elevation: 5 },
    }),
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  severityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  typeText: {
    fontSize: 12,
    textTransform: 'capitalize',
    flex: 1,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  calloutDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  calloutArrow: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});

export default React.memo(IncidentMarker);
