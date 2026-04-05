/**
 * ACUD ITS Traveler Mobile App - React Error Boundary
 */

import React, { Component, ErrorInfo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { brand, semantic, lightPalette } from '../../theme';

// ── Types ────────────────────────────────────────────────────────
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Optional fallback component receiving error and resetErrorBoundary */
  fallback?: React.ComponentType<{
    error: Error;
    resetErrorBoundary: () => void;
  }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ── Component ────────────────────────────────────────────────────
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for monitoring/analytics
    if (__DEV__) {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback: FallbackComponent } = this.props;

    if (hasError && error) {
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={error}
            resetErrorBoundary={this.resetErrorBoundary}
          />
        );
      }

      return <DefaultFallback onRetry={this.resetErrorBoundary} />;
    }

    return children;
  }
}

// ── Default Fallback ─────────────────────────────────────────────
interface DefaultFallbackProps {
  onRetry: () => void;
}

/**
 * Static fallback UI. Does not use hooks or theme context, because
 * the error may have originated in the theme provider itself.
 */
function DefaultFallback({ onRetry }: DefaultFallbackProps) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={56}
        color={semantic.error}
      />

      <Text style={styles.title}>Something went wrong</Text>

      <Text style={styles.message}>
        An unexpected error occurred. Please try again.
      </Text>

      <View style={styles.retryButton}>
        <Text
          style={styles.retryText}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry"
        >
          Try Again
        </Text>
      </View>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
    backgroundColor: lightPalette.background,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: lightPalette.text,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: lightPalette.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: brand.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorBoundary;
