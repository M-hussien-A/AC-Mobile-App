/**
 * WorkZonePolygon - Polygon overlay for work / construction zones
 *
 * Renders a semi-transparent orange polygon on the map.
 */

import React from 'react';
import { Polygon } from '../../utils/MapView';
import type { LatLng } from '../../types';

// ── Constants ─────────────────────────────────────────────────

const DEFAULT_FILL = 'rgba(249, 115, 22, 0.25)'; // orange with 25% opacity
const DEFAULT_STROKE = '#F97316'; // orange-500

// ── Props ─────────────────────────────────────────────────────

export interface WorkZonePolygonProps {
  coordinates: LatLng[];
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  tappable?: boolean;
  onPress?: () => void;
}

// ── Component ─────────────────────────────────────────────────

const WorkZonePolygon: React.FC<WorkZonePolygonProps> = ({
  coordinates,
  fillColor = DEFAULT_FILL,
  strokeColor = DEFAULT_STROKE,
  strokeWidth = 2,
  tappable = true,
  onPress,
}) => {
  if (!coordinates || coordinates.length < 3) return null;

  return (
    <Polygon
      coordinates={coordinates.map((c) => ({
        latitude: c.latitude,
        longitude: c.longitude,
      }))}
      fillColor={fillColor}
      strokeColor={strokeColor}
      strokeWidth={strokeWidth}
      tappable={tappable}
      onPress={onPress}
    />
  );
};

export default React.memo(WorkZonePolygon);
