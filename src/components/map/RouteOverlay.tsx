/**
 * RouteOverlay - Polyline for displaying navigation routes on the map
 *
 * Selected routes render thicker. Supports dashed styling.
 */

import React from 'react';
import { Polyline } from 'react-native-maps';
import { useAppTheme } from '../../theme';

// ── Props ─────────────────────────────────────────────────────

export interface RouteOverlayProps {
  /** Array of [latitude, longitude] pairs */
  coordinates: [number, number][];
  color?: string;
  isSelected?: boolean;
  dashed?: boolean;
}

// ── Component ─────────────────────────────────────────────────

const RouteOverlay: React.FC<RouteOverlayProps> = ({
  coordinates,
  color,
  isSelected = false,
  dashed = false,
}) => {
  const theme = useAppTheme();

  if (!coordinates || coordinates.length < 2) return null;

  const lineColor = color ?? (isSelected ? theme.brand.primary : theme.palette.disabled);
  const lineWidth = isSelected ? 6 : 4;

  const mappedCoords = coordinates.map(([lat, lng]) => ({
    latitude: lat,
    longitude: lng,
  }));

  return (
    <>
      {/* Shadow / outline for selected route */}
      {isSelected && (
        <Polyline
          coordinates={mappedCoords}
          strokeColor="rgba(0,0,0,0.15)"
          strokeWidth={lineWidth + 3}
          zIndex={0}
        />
      )}

      {/* Main line */}
      <Polyline
        coordinates={mappedCoords}
        strokeColor={lineColor}
        strokeWidth={lineWidth}
        lineDashPattern={dashed ? [12, 6] : undefined}
        lineCap="round"
        lineJoin="round"
        zIndex={isSelected ? 2 : 1}
      />
    </>
  );
};

export default React.memo(RouteOverlay);
