// ============================================
// 별 보상 애니메이션 — 축하 오버레이
// Reanimated 기반 파티클 + 별 카운트업
// ============================================

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  FadeIn,
  FadeOut,
  SlideInDown,
  runOnJS,
} from 'react-native-reanimated';
import { playStarHaptic, playFanfareHaptic } from '@/lib/sounds';

interface StarRewardProps {
  stars: number;
  isVisible: boolean;
  onComplete?: () => void;
  message?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/** 축하 메시지 랜덤 */
const CHEER_MESSAGES = [
  '정말 잘했어! 최고야! 🌈',
  '와, 대단해! 멋지다! ✨',
  '별이가 감동했어! 💫',
  '역시 네가 최고야! 🎉',
  '오늘도 빛나는 하루! ⭐',
];

/** 파티클 하나 */
function Particle({ delay, emoji, x }: { delay: number; emoji: string; x: number }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withSequence(
        withTiming(-200, { duration: 1500 }),
        withTiming(-300, { duration: 800 }),
      ),
    );
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(1200, withTiming(0, { duration: 600 })),
      ),
    );
    rotate.value = withDelay(
      delay,
      withTiming(360, { duration: 2000 }),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: x },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.particle, style]}>
      {emoji}
    </Animated.Text>
  );
}

export default function StarReward({
  stars,
  isVisible,
  onComplete,
  message,
}: StarRewardProps) {
  const [displayedStars, setDisplayedStars] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [cheerMsg] = useState(() =>
    CHEER_MESSAGES[Math.floor(Math.random() * CHEER_MESSAGES.length)],
  );

  // 별 등장 scale 애니메이션
  const starScales = Array.from({ length: 5 }, () => useSharedValue(0));

  useEffect(() => {
    if (!isVisible) {
      setDisplayedStars(0);
      setShowMessage(false);
      starScales.forEach((s) => { s.value = 0; });
      return;
    }

    // 팡파레 햅틱
    playFanfareHaptic();

    // 별 하나씩 카운트업
    let count = 0;
    const interval = setInterval(() => {
      count += 1;
      setDisplayedStars(count);
      playStarHaptic();

      // 별 spring 애니메이션
      if (count - 1 < starScales.length) {
        starScales[count - 1].value = withSpring(1, { damping: 8, stiffness: 200 });
      }

      if (count >= stars) {
        clearInterval(interval);
        setTimeout(() => setShowMessage(true), 300);
        // 자동 닫기
        setTimeout(() => {
          onComplete?.();
        }, 3500);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isVisible, stars]);

  if (!isVisible) return null;

  // 파티클 데이터 생성
  const particles = [
    { emoji: '⭐', x: -60, delay: 0 },
    { emoji: '✨', x: 40, delay: 100 },
    { emoji: '🌟', x: -20, delay: 200 },
    { emoji: '💫', x: 70, delay: 300 },
    { emoji: '⭐', x: -80, delay: 150 },
    { emoji: '✨', x: 10, delay: 250 },
    { emoji: '🌟', x: 50, delay: 350 },
    { emoji: '⭐', x: -40, delay: 400 },
  ];

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      style={styles.overlay}
    >
      {/* 배경 블러 */}
      <View style={styles.backdrop} />

      {/* 파티클 */}
      <View style={styles.particlesContainer}>
        {particles.map((p, i) => (
          <Particle key={i} delay={p.delay} emoji={p.emoji} x={p.x} />
        ))}
      </View>

      {/* 카드 */}
      <Animated.View
        entering={SlideInDown.springify().damping(15)}
        style={styles.card}
      >
        {/* 축하 이모지 */}
        <Text style={styles.celebrationEmoji}>🎉</Text>
        <Text style={styles.title}>미션 완료!</Text>

        {/* 별 표시 */}
        <View style={styles.starsRow}>
          {Array.from({ length: stars }, (_, i) => {
            const scaleStyle = useAnimatedStyle(() => ({
              transform: [{ scale: i < starScales.length ? starScales[i].value : 1 }],
            }));
            return (
              <Animated.Text key={i} style={[styles.starEmoji, scaleStyle]}>
                {i < displayedStars ? '⭐' : '☆'}
              </Animated.Text>
            );
          })}
        </View>

        {/* 카운터 */}
        <Text style={styles.counter}>
          <Text style={styles.counterBold}>+{displayedStars}</Text>
          {' '}개 별을 받았어요!
        </Text>

        {/* 구분선 */}
        <View style={styles.divider} />

        {/* 응원 메시지 */}
        {showMessage && (
          <Animated.View entering={FadeIn.delay(100)}>
            <Text style={styles.cheerMsg}>{message || cheerMsg}</Text>
          </Animated.View>
        )}

        {/* 닫기 힌트 */}
        <Text style={styles.hint}>잠시 후 자동으로 닫힙니다</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  particlesContainer: {
    position: 'absolute',
    top: '40%',
    left: SCREEN_WIDTH / 2,
    zIndex: 110,
  },
  particle: {
    position: 'absolute',
    fontSize: 24,
  },
  card: {
    width: SCREEN_WIDTH - 48,
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    // 그림자
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
    zIndex: 120,
  },
  celebrationEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F59E0B',
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  starEmoji: {
    fontSize: 44,
  },
  counter: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  counterBold: {
    fontSize: 28,
    fontWeight: '900',
    color: '#F59E0B',
  },
  divider: {
    width: '80%',
    height: 1,
    backgroundColor: '#FDE68A',
    marginBottom: 16,
  },
  cheerMsg: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
  },
  hint: {
    fontSize: 11,
    color: '#D1D5DB',
    marginTop: 8,
  },
});
