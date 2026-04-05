import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, StatusBar, Platform, I18nManager } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { AuthStackParamList } from '../../navigation/types';
import { brand } from '../../theme';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Splash'>;

export default function SplashScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const hasSeenOnboarding = useAuthStore((s) => s.hasSeenOnboarding);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Tagline fades in after logo
      Animated.timing(taglineFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    });

    // Subtle pulsing glow on the icon ring
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    const timer = setTimeout(() => {
      if (hasSeenOnboarding) {
        navigation.replace('Login');
      } else {
        navigation.replace('Onboarding');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, pulseAnim, taglineFade, hasSeenOnboarding, navigation]);

  return (
    <LinearGradient
      colors={[brand.primaryDark, brand.primary, brand.primaryLight]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={brand.primaryDark} />
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Outer glow ring */}
        <Animated.View
          style={[styles.iconGlow, { transform: [{ scale: pulseAnim }] }]}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="traffic-light"
              size={80}
              color={brand.accent}
            />
          </View>
        </Animated.View>

        <Animated.Text style={styles.appNameAr}>
          {'\u0628\u0648\u0627\u0628\u0629 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0645\u0633\u0627\u0641\u0631'}
        </Animated.Text>
        <Animated.Text style={styles.appNameEn}>
          {t('common.appName')}
        </Animated.Text>

        {/* Gold accent divider */}
        <View style={styles.divider} />

        <Animated.Text style={[styles.tagline, { opacity: taglineFade }]}>
          {t('auth.splash.tagline')}
        </Animated.Text>
      </Animated.View>

      {/* Bottom brand bar */}
      <View style={styles.bottomBar}>
        <Animated.Text style={[styles.bottomText, { opacity: taglineFade }]}>
          ACUD ITS
        </Animated.Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconGlow: {
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: 'rgba(212, 168, 75, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 168, 75, 0.25)',
    ...Platform.select({
      ios: {
        shadowColor: '#D4A84B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 24px rgba(212, 168, 75, 0.3)',
      } as any,
    }),
  },
  appNameAr: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  appNameEn: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  divider: {
    width: 48,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: brand.accent,
    marginBottom: 20,
    opacity: 0.7,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  bottomText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
});
