import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StatusBar,
  Platform,
  I18nManager,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { AuthStackParamList } from '../../navigation/types';
import SplashMapBackground from '../../components/SplashMapBackground';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

// NAC map-inspired palette
const CREAM = '#F3EDE4';
const CHARCOAL = '#2E2E2E';
const CHARCOAL_LIGHT = '#5A564E';
const COPPER = '#C45C2C';
const COPPER_LIGHT = '#D4784A';
const WHITE = '#FFFFFF';

interface Slide {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  titleKey: string;
  descriptionKey: string;
  accent: string;
}

const slides: Slide[] = [
  {
    icon: 'traffic-light',
    titleKey: 'auth.onboarding.slide1.title',
    descriptionKey: 'auth.onboarding.slide1.description',
    accent: COPPER,
  },
  {
    icon: 'map-marker-path',
    titleKey: 'auth.onboarding.slide2.title',
    descriptionKey: 'auth.onboarding.slide2.description',
    accent: '#8B6914',
  },
  {
    icon: 'apps',
    titleKey: 'auth.onboarding.slide3.title',
    descriptionKey: 'auth.onboarding.slide3.description',
    accent: COPPER_LIGHT,
  },
];

export default function OnboardingScreen() {
  const { width: windowWidth, height } = useWindowDimensions();
  const width = Math.min(windowWidth, 480);

  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);

  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / width);
      setActiveIndex(Math.max(0, Math.min(index, slides.length - 1)));
    },
    [width],
  );

  const goToNext = useCallback(() => {
    if (activeIndex < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: width * (activeIndex + 1), animated: true });
      setActiveIndex(activeIndex + 1);
    } else {
      completeOnboarding();
      navigation.replace('Login');
    }
  }, [activeIndex, width, completeOnboarding, navigation]);

  const skip = useCallback(() => {
    completeOnboarding();
    navigation.replace('Login');
  }, [completeOnboarding, navigation]);

  const isLast = activeIndex === slides.length - 1;
  const currentSlide = slides[activeIndex];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={CREAM} />

      {/* Map background */}
      <SplashMapBackground width={windowWidth} height={height} opacity={0.5} />

      {/* Overlay for readability */}
      <View style={styles.overlay} />

      {/* Skip button */}
      {!isLast && (
        <TouchableOpacity
          style={[
            styles.skipButton,
            I18nManager.isRTL ? { left: 24, right: undefined } : { right: 24, left: undefined },
          ]}
          onPress={skip}
          hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
        >
          <Text style={styles.skipText}>{t('auth.onboarding.skip')}</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        bounces={false}
        contentContainerStyle={styles.slidesContentContainer}
      >
        {slides.map((slide, index) => (
          <View key={index} style={[styles.slide, { width }]}>
            {/* Icon with map-style badge */}
            <View style={styles.iconOuter}>
              <View style={[styles.iconInner, { borderColor: slide.accent }]}>
                <MaterialCommunityIcons
                  name={slide.icon}
                  size={56}
                  color={slide.accent}
                />
              </View>
            </View>

            {/* Copper accent line */}
            <View style={[styles.slideAccent, { backgroundColor: slide.accent }]} />

            <Text style={styles.slideTitle}>{t(slide.titleKey)}</Text>
            <Text style={styles.slideDescription}>{t(slide.descriptionKey)}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Bottom controls */}
      <View style={styles.bottomContainer}>
        {/* Step indicator */}
        <Text style={styles.stepText}>
          {activeIndex + 1} / {slides.length}
        </Text>

        {/* Dots */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Next / Get Started button */}
        <TouchableOpacity
          style={[
            styles.nextButton,
            isLast && styles.nextButtonLast,
          ]}
          onPress={goToNext}
          activeOpacity={0.8}
        >
          {isLast ? (
            <View style={styles.nextButtonInner}>
              <MaterialCommunityIcons
                name="rocket-launch-outline"
                size={20}
                color={WHITE}
                style={{ marginEnd: 8 }}
              />
              <Text style={styles.nextButtonTextLast}>
                {t('auth.onboarding.getStarted')}
              </Text>
            </View>
          ) : (
            <View style={styles.nextButtonInner}>
              <Text style={styles.nextButtonText}>
                {t('auth.onboarding.next')}
              </Text>
              <MaterialCommunityIcons
                name={I18nManager.isRTL ? 'chevron-left' : 'chevron-right'}
                size={20}
                color={COPPER}
                style={{ marginStart: 4 }}
              />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(243, 237, 228, 0.55)',
  },
  skipButton: {
    position: 'absolute',
    top: 56,
    zIndex: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(46, 46, 46, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(46, 46, 46, 0.1)',
  },
  skipText: {
    color: CHARCOAL_LIGHT,
    fontSize: 14,
    fontWeight: '500',
  },
  slidesContentContainer: {
    alignItems: 'center',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconOuter: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(243, 237, 228, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    ...Platform.select({
      ios: {
        shadowColor: CHARCOAL,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 4px 20px rgba(46, 46, 46, 0.1)',
      } as any,
    }),
  },
  iconInner: {
    width: 105,
    height: 105,
    borderRadius: 52.5,
    backgroundColor: WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: COPPER,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 12px rgba(196, 92, 44, 0.12)',
      } as any,
    }),
  },
  slideAccent: {
    width: 48,
    height: 3,
    borderRadius: 1.5,
    marginBottom: 24,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: CHARCOAL,
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 32,
  },
  slideDescription: {
    fontSize: 15,
    color: CHARCOAL_LIGHT,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'web' ? 40 : 48,
    alignItems: 'center',
  },
  stepText: {
    fontSize: 12,
    color: CHARCOAL_LIGHT,
    letterSpacing: 2,
    fontWeight: '500',
    marginBottom: 12,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  dotActive: {
    backgroundColor: COPPER,
    width: 28,
  },
  dotInactive: {
    backgroundColor: 'rgba(46, 46, 46, 0.15)',
    width: 8,
  },
  nextButton: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COPPER,
    backgroundColor: 'rgba(243, 237, 228, 0.9)',
  },
  nextButtonLast: {
    backgroundColor: COPPER,
    borderColor: COPPER,
    ...Platform.select({
      ios: {
        shadowColor: COPPER,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 16px rgba(196, 92, 44, 0.3)',
      } as any,
    }),
  },
  nextButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: COPPER,
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonTextLast: {
    color: WHITE,
    fontSize: 17,
    fontWeight: '700',
  },
});
