import { Platform } from 'react-native';

export async function impactAsync(style?: any) {
  if (Platform.OS === 'web') return;
  const Haptics = require('expo-haptics');
  return Haptics.impactAsync(style);
}

export async function notificationAsync(type?: any) {
  if (Platform.OS === 'web') return;
  const Haptics = require('expo-haptics');
  return Haptics.notificationAsync(type);
}
