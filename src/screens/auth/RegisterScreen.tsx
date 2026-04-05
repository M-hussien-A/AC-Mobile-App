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
import { register } from '../../services/userService';
import { AuthStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const registerSchema = z
  .object({
    name: z.string().min(1, 'auth.validation.nameRequired').min(2, 'auth.validation.nameMin'),
    email: z.string().min(1, 'auth.validation.emailRequired').email('auth.validation.emailInvalid'),
    phone: z
      .string()
      .min(1, 'auth.validation.phoneRequired')
      .regex(/^\+?[0-9]{8,15}$/, 'auth.validation.phoneInvalid'),
    password: z.string().min(1, 'auth.validation.passwordRequired').min(8, 'auth.validation.passwordMin'),
    confirmPassword: z.string().min(1, 'auth.validation.confirmPasswordRequired'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'auth.validation.passwordsMismatch',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface FieldConfig {
  name: keyof RegisterFormData;
  labelKey: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'words';
  secure?: boolean;
}

const fields: FieldConfig[] = [
  { name: 'name', labelKey: 'auth.register.name', icon: 'account-outline', autoCapitalize: 'words' },
  { name: 'email', labelKey: 'auth.register.email', icon: 'email-outline', keyboardType: 'email-address', autoCapitalize: 'none' },
  { name: 'phone', labelKey: 'auth.register.phone', icon: 'phone-outline', keyboardType: 'phone-pad' },
  { name: 'password', labelKey: 'auth.register.password', icon: 'lock-outline', secure: true, autoCapitalize: 'none' },
  { name: 'confirmPassword', labelKey: 'auth.register.confirmPassword', icon: 'lock-check-outline', secure: true, autoCapitalize: 'none' },
];

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const authLogin = useAuthStore((s) => s.login);
  const setProfile = useUserStore((s) => s.setProfile);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
  });

  const togglePasswordVisibility = (fieldName: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const onSubmit = async (data: RegisterFormData) => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const result = await register(data.name, data.email, data.phone, data.password);
      authLogin(result.token);
      setProfile(result.user);
    } catch (err: any) {
      setErrorMessage(err?.message ?? t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>{t('auth.register.title')}</Text>
        </View>

        {/* Error */}
        {errorMessage && (
          <View style={[styles.errorContainer, { backgroundColor: colors.error + '15' }]}>
            <MaterialCommunityIcons name="alert-circle" size={20} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>{errorMessage}</Text>
          </View>
        )}

        {/* Fields */}
        {fields.map((field) => {
          const fieldError = errors[field.name];
          return (
            <View key={field.name} style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>{t(field.labelKey)}</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    borderColor: fieldError ? colors.error : colors.border,
                    backgroundColor: colors.surface,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={field.icon}
                  size={20}
                  color={colors.icon}
                  style={styles.inputIcon}
                />
                <Controller
                  control={control}
                  name={field.name}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder={t(field.labelKey)}
                      placeholderTextColor={colors.placeholder}
                      keyboardType={field.keyboardType ?? 'default'}
                      autoCapitalize={field.autoCapitalize ?? 'none'}
                      autoCorrect={false}
                      secureTextEntry={field.secure && !visiblePasswords[field.name]}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      editable={!isLoading}
                    />
                  )}
                />
                {field.secure && (
                  <TouchableOpacity
                    onPress={() => togglePasswordVisibility(field.name)}
                    hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                  >
                    <MaterialCommunityIcons
                      name={visiblePasswords[field.name] ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.icon}
                    />
                  </TouchableOpacity>
                )}
              </View>
              {fieldError && (
                <Text style={[styles.fieldError, { color: colors.error }]}>
                  {t(fieldError.message as string)}
                </Text>
              )}
            </View>
          );
        })}

        {/* Register button */}
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={handleSubmit(onSubmit)}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>{t('auth.register.submit')}</Text>
          )}
        </TouchableOpacity>

        {/* Login link */}
        <View style={styles.loginLinkContainer}>
          <Text style={[styles.loginLinkText, { color: colors.textSecondary }]}>
            {t('auth.register.hasAccount')}{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.loginLinkAction, { color: colors.primary }]}>
              {t('auth.register.signIn')}
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
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
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
  primaryButton: {
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  loginLinkText: {
    fontSize: 15,
  },
  loginLinkAction: {
    fontSize: 15,
    fontWeight: '600',
  },
});
