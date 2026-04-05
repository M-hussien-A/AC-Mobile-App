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
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { AuthStackParamList } from '../../navigation/types';
import { brand } from '../../theme';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

interface Slide {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  titleKey: string;
  descriptionKey: string;
  accentColor: string;
}

const slides: Slide[] = [
  {
    icon: 'traffic-light',
    titleKey: 'auth.onboarding.slide1.title',
    descriptionKey: 'auth.onboarding.slide1.description',
    accentColor: brand.accent,
  },
  {
    icon: 'map-marker-path',
    titleKey: 'auth.onboarding.slide2.title',
    descriptionKey: 'auth.onboarding.slide2.description',
    accentColor: brand.accentLight,
  },
  {
    icon: 'apps',
    titleKey: 'auth.onboarding.slide3.title',
    descriptionKey: 'auth.onboarding.slide3.description',
    accentColor: brand.accent,
  },
];

export default function OnboardingScreen() {
  const { width: windowWidth } = useWindowDimensions();
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

  return (
    <LinearGradient
      colors={[brand.primaryDark, brand.primary, brand.primaryLight]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={brand.primaryDark} />

      {/* Skip button - RTL aware positioning */}
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
            {/* Outer glow ring */}
            <View style={styles.iconGlow}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name={slide.icon}
                  size={80}
                  color={slide.accentColor}
                />
              </View>
            </View>
            <Text style={styles.slideTitle}>{t(slide.titleKey)}</Text>
            <Text style={styles.slideDescription}>{t(slide.descriptionKey)}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Bottom controls */}
      <View style={styles.bottomContainer}>
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
                color={brand.primaryDark}
                style={{ marginEnd: 8 }}
              />
              <Text style={styles.nextButtonTextLast}>
                {t('auth.onboarding.getStarted')}
              </Text>
            </View>
          ) : (
            <Text style={styles.nextButtonText}>
              {t('auth.onboarding.next')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 56,
    zIndex: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  skipText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
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
  iconGlow: {
    width: 164,
    height: 164,
    borderRadius: 82,
    backgroundColor: 'rgba(212, 168, 75, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 44,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#D4A84B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 20px rgba(212, 168, 75, 0.2)',
      } as any,
    }),
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
  },
  slideDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 8,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 28,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  dotActive: {
    backgroundColor: brand.accent,
    width: 28,
  },
  dotInactive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    width: 10,
  },
  nextButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  nextButtonLast: {
    backgroundColor: brand.accent,
    borderColor: brand.accent,
    ...Platform.select({
      ios: {
        shadowColor: '#D4A84B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 16px rgba(212, 168, 75, 0.4)',
      } as any,
    }),
  },
  nextButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  nextButtonTextLast: {
    color: brand.primaryDark,
    fontSize: 18,
    fontWeight: '700',
  },
});
