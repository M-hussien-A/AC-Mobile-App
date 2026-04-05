/**
 * LOSIndicator - Level of Service colored dot indicator
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme';
import type { LOSGrade } from '../../types';

export interface LOSIndicatorProps {
  los: LOSGrade;
  size?: number;
}

function getLOSColor(los: LOSGrade, theme: ReturnType<typeof useAppTheme>): string {
  switch (los) {
    case 'A':
    case 'B':
      return theme.los.green;
    case 'C':
      return theme.los.yellow;
    case 'D':
    case 'E':
      return theme.los.red;
    case 'F':
      return theme.los.black;
  }
}

export function LOSIndicator({ los, size = 12 }: LOSIndicatorProps) {
  const theme = useAppTheme();
  const { t } = useTranslation();

  const color = getLOSColor(los, theme);
  const description = t(`traffic.los.description.${los}` as const);

  return (
    <View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
      accessibilityRole="text"
      accessibilityLabel={t('traffic.los.label', { grade: los })}
      accessibilityHint={description}
    />
  );
}

const styles = StyleSheet.create({
  dot: {
    // dimensions applied inline
  },
});

export default LOSIndicator;
