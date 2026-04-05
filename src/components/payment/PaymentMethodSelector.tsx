/**
 * PaymentMethodSelector - Horizontal payment method picker
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../theme';

export type PaymentMethodOption = 'wallet' | 'card' | 'qr' | 'nfc';

export interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodOption;
  onSelect: (method: PaymentMethodOption) => void;
}

interface MethodConfig {
  key: PaymentMethodOption;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  labelKey: string;
}

const METHODS: MethodConfig[] = [
  { key: 'wallet', icon: 'wallet', labelKey: 'payment.method.wallet' },
  { key: 'card', icon: 'credit-card', labelKey: 'payment.method.card' },
  { key: 'qr', icon: 'qrcode', labelKey: 'payment.method.qr' },
  { key: 'nfc', icon: 'nfc', labelKey: 'payment.method.nfc' },
];

export function PaymentMethodSelector({ selectedMethod, onSelect }: PaymentMethodSelectorProps) {
  const theme = useAppTheme();
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {METHODS.map((method) => {
        const isSelected = selectedMethod === method.key;

        return (
          <Pressable
            key={method.key}
            onPress={() => onSelect(method.key)}
            style={[
              styles.pill,
              {
                backgroundColor: isSelected
                  ? theme.brand.primary
                  : theme.palette.surfaceVariant,
                borderColor: isSelected
                  ? theme.brand.primary
                  : theme.palette.border,
              },
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={t(method.labelKey)}
          >
            <MaterialCommunityIcons
              name={method.icon}
              size={22}
              color={isSelected ? '#FFFFFF' : theme.palette.icon}
            />
            <Text
              style={[
                styles.pillLabel,
                {
                  color: isSelected ? '#FFFFFF' : theme.palette.text,
                },
              ]}
            >
              {t(method.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 80,
  },
  pillLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PaymentMethodSelector;
