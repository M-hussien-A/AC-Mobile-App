/**
 * DMSMarker - Map marker for Dynamic Message Signs
 *
 * Shows a blue sign icon. Callout displays the current message text.
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Marker, Callout } from '../../utils/MapView';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme';
import type { DMSMessage } from '../../types';

// ── Constants ─────────────────────────────────────────────────

const DMS_BLUE = '#2563EB';

// ── Props ─────────────────────────────────────────────────────

export interface DMSMarkerProps {
  dms: DMSMessage;
  onPress?: (dms: DMSMessage) => void;
}

// ── Component ─────────────────────────────────────────────────

const DMSMarker: React.FC<DMSMarkerProps> = ({ dms, onPress }) => {
  const { i18n } = useTranslation();
  const theme = useAppTheme();
  const isAr = i18n.language === 'ar';
  const currentMessage = isAr ? dms.messageAr : dms.message;
  const isActive = dms.status === 'active';

  return (
    <Marker
      coordinate={{
        latitude: dms.location.latitude,
        longitude: dms.location.longitude,
      }}
      tracksViewChanges={false}
      onPress={() => onPress?.(dms)}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      {/* DMS icon */}
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isActive ? DMS_BLUE : '#9CA3AF',
          },
        ]}
      >
        <MaterialCommunityIcons name="sign-text" size={18} color="#FFFFFF" />
      </View>

      {/* Callout */}
      <Callout tooltip style={styles.calloutContainer}>
        <View style={[styles.callout, { backgroundColor: theme.palette.card }]}>
          {/* Header */}
          <View style={styles.calloutHeader}>
            <MaterialCommunityIcons name="sign-text" size={16} color={DMS_BLUE} />
            <Text
              style={[styles.calloutName, { color: theme.palette.text }]}
              numberOfLines={1}
            >
              {dms.signId}
            </Text>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isActive ? '#22C55E' : '#9CA3AF' },
              ]}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.palette.divider }]} />

          {/* Message */}
          <View style={[styles.messageBox, { backgroundColor: theme.isDark ? '#1a1a2e' : '#0F172A' }]}>
            <Text style={styles.messageText} numberOfLines={4}>
              {currentMessage || '--'}
            </Text>
          </View>

          {/* Timestamp */}
          <Text style={[styles.timestamp, { color: theme.palette.textTertiary }]}>
            {new Date(dms.updatedAt).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>

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
    borderRadius: 8,
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
    marginBottom: 8,
  },
  calloutName: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginLeft: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  messageBox: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  messageText: {
    color: '#FFB020',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    textAlign: 'center',
    lineHeight: 18,
  },
  timestamp: {
    fontSize: 11,
    textAlign: 'right',
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

export default React.memo(DMSMarker);
