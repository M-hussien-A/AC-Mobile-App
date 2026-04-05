/**
 * QRCodeDisplay - Mock QR code display with styled pattern
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme';

export interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

/**
 * Generates a deterministic grid pattern from the value string.
 * This is a visual mock, not a scannable QR code.
 */
function generatePattern(value: string, gridSize: number): boolean[][] {
  const grid: boolean[][] = [];
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) & 0x7fffffff;
  }

  for (let row = 0; row < gridSize; row++) {
    grid[row] = [];
    for (let col = 0; col < gridSize; col++) {
      // Finder patterns at corners (typical QR)
      const isFinderArea =
        (row < 3 && col < 3) ||
        (row < 3 && col >= gridSize - 3) ||
        (row >= gridSize - 3 && col < 3);

      if (isFinderArea) {
        const innerRow = row % (gridSize - 4) < 3 ? row : row - (gridSize - 3);
        const innerCol = col % (gridSize - 4) < 3 ? col : col - (gridSize - 3);
        const isBorder =
          innerRow === 0 || innerRow === 2 || innerCol === 0 || innerCol === 2;
        const isCenter = innerRow === 1 && innerCol === 1;
        grid[row][col] = isBorder || isCenter;
      } else {
        // Pseudo-random data pattern from hash
        hash = (hash * 1103515245 + 12345) & 0x7fffffff;
        grid[row][col] = hash % 3 !== 0;
      }
    }
  }
  return grid;
}

export function QRCodeDisplay({ value, size = 200 }: QRCodeDisplayProps) {
  const theme = useAppTheme();
  const { t } = useTranslation();

  const gridSize = 15;
  const cellSize = (size - 32) / gridSize; // 16px padding each side

  const pattern = useMemo(() => generatePattern(value, gridSize), [value]);

  const darkColor = theme.isDark ? '#FFFFFF' : '#000000';
  const lightColor = theme.isDark ? theme.palette.surface : '#FFFFFF';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.palette.card,
          borderColor: theme.palette.border,
        },
      ]}
      accessibilityRole="image"
      accessibilityLabel={t('payment.qr.title')}
    >
      <Text style={[styles.title, { color: theme.palette.text }]}>
        {t('payment.qr.title')}
      </Text>

      <View
        style={[
          styles.qrBox,
          {
            width: size,
            height: size,
            backgroundColor: lightColor,
          },
        ]}
      >
        <View style={styles.grid}>
          {pattern.map((row, rowIdx) => (
            <View key={rowIdx} style={styles.gridRow}>
              {row.map((filled, colIdx) => (
                <View
                  key={colIdx}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: filled ? darkColor : lightColor,
                  }}
                />
              ))}
            </View>
          ))}
        </View>
      </View>

      <Text
        style={[styles.subtitle, { color: theme.palette.textSecondary }]}
        numberOfLines={1}
      >
        {t('payment.qr.scanBelow')}
      </Text>

      <Text
        style={[styles.valueText, { color: theme.palette.textTertiary }]}
        numberOfLines={1}
        ellipsizeMode="middle"
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  qrBox: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    gap: 0,
  },
  gridRow: {
    flexDirection: 'row',
  },
  subtitle: {
    fontSize: 13,
  },
  valueText: {
    fontSize: 11,
    fontFamily: 'monospace',
    maxWidth: '90%',
  },
});

export default QRCodeDisplay;
