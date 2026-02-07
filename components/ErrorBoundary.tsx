// ============================================
// 에러 바운더리 — 앱 크래시 방지 + 재시도 UI
// 모든 탭 화면을 감싸서 에러 격리
// ============================================

import React, { Component, type ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** 에러 발생 시 표시할 커스텀 메시지 */
  fallbackMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // 에러 로깅 — 프로덕션에서는 Sentry 등으로 전송 가능
    console.error('[HabitFairy] ErrorBoundary 에러 포착:', error);
    console.error('[HabitFairy] 컴포넌트 스택:', errorInfo?.componentStack);
  }

  /** 재시도: 에러 상태 초기화 */
  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>😢</Text>
          <Text style={styles.title}>문제가 발생했어요</Text>
          <Text style={styles.message}>
            {this.props.fallbackMessage || '잠시 후 다시 시도해주세요'}
          </Text>
          {__DEV__ && this.state.error && (
            <View style={styles.debugBox}>
              <Text style={styles.debugText} numberOfLines={5}>
                {this.state.error.message}
              </Text>
            </View>
          )}
          <Pressable
            onPress={this.handleRetry}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.retryButtonPressed,
            ]}
          >
            <Text style={styles.retryButtonText}>🔄 다시 시도하기</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  debugBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    maxWidth: '100%',
  },
  debugText: {
    fontSize: 11,
    color: '#EF4444',
    fontFamily: 'monospace',
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: '#FBBF24',
    borderRadius: 24,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  retryButtonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  retryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
