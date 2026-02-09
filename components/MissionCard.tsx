import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  ZoomIn,
  interpolate,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { playButtonHaptic } from '@/lib/sounds';
import * as Haptics from 'expo-haptics';
import type { Mission, MissionCategory } from '@/types';

interface MissionCardProps {
  mission: Mission;
  isCompleted?: boolean;
  index?: number;
  compact?: boolean; // 그리드 뷰용 컴팩트 모드
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Soft Pastel Glassmorphism category themes
const CATEGORY_THEMES: Record<MissionCategory, { 
  bg: string; 
  border: string; 
  badge: string; 
  iconBg: string;
  gradient: string;
  glow: string;
}> = {
  morning: { 
    bg: 'bg-white/45', 
    border: 'border-white/60', 
    badge: 'bg-magic-peach', 
    iconBg: 'bg-magic-peach',
    gradient: 'from-magic-peach to-magic-pink',
    glow: 'shadow-glow-pink',
  },
  daytime: { 
    bg: 'bg-white/45', 
    border: 'border-white/60', 
    badge: 'bg-magic-lavender', 
    iconBg: 'bg-magic-lavender',
    gradient: 'from-magic-lavender to-magic-purple',
    glow: 'shadow-glow-lavender',
  },
  evening: { 
    bg: 'bg-white/45', 
    border: 'border-white/60', 
    badge: 'bg-magic-purple', 
    iconBg: 'bg-magic-purple',
    gradient: 'from-magic-purple to-magic-lavender',
    glow: 'shadow-glow-lavender',
  },
  study: { 
    bg: 'bg-white/45', 
    border: 'border-white/60', 
    badge: 'bg-magic-lime', 
    iconBg: 'bg-magic-lime',
    gradient: 'from-magic-lime to-magic-mint',
    glow: 'shadow-glow-mint',
  },
  health: { 
    bg: 'bg-white/45', 
    border: 'border-white/60', 
    badge: 'bg-magic-mint', 
    iconBg: 'bg-magic-mint',
    gradient: 'from-magic-mint to-magic-secondary',
    glow: 'shadow-glow-mint',
  },
};

// Helper to format timer
function formatTimer(seconds: number): string {
  if (seconds === 0) return '자유 시간';
  if (seconds < 60) return `${seconds}초`;
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return sec > 0 ? `${min}분 ${sec}초` : `${min}분`;
}

// Floating confetti with 3D effect
function Confetti({ delay = 0, color = '#FFD700', size = 10 }: { delay?: number, color?: string, size?: number }) {
  const progress = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, 
      withRepeat(withTiming(1, { duration: 2000, easing: Easing.out(Easing.quad) }), -1, false)
    );
    rotation.value = withDelay(delay,
      withRepeat(withTiming(360, { duration: 3000 }), -1, false)
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [0, -80]) },
      { rotate: `${rotation.value}deg` },
      { scale: interpolate(progress.value, [0, 0.5, 1], [1, 1.2, 0.8]) },
    ],
    opacity: interpolate(progress.value, [0, 0.3, 0.7, 1], [0, 1, 1, 0]),
  }));

  return (
    <Animated.View 
      style={[{ 
        position: 'absolute', 
        width: size, 
        height: size, 
        borderRadius: size / 2, 
        backgroundColor: color,
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      }, style]} 
    />
  );
}

// Bouncing icon animation for incomplete missions
function BouncingIcon({ children }: { children: React.ReactNode }) {
  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 600, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 600, easing: Easing.in(Easing.quad) })
      ),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

