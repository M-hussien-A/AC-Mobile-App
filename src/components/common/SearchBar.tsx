/**
 * ACUD ITS Traveler Mobile App - Search Input with Icon & Clear Button
 */

import React, { useCallback } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  I18nManager,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme';

// ── Types ────────────────────────────────────────────────────────
export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  style?: StyleProp<ViewStyle>;
  autoFocus?: boolean;
}

// ── Component ────────────────────────────────────────────────────
export function SearchBar({
  value,
  onChangeText,
  placeholder,
  onSubmit,
  style,
  autoFocus = false,
}: SearchBarProps) {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const isRTL = I18nManager.isRTL;

  const handleClear = useCallback(() => {
    onChangeText('');
  }, [onChangeText]);

  const defaultPlaceholder = placeholder ?? t('common.search', 'Search...');

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.palette.surfaceVariant,
          borderColor: theme.palette.border,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
        style,
      ]}
    >
      <MaterialCommunityIcons
        name="magnify"
        size={20}
        color={theme.palette.icon}
        style={[
          styles.searchIcon,
          { [isRTL ? 'marginLeft' : 'marginRight']: 8 },
        ]}
      />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={defaultPlaceholder}
        placeholderTextColor={theme.palette.placeholder}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        autoFocus={autoFocus}
        autoCorrect={false}
        style={[
          styles.input,
          {
            color: theme.palette.text,
            textAlign: isRTL ? 'right' : 'left',
            writingDirection: isRTL ? 'rtl' : 'ltr',
          },
        ]}
        accessibilityLabel={defaultPlaceholder}
        accessibilityRole="search"
      />

      {value.length > 0 && (
        <Pressable
          onPress={handleClear}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          accessibilityRole="button"
          accessibilityLabel={t('common.clear', 'Clear')}
        >
          <MaterialCommunityIcons
            name="close-circle"
            size={18}
            color={theme.palette.icon}
          />
        </Pressable>
      )}
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    // directional margin applied inline
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
});

export default SearchBar;
