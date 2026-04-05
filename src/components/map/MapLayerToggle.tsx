/**
 * MapLayerToggle - FAB + modal layer-selection panel
 *
 * Allows the user to toggle visibility of various map data layers.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme';

// ── Layer definitions ─────────────────────────────────────────

interface LayerDefinition {
  key: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  labelKey: string;
}

const LAYERS: LayerDefinition[] = [
  { key: 'trafficFlow', icon: 'traffic-light', labelKey: 'layers.trafficFlow' },
  { key: 'incidents', icon: 'alert-circle', labelKey: 'layers.incidents' },
  { key: 'dms', icon: 'message-alert', labelKey: 'layers.dms' },
  { key: 'cctv', icon: 'cctv', labelKey: 'layers.cctv' },
  { key: 'queueWarnings', icon: 'car-multiple', labelKey: 'layers.queueWarnings' },
  { key: 'closures', icon: 'road-variant', labelKey: 'layers.closures' },
  { key: 'workZones', icon: 'hard-hat', labelKey: 'layers.workZones' },
  { key: 'speedCameras', icon: 'camera-timer', labelKey: 'layers.speedCameras' },
  { key: 'weather', icon: 'weather-partly-cloudy', labelKey: 'layers.weather' },
];

// Fallback labels when i18n keys are missing
const FALLBACK_LABELS: Record<string, string> = {
  'layers.trafficFlow': 'Traffic Flow',
  'layers.incidents': 'Incidents',
  'layers.dms': 'DMS Signs',
  'layers.cctv': 'CCTV Cameras',
  'layers.queueWarnings': 'Queue Warnings',
  'layers.closures': 'Road Closures',
  'layers.workZones': 'Work Zones',
  'layers.speedCameras': 'Speed Cameras',
  'layers.weather': 'Weather',
};

// ── Props ─────────────────────────────────────────────────────

export interface MapLayerToggleProps {
  activeLayers: string[];
  onToggleLayer: (layerKey: string) => void;
}

// ── Component ─────────────────────────────────────────────────

const MapLayerToggle: React.FC<MapLayerToggleProps> = ({ activeLayers, onToggleLayer }) => {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();
  const theme = useAppTheme();

  const toggle = useCallback(() => setVisible((v) => !v), []);
  const close = useCallback(() => setVisible(false), []);

  const getLabel = (key: string): string => {
    const translated = t(key);
    return translated === key ? FALLBACK_LABELS[key] ?? key : translated;
  };

  return (
    <>
      {/* FAB */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: theme.brand.primary,
            shadowColor: theme.palette.shadow,
          },
        ]}
        onPress={toggle}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={t('layers.toggleLayers')}
      >
        <MaterialCommunityIcons name="layers" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Layer selection modal */}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={close}
      >
        <Pressable style={styles.overlay} onPress={close}>
          <Pressable
            style={[styles.panel, { backgroundColor: theme.palette.surface }]}
            onPress={() => {}}
          >
            {/* Header */}
            <View style={[styles.panelHeader, { borderBottomColor: theme.palette.border }]}>
              <Text style={[styles.panelTitle, { color: theme.palette.text }]}>
                {t('layers.title', 'Map Layers')}
              </Text>
              <TouchableOpacity onPress={close} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <MaterialCommunityIcons name="close" size={24} color={theme.palette.icon} />
              </TouchableOpacity>
            </View>

            {/* Layer list */}
            <ScrollView
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              {LAYERS.map((layer) => {
                const isActive = activeLayers.includes(layer.key);
                return (
                  <TouchableOpacity
                    key={layer.key}
                    style={[
                      styles.layerRow,
                      {
                        backgroundColor: isActive
                          ? theme.isDark
                            ? 'rgba(31, 78, 121, 0.25)'
                            : 'rgba(31, 78, 121, 0.08)'
                          : 'transparent',
                        borderColor: isActive ? theme.brand.primary : theme.palette.border,
                      },
                    ]}
                    onPress={() => onToggleLayer(layer.key)}
                    activeOpacity={0.7}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isActive }}
                  >
                    <MaterialCommunityIcons
                      name={layer.icon}
                      size={22}
                      color={isActive ? theme.brand.primary : theme.palette.icon}
                    />
                    <Text
                      style={[
                        styles.layerLabel,
                        {
                          color: isActive ? theme.brand.primary : theme.palette.text,
                          fontWeight: isActive ? '600' : '400',
                        },
                      ]}
                    >
                      {getLabel(layer.labelKey)}
                    </Text>
                    <MaterialCommunityIcons
                      name={isActive ? 'checkbox-marked' : 'checkbox-blank-outline'}
                      size={22}
                      color={isActive ? theme.brand.primary : theme.palette.disabled}
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

// ── Styles ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  panel: {
    maxHeight: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  layerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  layerLabel: {
    flex: 1,
    marginLeft: 14,
    fontSize: 15,
  },
});

export default React.memo(MapLayerToggle);
