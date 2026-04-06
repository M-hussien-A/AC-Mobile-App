import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  StatusBar,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../stores/authStore';
import { AuthStackParamList } from '../../navigation/types';
import SplashMapBackground from '../../components/SplashMapBackground';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Splash'>;

// NAC map-inspired palette
const CREAM = '#F3EDE4';
const CHARCOAL = '#2E2E2E';
const CHARCOAL_LIGHT = '#5A564E';
const COPPER = '#C45C2C';
const COPPER_DARK = '#A04A22';
const GOLD = '#D4A84B';

export default function SplashScreen() {
  const navigation = useNavigation<Nav>();
  const hasSeenOnboarding = useAuthStore((s) => s.hasSeenOnboarding);
  const { width, height } = useWindowDimensions();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const mapFade = useRef(new Animated.Value(0)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const bottomFade = useRef(new Animated.Value(0)).current;
  const lineWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Phase 1: Map fades in
    Animated.timing(mapFade, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Phase 2: Logo appears (slightly delayed)
    const logoTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 35,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Phase 3: Tagline + bottom info
        Animated.parallel([
          Animated.timing(taglineFade, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(bottomFade, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 400);

    // Copper accent line expands
    Animated.timing(lineWidth, {
      toValue: 1,
      duration: 1200,
      delay: 800,
      useNativeDriver: false,
    }).start();

    const navTimer = setTimeout(() => {
      if (hasSeenOnboarding) {
        navigation.replace('Login');
      } else {
        navigation.replace('Onboarding');
      }
    }, 3000);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(navTimer);
    };
  }, [fadeAnim, scaleAnim, mapFade, taglineFade, bottomFade, lineWidth, hasSeenOnboarding, navigation]);

  const accentLineWidth = lineWidth.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 80],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={CREAM} />

      {/* Animated map background */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: mapFade }]}>
        <SplashMapBackground width={width} height={height} />
      </Animated.View>

      {/* Subtle vignette overlay for readability */}
      <View style={styles.vignette} />

      {/* Main content */}
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Icon badge */}
        <View style={styles.iconOuter}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="traffic-light"
              size={52}
              color={COPPER}
            />
          </View>
        </View>

        {/* Arabic name */}
        <Animated.Text style={styles.appNameAr}>
          {'\u0628\u0648\u0627\u0628\u0629 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0645\u0633\u0627\u0641\u0631'}
        </Animated.Text>

        {/* English name */}
        <Animated.Text style={styles.appNameEn}>
          TRAVELER INFORMATION
        </Animated.Text>

        {/* Copper accent line */}
        <Animated.View style={[styles.accentLine, { width: accentLineWidth }]} />

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: taglineFade }]}>
          Smart Mobility for the New Administrative Capital
        </Animated.Text>
      </Animated.View>

      {/* Bottom section - inspired by the map's bottom text layout */}
      <Animated.View style={[styles.bottomSection, { opacity: bottomFade }]}>
        <Animated.Text style={styles.bottomTitle}>
          N E W {'  '} A D M I N I S T R A T I V E {'  '} C A P I T A L
        </Animated.Text>
        <Animated.Text style={styles.bottomSubtitle}>
          EGYPT
        </Animated.Text>
        <Animated.Text style={styles.bottomCoords}>
          30.0238° N  /  31.7549° E
        </Animated.Text>
        <View style={styles.bottomDivider} />
        <Animated.Text style={styles.bottomBrand}>
          ACUD ITS
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM,
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    ...Platform.select({
      web: {
        background: `radial-gradient(ellipse at center, transparent 40%, rgba(243, 237, 228, 0.85) 100%)`,
      } as any,
      default: {},
    }),
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  iconOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(243, 237, 228, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: CHARCOAL,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: `0 4px 24px rgba(46, 46, 46, 0.12)`,
      } as any,
    }),
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COPPER,
    ...Platform.select({
      ios: {
        shadowColor: COPPER,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: `0 2px 12px rgba(196, 92, 44, 0.15)`,
      } as any,
    }),
  },
  appNameAr: {
    fontSize: 28,
    fontWeight: '700',
    color: CHARCOAL,
    marginBottom: 6,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  appNameEn: {
    fontSize: 15,
    fontWeight: '600',
    color: CHARCOAL_LIGHT,
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 4,
  },
  accentLine: {
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COPPER,
    marginBottom: 18,
  },
  tagline: {
    fontSize: 13,
    color: CHARCOAL_LIGHT,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  bottomSection: {
    paddingBottom: Platform.OS === 'web' ? 40 : 50,
    alignItems: 'center',
  },
  bottomTitle: {
    fontSize: 10,
    fontWeight: '500',
    color: CHARCOAL,
    letterSpacing: 1,
    marginBottom: 6,
    textAlign: 'center',
  },
  bottomSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: CHARCOAL,
    letterSpacing: 3,
    marginBottom: 4,
  },
  bottomCoords: {
    fontSize: 11,
    color: CHARCOAL_LIGHT,
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  bottomDivider: {
    width: 30,
    height: 2,
    backgroundColor: COPPER,
    borderRadius: 1,
    marginBottom: 10,
    opacity: 0.6,
  },
  bottomBrand: {
    fontSize: 12,
    color: COPPER_DARK,
    letterSpacing: 3,
    fontWeight: '700',
  },
});
