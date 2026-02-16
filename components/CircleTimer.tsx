// ============================================
// 원형 타이머 — React Native SVG + Reanimated
// 0초 미션 방어, 백그라운드 보정, 중복 콜백 방지
// ============================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, AppState as RNAppState } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  FadeIn,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  cancelAnimation,
} from 'react-native-reanimated';
import { playTickHaptic, playButtonHaptic } from '@/lib/sounds';

interface CircleTimerProps {
  totalSeconds: number;
  onComplete: () => void;
  onTick?: (remaining: number) => void;
  autoStart?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function CircleTimer({
  totalSeconds,
  onComplete,
  onTick,
  autoStart = false,
}: CircleTimerProps) {
  // 0초 이하 타이머 방어: 최소 1초로 보정
  const safeTotalSeconds = totalSeconds > 0 ? totalSeconds : 1;

  const [remaining, setRemaining] = useState(safeTotalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // 중복 콜백 방지 플래그
  const completedRef = useRef(false);
  // 컴포넌트 마운트 상태 추적
  const mountedRef = useRef(true);

  // Animated SVG progress
  const progress = useSharedValue(0);
  // 마지막 10초 깜빡임
  const pulseScale = useSharedValue(1);

  // 프로그레스 링 애니메이션
  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  // 마지막 10초 펄스
  useEffect(() => {
    if (remaining <= 10 && remaining > 0 && isRunning) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 400 }),
          withTiming(1, { duration: 400 }),
        ),
        -1,
      );
    } else {
      // 펄스 중지
      cancelAnimation(pulseScale);
      pulseScale.value = 1;
    }
  }, [remaining <= 10 && remaining > 0 && isRunning]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  /** 타이머 완료 처리 — 중복 호출 방지 */
  const handleTimerComplete = useCallback(() => {
    if (completedRef.current) return; // 이미 완료 처리됨
    completedRef.current = true;
    stopTimer();
    if (mountedRef.current) {
      onComplete();
    }
  }, [onComplete]);

  // 앱 백그라운드 복귀 처리
  useEffect(() => {
    const subscription = RNAppState.addEventListener('change', (state) => {
      if (state === 'active' && isRunning && startTimeRef.current > 0 && !completedRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const newRemaining = Math.max(0, safeTotalSeconds - elapsed);

        if (mountedRef.current) {
          setRemaining(newRemaining);
        }

        const newProgress = Math.min(1, (safeTotalSeconds - newRemaining) / safeTotalSeconds);
        progress.value = withTiming(newProgress, { duration: 300 });

        if (newRemaining <= 0) {
          handleTimerComplete();
        }
      }
    });
    return () => subscription.remove();
  }, [isRunning, safeTotalSeconds, handleTimerComplete]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (mountedRef.current) {
      setIsRunning(false);
    }
  }, []);

  const start = useCallback(() => {
    // 이미 완료된 경우 방어
    if (completedRef.current) return;

    startTimeRef.current = Date.now();
    setRemaining(safeTotalSeconds);
    setIsRunning(true);
    progress.value = 0;

    // 프로그레스 전체를 부드럽게 이동
    progress.value = withTiming(1, {
      duration: safeTotalSeconds * 1000,
      easing: Easing.linear,
    });

    intervalRef.current = setInterval(() => {
      if (!mountedRef.current || completedRef.current) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const newRemaining = Math.max(0, safeTotalSeconds - elapsed);
      setRemaining(newRemaining);
      onTick?.(newRemaining);

      // 마지막 10초 햅틱
      if (newRemaining <= 10 && newRemaining > 0) {
        playTickHaptic();
      }

      if (newRemaining <= 0) {
        handleTimerComplete();
      }
    }, 1000);
  }, [safeTotalSeconds, handleTimerComplete, onTick]);

  // cleanup — 컴포넌트 언마운트 시
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // 애니메이션 정리
      cancelAnimation(progress);
      cancelAnimation(pulseScale);
    };
  }, []);

  // autoStart
  useEffect(() => {
    if (autoStart && !completedRef.current) {
      start();
    }
  }, [autoStart]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isUrgent = remaining <= 10 && remaining > 0 && isRunning;

  return (
    <View style={styles.container}>
      {/* 원형 타이머 */}
      <Animated.View style={pulseStyle}>
        <View style={styles.timerWrap}>
          <Svg
            width={180}
            height={180}
            viewBox="0 0 160 160"
            style={{ transform: [{ rotate: '-90deg' }] }}
          >
            {/* 배경 원 */}
            <Circle
              cx={80}
              cy={80}
              r={RADIUS}
              fill="none"
              stroke="#F3F4F6"
              strokeWidth={10}
            />
            {/* 프로그레스 원 */}
            <AnimatedCircle
              cx={80}
              cy={80}
              r={RADIUS}
              fill="none"
              stroke={isUrgent ? '#EF4444' : '#FBBF24'}
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              animatedProps={animatedCircleProps}
            />
          </Svg>

          {/* 중앙 시간 표시 */}
          <View style={styles.timeCenter}>
            <Text
              style={[
                styles.timeText,
                isUrgent && styles.timeTextUrgent,
              ]}
            >
              {minutes}:{seconds.toString().padStart(2, '0')}
            </Text>
            {isRunning && (
              <Text style={styles.encourageText}>화이팅! 💪</Text>
            )}
          </View>
        </View>
      </Animated.View>

      {/* 시작 버튼 — autoStart가 아니고 아직 시작 안 했을 때만 */}
      {!isRunning && remaining === safeTotalSeconds && !completedRef.current && (
        <Animated.View entering={FadeIn.duration(300)}>
          <Pressable
            onPress={() => {
              playButtonHaptic();
              start();
            }}
            style={({ pressed }) => [
              styles.startButton,
              pressed && styles.startButtonPressed,
            ]}
          >
            <Text style={styles.startButtonText}>시작! 🌟</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 24,
  },
  timerWrap: {
    width: 180,
    height: 180,
    position: 'relative',
  },
  timeCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 40,
    fontWeight: '800',
    fontFamily: 'Jua',
    color: '#1F2937',
    letterSpacing: 2,
  },
  timeTextUrgent: {
    color: '#EF4444',
  },
  encourageText: {
    fontSize: 13,
    fontFamily: 'Jua',
    color: '#9CA3AF',
    marginTop: 4,
  },
  startButton: {
    paddingHorizontal: 40,
    paddingVertical: 18,
    backgroundColor: '#FBBF24',
    borderRadius: 30,
    // 그림자
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  startButtonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Jua',
    color: '#FFFFFF',
  },
});
