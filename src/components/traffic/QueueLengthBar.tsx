/**
 * QueueLengthBar - Horizontal bar showing queue length with color gradient
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme';

export interface QueueLengthBarProps {
  queueLength: number;
  maxLength?: number;
}

function getQueueColor(ratio: number, theme: ReturnType<typeof useAppTheme>): string {
  if (ratio <= 0.4) return theme.los.green;
  if (ratio <= 0.7) return theme.los.yellow;
  return theme.los.red;
}

export function QueueLengthBar({ queueLength, maxLength = 300 }: QueueLengthBarProps) {
  const theme = useAppTheme();
  const { t } = useTranslation();

  const ratio = Math.min(queueLength / maxLength, 1);
  const color = getQueueColor(ratio, theme);

  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel={t('traffic.queue.label', { length: Math.round(queueLength) })}
      accessibilityValue={{ min: 0, max: maxLength, now: queueLength }}
    >
      <View style={[styles.track, { backgroundColor: theme.palette.borderLight }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${ratio * 100}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
      <Text style={[styles.label, { color: theme.palette.textSecondary }]}>
        {t('traffic.queue.label', { length: Math.round(queueLength) })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default QueueLengthBar;
