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
} from 'react-native';
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
}

const slides: Slide[] = [
  {
    icon: 'traffic-light',
    titleKey: 'auth.onboarding.slide1.title',
    descriptionKey: 'auth.onboarding.slide1.description',
  },
  {
    icon: 'map-marker-path',
    titleKey: 'auth.onboarding.slide2.title',
    descriptionKey: 'auth.onboarding.slide2.description',
  },
  {
    icon: 'apps',
    titleKey: 'auth.onboarding.slide3.title',
    descriptionKey: 'auth.onboarding.slide3.description',
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
      setActiveIndex(index);
    },
    [width],
  );

  const goToNext = useCallback(() => {
    if (activeIndex < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: width * (activeIndex + 1), animated: true });
    } else {
      completeOnboarding();
      navigation.replace('Login');
    }
  }, [activeIndex, completeOnboarding, navigation]);

  const skip = useCallback(() => {
    completeOnboarding();
    navigation.replace('Login');
  }, [completeOnboarding, navigation]);

  const isLast = activeIndex === slides.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={brand.primary} />

      {/* Skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={skip} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <Text style={styles.skipText}>{t('auth.onboarding.skip')}</Text>
      </TouchableOpacity>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        bounces={false}
      >
        {slides.map((slide, index) => (
          <View key={index} style={[styles.slide, { width }]}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={slide.icon}
                size={80}
                color={brand.accent}
              />
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
        <TouchableOpacity style={styles.nextButton} onPress={goToNext} activeOpacity={0.8}>
          <Text style={styles.nextButtonText}>
            {isLast ? t('auth.onboarding.getStarted') : t('auth.onboarding.next')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brand.primary,
  },
  skipButton: {
    position: 'absolute',
    top: 56,
    right: 24,
    zIndex: 10,
  },
  skipText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '500',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  slideDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
  dotActive: {
    backgroundColor: brand.accent,
    width: 28,
    borderRadius: 5,
  },
  dotInactive: {
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  nextButton: {
    backgroundColor: brand.accent,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
