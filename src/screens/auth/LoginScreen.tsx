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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useThemeColors } from '../../theme';
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

  const dynamicStyles = getDynamicStyles(colors);

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
          <View style={dynamicStyles.logoCircle}>
            <MaterialCommunityIcons name="traffic-light" size={48} color={colors.accent} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{t('auth.login.title')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('auth.login.subtitle')}
          </Text>
        </View>

        {/* Error */}
        {errorMessage && (
          <View style={[styles.errorContainer, { backgroundColor: colors.error + '15' }]}>
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
              { borderColor: errors.email ? colors.error : colors.border, backgroundColor: colors.surface },
            ]}
          >
            <MaterialCommunityIcons name="email-outline" size={20} color={colors.icon} style={styles.inputIcon} />
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t('auth.login.email')}
                  placeholderTextColor={colors.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  editable={!isLoading && !isSSOLoading}
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
              { borderColor: errors.password ? colors.error : colors.border, backgroundColor: colors.surface },
            ]}
          >
            <MaterialCommunityIcons name="lock-outline" size={20} color={colors.icon} style={styles.inputIcon} />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t('auth.login.password')}
                  placeholderTextColor={colors.placeholder}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  editable={!isLoading && !isSSOLoading}
                />
              )}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
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
        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
            {t('auth.login.forgotPassword')}
          </Text>
        </TouchableOpacity>

        {/* Login button */}
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={handleSubmit(onSubmit)}
          activeOpacity={0.8}
          disabled={isLoading || isSSOLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>{t('auth.login.button')}</Text>
          )}
        </TouchableOpacity>

        {/* SSO button */}
        <TouchableOpacity
          style={[styles.ssoButton, { backgroundColor: colors.accent }]}
          onPress={onSSOPress}
          activeOpacity={0.8}
          disabled={isLoading || isSSOLoading}
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

function getDynamicStyles(colors: ReturnType<typeof useThemeColors>) {
  return {
    logoCircle: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colors.primary + '12',
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginBottom: 20,
    },
  };
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  fieldError: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButton: {
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  ssoButton: {
    borderRadius: 12,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  ssoIcon: {
    marginRight: 8,
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
    fontWeight: '600',
  },
});
