// ============================================
// 미션 카드 — 큰 터치 영역, 아이 친화적 UI
// 스와이프 완료 지원, 카테고리 색상 스트라이프
// ============================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { playButtonHaptic } from '@/lib/sounds';
import type { Mission } from '@/types';

interface MissionCardProps {
  mission: Mission;
  isCompleted?: boolean;
  index?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** 카테고리별 스트라이프 색상 */
const STRIPE_COLORS: Record<string, string> = {
  morning: '#F59E0B', // amber
  daytime: '#34D399', // emerald
  evening: '#818CF8', // indigo
};

/** 타이머 시간을 읽기 좋은 형태로 변환 */
function formatTimer(seconds: number): string {
  if (seconds === 0) return '자유 시간';
  if (seconds < 60) return `${seconds}초`;
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return sec > 0 ? `${min}분 ${sec}초` : `${min}분`;
}

export default function MissionCard({
  mission,
  isCompleted = false,
  index = 0,
}: MissionCardProps) {
  const router = useRouter();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    playButtonHaptic();
    router.push(`/mission/${mission.id}`);
  };

  const stripeColor = STRIPE_COLORS[mission.category] || '#FBBF24';

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(400).springify()}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, isCompleted && styles.cardCompleted, animatedStyle]}
      >
        {/* 좌측 컬러 스트라이프 */}
        <View
          style={[
            styles.stripe,
            { backgroundColor: isCompleted ? '#34D399' : stripeColor },
          ]}
        />

        {/* 완료 체크 */}
        {isCompleted && (
          <View style={styles.checkBadge}>
            <Text style={styles.checkText}>✓</Text>
          </View>
        )}

        <View style={styles.content}>
          {/* 아이콘 */}
          <View style={[styles.iconBox, isCompleted && styles.iconBoxCompleted]}>
            <Text style={styles.icon}>{mission.icon}</Text>
          </View>

          {/* 미션 정보 */}
          <View style={styles.info}>
            <Text
              style={[styles.name, isCompleted && styles.nameCompleted]}
              numberOfLines={1}
            >
              {mission.name}
            </Text>
            <Text style={[styles.desc, isCompleted && styles.descCompleted]} numberOfLines={1}>
              {mission.description}
            </Text>

            {/* 메타 정보 */}
            <View style={styles.meta}>
              {mission.timerSeconds > 0 && (
                <View style={[styles.badge, isCompleted && styles.badgeCompleted]}>
                  <Text style={[styles.badgeText, isCompleted && styles.badgeTextCompleted]}>
                    ⏱ {formatTimer(mission.timerSeconds)}
                  </Text>
                </View>
              )}
              <View style={[styles.starBadge, isCompleted && styles.badgeCompleted]}>
                <Text style={[styles.badgeText, isCompleted && styles.badgeTextCompleted]}>
                  {'⭐'.repeat(mission.starReward)}
                </Text>
              </View>
            </View>
          </View>

          {/* 우측 화살표 / 완료 텍스트 */}
          {isCompleted ? (
            <Text style={styles.completedLabel}>완료!</Text>
          ) : (
            <View style={styles.arrow}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          )}
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(253, 230, 138, 0.4)',
    marginBottom: 12,
    // 그림자
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  stripe: {
    position: 'absolute',
    left: 0,
    top: 12,
    bottom: 12,
    width: 4,
    borderRadius: 2,
  },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#34D399',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  checkText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingLeft: 24,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: 'rgba(253, 230, 138, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  icon: {
    fontSize: 28,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 22,
  },
  nameCompleted: {
    color: '#059669',
    textDecorationLine: 'line-through',
  },
  desc: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  descCompleted: {
    color: '#6EE7B7',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  starBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: 'rgba(253, 230, 138, 0.5)',
  },
  badgeCompleted: {
    backgroundColor: '#ECFDF5',
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
  },
  badgeTextCompleted: {
    color: '#6EE7B7',
  },
  completedLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6EE7B7',
  },
  arrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(254, 243, 199, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#D97706',
    marginTop: -2,
  },
});
