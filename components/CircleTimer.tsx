// ============================================
// 원형 타이머 — React Native SVG + Reanimated
// 부드러운 프로그레스 링, 햅틱 피드백
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
  const [remaining, setRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    }
  }, [remaining <= 10 && isRunning]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // 앱 백그라운드 복귀 처리
  useEffect(() => {
    const subscription = RNAppState.addEventListener('change', (state) => {
      if (state === 'active' && isRunning && startTimeRef.current > 0) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const newRemaining = Math.max(0, totalSeconds - elapsed);
        setRemaining(newRemaining);
        const newProgress = (totalSeconds - newRemaining) / totalSeconds;
        progress.value = withTiming(newProgress, { duration: 300 });

        if (newRemaining <= 0) {
          stopTimer();
          onComplete();
        }
      }
    });
    return () => subscription.remove();
  }, [isRunning, totalSeconds]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const start = useCallback(() => {
    startTimeRef.current = Date.now();
    setRemaining(totalSeconds);
    setIsRunning(true);
    progress.value = 0;

    // 프로그레스 전체를 부드럽게 이동
    progress.value = withTiming(1, {
      duration: totalSeconds * 1000,
      easing: Easing.linear,
    });

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const newRemaining = Math.max(0, totalSeconds - elapsed);
      setRemaining(newRemaining);
      onTick?.(newRemaining);

      // 마지막 10초 햅틱
      if (newRemaining <= 10 && newRemaining > 0) {
        playTickHaptic();
      }

      if (newRemaining <= 0) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setIsRunning(false);
        onComplete();
      }
    }, 1000);
  }, [totalSeconds, onComplete, onTick]);

  // cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // autoStart
  useEffect(() => {
    if (autoStart) start();
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

      {/* 시작 버튼 */}
      {!isRunning && remaining === totalSeconds && (
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
    color: '#1F2937',
    letterSpacing: 2,
  },
  timeTextUrgent: {
    color: '#EF4444',
  },
  encourageText: {
    fontSize: 13,
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
    color: '#FFFFFF',
  },
});