export default function MissionCard({
  mission,
  isCompleted = false,
  index = 0,
  compact = false,
}: MissionCardProps) {
  const router = useRouter();
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);
  const theme = CATEGORY_THEMES[mission.category] || CATEGORY_THEMES.morning;

  // 컴팩트 모드용 스타일
  const cardSize = compact ? 'w-40 h-48' : 'w-64 h-72';
  const iconSize = compact ? 'w-12 h-12' : 'w-20 h-20';
  const iconTextSize = compact ? 'text-2xl' : 'text-4xl';
  const titleSize = compact ? 'text-sm' : 'text-base';
  const marginTop = compact ? 'mt-4' : 'mt-8';

  useEffect(() => {
    if (isCompleted) {
      // Celebration bounce
      scale.value = withSequence(
        withSpring(1.08, { damping: 8 }),
        withSpring(1, { damping: 12 })
      );
    }
  }, [isCompleted]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotateX: `${interpolate(pressed.value, [0, 1], [0, -3])}deg` },
      { translateY: interpolate(pressed.value, [0, 1], [0, 4]) },
    ],
  }));

  // Clay-style pressed shadow effect
  const shadowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(pressed.value, [0, 1], [0.15, 0.05]),
    shadowRadius: interpolate(pressed.value, [0, 1], [12, 4]),
    shadowOffset: {
      width: interpolate(pressed.value, [0, 1], [6, 2]),
      height: interpolate(pressed.value, [0, 1], [6, 2]),
    },
  }));

  const handlePressIn = () => {
    pressed.value = withSpring(1, { damping: 15, stiffness: 200 });
    scale.value = withSpring(0.96, { damping: 15, stiffness: 200 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    pressed.value = withSpring(0, { damping: 15, stiffness: 200 });
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const handlePress = () => {
    playButtonHaptic();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/mission/${mission.id}`);
  };

  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 120).duration(600).springify()}
      className="mb-4 mx-2"
    >
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[animatedStyle, shadowStyle, {
          shadowColor: '#000',
        }]}
        className={`
          ${cardSize} ${compact ? 'p-3' : 'p-4'} rounded-3xl border-2
          items-center justify-between
          ${theme.bg} ${theme.border}
          ${isCompleted ? 'opacity-95' : ''}
        `}
      >
        {/* Status Badge - Top Right */}
        <View className={`absolute ${compact ? 'top-2 right-2' : 'top-3 right-3'} z-10`}>
          {isCompleted ? (
            <View 
              className={`${compact ? 'px-2 py-1' : 'px-3 py-1.5'} rounded-full`}
              style={{ backgroundColor: '#B5EAD7' }}
            >
              <Text className={`text-white font-bold ${compact ? 'text-[10px]' : 'text-xs'}`}>
                {compact ? '✓' : '완료 ✓'}
              </Text>
            </View>
          ) : (
            <View 
              className={`${compact ? 'px-2 py-1' : 'px-3 py-1.5'} rounded-full`}
              style={{ backgroundColor: '#FFB7B2' }}
            >
              <Text className={`text-white font-bold ${compact ? 'text-[10px]' : 'text-xs'}`}>
                {compact ? '!' : '도전!'}
              </Text>
            </View>
          )}
        </View>

        {/* Icon Area - Unified style */}
        <View className={`${marginTop} ${compact ? 'mb-1' : 'mb-2'}`}>
          {isCompleted ? (
            <View 
              className={`${iconSize} rounded-full items-center justify-center`}
              style={{ backgroundColor: 'rgba(181, 234, 215, 0.3)' }}
            >
              <Text className={iconTextSize}>{mission.icon}</Text>
            </View>
          ) : (
            <BouncingIcon>
              <View 
                className={`${iconSize} rounded-full items-center justify-center`}
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
              >
                <Text className={iconTextSize}>{mission.icon}</Text>
              </View>
            </BouncingIcon>
          )}
        </View>

        {/* Content */}
        <View className="items-center w-full z-10">
          <Text className={`${titleSize} font-bold text-gray-800 text-center mb-1 font-sans`} numberOfLines={compact ? 1 : 2}>
            {mission.name}
          </Text>
          {!compact && (
            <Text className="text-xs text-gray-500 text-center mb-2 font-sans px-1" numberOfLines={2}>
              {mission.description}
            </Text>
          )}
          
          {/* Info Pills - 컴팩트 모드에서는 별만 표시 */}
          <View className={`flex-row ${compact ? 'gap-1' : 'gap-2'}`}>
            {!compact && mission.timerSeconds > 0 && (
              <View 
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
              >
                <Text className="text-xs text-gray-600 font-semibold">⏱ {formatTimer(mission.timerSeconds)}</Text>
              </View>
            )}
            <View 
              className={`${compact ? 'px-2 py-0.5' : 'px-3 py-1'} rounded-full`}
              style={{ backgroundColor: 'rgba(255, 218, 193, 0.5)' }}
            >
              <Text className={`${compact ? 'text-[10px]' : 'text-xs'} font-semibold`} style={{ color: '#FF9AA2' }}>
                ⭐ {mission.starReward}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <View 
          className={`w-full ${compact ? 'py-2' : 'py-3'} rounded-2xl mt-2 items-center`}
          style={{ 
            backgroundColor: isCompleted ? 'rgba(181, 234, 215, 0.5)' : '#FFB7B2',
          }}
        >
          <Text 
            className={`font-bold ${compact ? 'text-xs' : 'text-sm'}`}
            style={{ color: isCompleted ? '#666' : '#fff' }}
          >
            {isCompleted 
              ? (compact ? '✅ 보기' : '✅ 기록 보기') 
              : (compact ? '🚀 시작' : '🚀 시작하기')}
          </Text>
        </View>

      </AnimatedPressable>
    </Animated.View>
  );
}
