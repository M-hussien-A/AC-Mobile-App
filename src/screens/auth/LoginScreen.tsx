import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  I18nManager,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useThemeColors, brand } from '../../theme';
import { useAuthStore } from '../../stores/authStore';
import { useUserStore } from '../../stores/userStore';
import { login, loginWithSSO } from '../../services/userService';
import { AuthStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const loginSchema = z.object({
  email: z.string().min(1, 'auth.validation.emailRequired').email('auth.validation.emailInvalid'),
  password: z.string().min(1, 'auth.validation.passwordRequired').min(8, 'auth.validation.passwordMin'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const authLogin = useAuthStore((s) => s.login);
  const setProfile = useUserStore((s) => s.setProfile);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSSOLoading, setIsSSOLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const result = await login(data.email, data.password);
      authLogin(result.token);
      setProfile(result.user);
    } catch (err: any) {
      setErrorMessage(err?.message ?? t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const onSSOPress = async () => {
    setErrorMessage(null);
    setIsSSOLoading(true);
    try {
      const result = await loginWithSSO();
      authLogin(result.token);
      setProfile(result.user);
    } catch (err: any) {
      setErrorMessage(err?.message ?? t('common.error'));
    } finally {
      setIsSSOLoading(false);
    }
  };

  const disabled = isLoading || isSSOLoading;

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View
            style={[
              styles.logoCircle,
              {
                backgroundColor: colors.primary + '12',
                ...Platform.select({
                  ios: {
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                  },
                  android: { elevation: 4 },
                  web: {
                    boxShadow: `0 4px 20px ${colors.primary}20`,
                  } as any,
                }),
              },
            ]}
          >
            <MaterialCommunityIcons name="traffic-light" size={48} color={colors.accent} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{t('auth.login.title')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('auth.login.subtitle')}
          </Text>
        </View>

        {/* Error banner */}
        {errorMessage && (
          <View style={[styles.errorContainer, { backgroundColor: colors.error + '12', borderColor: colors.error + '30' }]}>
            <MaterialCommunityIcons name="alert-circle" size={20} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>{errorMessage}</Text>
          </View>
        )}

        {/* Email field */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: colors.text }]}>{t('auth.login.email')}</Text>
          <View
            style={[
              styles.inputContainer,
              {
                borderColor: errors.email ? colors.error : colors.border,
                backgroundColor: colors.surface,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color={errors.email ? colors.error : colors.icon}
              style={styles.inputIcon}
            />
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, { color: colors.text, textAlign: I18nManager.isRTL ? 'right' : 'left' }]}
                  placeholder={t('auth.login.email')}
                  placeholderTextColor={colors.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  editable={!disabled}
                />
              )}
            />
          </View>
          {errors.email && (
            <Text style={[styles.fieldError, { color: colors.error }]}>
              {t(errors.email.message as string)}
            </Text>
          )}
        </View>

        {/* Password field */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: colors.text }]}>{t('auth.login.password')}</Text>
          <View
            style={[
              styles.inputContainer,
              {
                borderColor: errors.password ? colors.error : colors.border,
                backgroundColor: colors.surface,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="lock-outline"
              size={20}
              color={errors.password ? colors.error : colors.icon}
              style={styles.inputIcon}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, { color: colors.text, textAlign: I18nManager.isRTL ? 'right' : 'left' }]}
                  placeholder={t('auth.login.password')}
                  placeholderTextColor={colors.placeholder}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  editable={!disabled}
                />
              )}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <MaterialCommunityIcons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.icon}
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={[styles.fieldError, { color: colors.error }]}>
              {t(errors.password.message as string)}
            </Text>
          )}
        </View>

        {/* Forgot password */}
        <TouchableOpacity
          style={[styles.forgotPassword, { alignSelf: I18nManager.isRTL ? 'flex-start' : 'flex-end' }]}
        >
          <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
            {t('auth.login.forgotPassword')}
          </Text>
        </TouchableOpacity>

        {/* Login button */}
        <TouchableOpacity
          style={[
            styles.primaryButton,
            {
              backgroundColor: disabled ? colors.disabled : colors.primary,
              ...Platform.select({
                ios: {
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: disabled ? 0 : 0.3,
                  shadowRadius: 8,
                },
                android: { elevation: disabled ? 0 : 6 },
                web: disabled
                  ? {}
                  : ({ boxShadow: `0 4px 14px ${colors.primary}40` } as any),
              }),
            },
          ]}
          onPress={handleSubmit(onSubmit)}
          activeOpacity={0.8}
          disabled={disabled}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>{t('auth.login.button')}</Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textTertiary }]}>
            {t('auth.login.or') || 'OR'}
          </Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        {/* SSO button */}
        <TouchableOpacity
          style={[
            styles.ssoButton,
            {
              backgroundColor: disabled ? colors.disabled : colors.accent,
              ...Platform.select({
                ios: {
                  shadowColor: brand.accentDark,
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: disabled ? 0 : 0.25,
                  shadowRadius: 6,
                },
                android: { elevation: disabled ? 0 : 4 },
                web: disabled
                  ? {}
                  : ({ boxShadow: `0 3px 12px ${brand.accentDark}40` } as any),
              }),
            },
          ]}
          onPress={onSSOPress}
          activeOpacity={0.8}
          disabled={disabled}
        >
          {isSSOLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <MaterialCommunityIcons name="shield-account" size={20} color="#FFFFFF" style={styles.ssoIcon} />
              <Text style={styles.ssoButtonText}>{t('auth.login.sso')}</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Register link */}
        <View style={styles.registerLinkContainer}>
          <Text style={[styles.registerLinkText, { color: colors.textSecondary }]}>
            {t('auth.login.noAccount')}{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.registerLinkAction, { color: colors.primary }]}>
              {t('auth.login.signUp')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 64,
    paddingBottom: 36,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 14,
    marginStart: 10,
    flex: 1,
    lineHeight: 20,
  },
  fieldContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
  },
  inputIcon: {
    marginEnd: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%' as any,
  },
  fieldError: {
    fontSize: 12,
    marginTop: 6,
    marginStart: 4,
  },
  forgotPassword: {
    marginBottom: 28,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButton: {
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '500',
    marginHorizontal: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ssoButton: {
    borderRadius: 14,
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  ssoIcon: {
    marginEnd: 10,
  },
  ssoButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  registerLinkText: {
    fontSize: 15,
  },
  registerLinkAction: {
    fontSize: 15,
    fontWeight: '700',
  },
});
