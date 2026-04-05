import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ProfileStackParamList } from './types';
import { useThemeColors } from '../theme';
import ProfileScreen from '../screens/profile/ProfileScreen';
import WalletScreen from '../screens/profile/WalletScreen';
import TransactionHistoryScreen from '../screens/profile/TransactionHistoryScreen';
import ViolationHistoryScreen from '../screens/profile/ViolationHistoryScreen';
import ViolationPaymentScreen from '../screens/profile/ViolationPaymentScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import NotificationPreferencesScreen from '../screens/profile/NotificationPreferencesScreen';
import LanguageScreen from '../screens/profile/LanguageScreen';
import AccessibilityScreen from '../screens/profile/AccessibilityScreen';
import ReportIssueScreen from '../screens/profile/ReportIssueScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  const colors = useThemeColors();
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: t('profile.title') }} />
      <Stack.Screen name="Wallet" component={WalletScreen} options={{ title: t('profile.wallet') }} />
      <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} options={{ title: t('profile.transactions') }} />
      <Stack.Screen name="ViolationHistory" component={ViolationHistoryScreen} options={{ title: t('violations.title') }} />
      <Stack.Screen name="ViolationPayment" component={ViolationPaymentScreen} options={{ title: t('violations.pay') }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: t('settings.title') }} />
      <Stack.Screen name="NotificationPreferences" component={NotificationPreferencesScreen} options={{ title: t('settings.notifications') }} />
      <Stack.Screen name="Language" component={LanguageScreen} options={{ title: t('settings.language') }} />
      <Stack.Screen name="Accessibility" component={AccessibilityScreen} options={{ title: t('settings.accessibility') }} />
      <Stack.Screen name="ReportIssue" component={ReportIssueScreen} options={{ title: t('report.title') }} />
    </Stack.Navigator>
  );
}
