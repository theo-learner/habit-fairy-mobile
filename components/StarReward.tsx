// ============================================
// 별 보상 애니메이션 — 축하 오버레이
// Reanimated 기반 파티클 + 별 카운트업
// starCount 0/undefined 방어 + 화면 이탈 cleanup
// ============================================

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
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
  cancelAnimation,
} from 'react-native-reanimated';
import { playStarHaptic, playFanfareHaptic } from '@/lib/sounds';
import { getAppWidth } from '@/lib/layout';

interface StarRewardProps {
  stars: number;
  isVisible: boolean;
  onComplete?: () => void;
  message?: string;
}

const SCREEN_WIDTH = getAppWidth();

/** 축하 메시지 랜덤 */
const CHEER_MESSAGES = [
  '정말 잘했어! 최고야! 🌈',
  '와, 대단해! 멋지다! ✨',
  '요정이 감동했어! 💫',
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

    // cleanup: 언마운트 시 애니메이션 취소
    return () => {
      cancelAnimation(translateY);
      cancelAnimation(opacity);
      cancelAnimation(rotate);
    };
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

/** 개별 별 아이템 — hooks 규칙 준수를 위해 컴포넌트로 분리 */
function StarItem({
  index,
  displayed,
  scale,
}: {
  index: number;
  displayed: boolean;
  scale: any;
}) {
  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.Text style={[styles.starEmoji, scaleStyle]}>
      {displayed ? '⭐' : '☆'}
    </Animated.Text>
  );
}

export default function StarReward({
  stars,
  isVisible,
  onComplete,
  message,
}: StarRewardProps) {
  // stars 유효성 검증: 0 이하이거나 비정상 값이면 최소 1
  const safeStars = typeof stars === 'number' && stars > 0 ? Math.min(stars, 5) : 1;

  const [displayedStars, setDisplayedStars] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [cheerMsg] = useState(() =>
    CHEER_MESSAGES[Math.floor(Math.random() * CHEER_MESSAGES.length)],
  );

  // 마운트 상태 추적 — cleanup 용
  const mountedRef = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 별 등장 scale 애니메이션 (최대 5개)
  const starScale0 = useSharedValue(0);
  const starScale1 = useSharedValue(0);
  const starScale2 = useSharedValue(0);
  const starScale3 = useSharedValue(0);
  const starScale4 = useSharedValue(0);
  const starScales = [starScale0, starScale1, starScale2, starScale3, starScale4];

  // cleanup 헬퍼
  const clearTimers = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (autoCloseRef.current) {
      clearTimeout(autoCloseRef.current);
      autoCloseRef.current = null;
    }
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
      messageTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTimers();
      // 애니메이션 정리
      starScales.forEach((s) => cancelAnimation(s));
    };
  }, []);

  useEffect(() => {
    if (!isVisible) {
      // 보이지 않으면 초기화
      if (mountedRef.current) {
        setDisplayedStars(0);
        setShowMessage(false);
      }
      starScales.forEach((s) => { s.value = 0; });
      clearTimers();
      return;
    }

    // 팡파레 햅틱
    playFanfareHaptic();

    // 별 하나씩 카운트업
    let count = 0;
    intervalRef.current = setInterval(() => {
      if (!mountedRef.current) {
        clearTimers();
        return;
      }

      count += 1;
      setDisplayedStars(count);
      playStarHaptic();

      // 별 spring 애니메이션
      if (count - 1 < starScales.length) {
        starScales[count - 1].value = withSpring(1, { damping: 8, stiffness: 200 });
      }

      if (count >= safeStars) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        messageTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) setShowMessage(true);
        }, 300);
        // 자동 닫기
        autoCloseRef.current = setTimeout(() => {
          if (mountedRef.current) {
            onComplete?.();
          }
        }, 3500);
      }
    }, 500);

    return () => {
      clearTimers();
    };
  }, [isVisible, safeStars]);

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
          {Array.from({ length: safeStars }, (_, i) => (
            <StarItem
              key={i}
              index={i}
              displayed={i < displayedStars}
              scale={i < starScales.length ? starScales[i] : starScales[0]}
            />
          ))}
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
