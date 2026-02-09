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
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// 2026 Clay-style category themes (Dopamine Brights)
const CATEGORY_THEMES: Record<MissionCategory, { 
  bg: string; 
  border: string; 
  badge: string; 
  iconBg: string;
  gradient: string;
  glow: string;
}> = {
  morning: { 
    bg: 'bg-clay-orange-light', 
    border: 'border-clay-orange-main/30', 
    badge: 'bg-clay-orange-main', 
    iconBg: 'bg-gradient-to-br from-orange-100 to-amber-50',
    gradient: 'from-orange-400 to-amber-500',
    glow: 'shadow-glow-pink',
  },
  daytime: { 
    bg: 'bg-clay-blue-light', 
    border: 'border-clay-blue-main/30', 
    badge: 'bg-clay-blue-main', 
    iconBg: 'bg-gradient-to-br from-sky-100 to-cyan-50',
    gradient: 'from-sky-400 to-cyan-500',
    glow: 'shadow-glow-cyan',
  },
  evening: { 
    bg: 'bg-clay-purple-light', 
    border: 'border-clay-purple-main/30', 
    badge: 'bg-clay-purple-main', 
    iconBg: 'bg-gradient-to-br from-violet-100 to-purple-50',
    gradient: 'from-violet-500 to-purple-600',
    glow: 'shadow-glow-purple',
  },
  study: { 
    bg: 'bg-clay-pink-light', 
    border: 'border-clay-pink-main/30', 
    badge: 'bg-clay-pink-main', 
    iconBg: 'bg-gradient-to-br from-pink-100 to-rose-50',
    gradient: 'from-pink-400 to-rose-500',
    glow: 'shadow-glow-pink',
  },
  health: { 
    bg: 'bg-clay-green-light', 
    border: 'border-clay-green-main/30', 
    badge: 'bg-clay-green-main', 
    iconBg: 'bg-gradient-to-br from-emerald-100 to-green-50',
    gradient: 'from-emerald-400 to-green-500',
    glow: 'shadow-glow-cyan',
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
}: MissionCardProps) {
  const router = useRouter();
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);
  const theme = CATEGORY_THEMES[mission.category] || CATEGORY_THEMES.morning;

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
          w-64 h-72 p-4 rounded-3xl border-2
          items-center justify-between
          ${theme.bg} ${theme.border}
          ${isCompleted ? 'opacity-95' : ''}
        `}
      >
        {/* Confetti Effect for Completed */}
        {isCompleted && (
          <>
            <View className="absolute inset-0 pointer-events-none overflow-hidden rounded-4xl">
              <View className="absolute top-1/2 left-8"><Confetti delay={0} color="#FF6B6B" size={12} /></View>
              <View className="absolute top-1/3 right-8"><Confetti delay={150} color="#4ECDC4" size={10} /></View>
              <View className="absolute bottom-1/3 left-16"><Confetti delay={300} color="#FFE66D" size={14} /></View>
              <View className="absolute top-1/2 left-1/2"><Confetti delay={450} color="#A8E6CF" size={8} /></View>
              <View className="absolute bottom-1/4 right-16"><Confetti delay={600} color="#FF9FF3" size={11} /></View>
              <View className="absolute top-1/4 left-1/3"><Confetti delay={750} color="#54A0FF" size={9} /></View>
            </View>
            <View className="absolute top-0 left-0 right-0 items-center -mt-5 z-20">
              <Animated.View entering={ZoomIn.delay(200).springify()}>
                <Text className="text-5xl">🎉</Text>
              </Animated.View>
            </View>
          </>
        )}

        {/* Status Badge - Clay style */}
        <View className="absolute top-4 right-4 z-10">
          {isCompleted ? (
            <View className="bg-magic-lime px-4 py-1.5 rounded-full shadow-clay-sm border-2 border-white">
              <Text className="text-white font-bold text-xs">완료! ✨</Text>
            </View>
          ) : (
            <View className={`${theme.badge} px-4 py-1.5 rounded-full shadow-clay-sm border-2 border-white/50`}>
              <Text className="text-white font-bold text-xs">도전! 💪</Text>
            </View>
          )}
        </View>

        {/* Icon Area - Compact Clay 3D style */}
        <View className="mt-6 mb-2">
          {isCompleted ? (
            <View className="w-20 h-20 rounded-full bg-magic-mint items-center justify-center shadow-clay-md border-2 border-white">
              <Text className="text-4xl">{mission.icon}</Text>
            </View>
          ) : (
            <BouncingIcon>
              <View className="w-20 h-20 rounded-full bg-white items-center justify-center shadow-clay-md border-2 border-white">
                <Text className="text-4xl">{mission.icon}</Text>
              </View>
            </BouncingIcon>
          )}
        </View>

        {/* Content */}
        <View className="items-center w-full z-10">
          <Text className="text-base font-bold text-gray-800 text-center mb-1 font-sans">
            {mission.name}
          </Text>
          <Text className="text-xs text-gray-500 text-center mb-2 font-sans px-1" numberOfLines={2}>
            {mission.description}
          </Text>
          
          {/* Info Pills - Compact */}
          <View className="flex-row gap-1.5">
            {mission.timerSeconds > 0 && (
              <View className="bg-white px-2.5 py-1 rounded-xl shadow-clay-sm border border-gray-100">
                <Text className="text-[10px] text-gray-600 font-bold">⏱ {formatTimer(mission.timerSeconds)}</Text>
              </View>
            )}
            <View className="bg-magic-yellow/20 px-2.5 py-1 rounded-xl shadow-clay-sm border border-yellow-200">
              <Text className="text-[10px] text-yellow-700 font-bold">⭐ {mission.starReward}</Text>
            </View>
          </View>
        </View>

        {/* Action Button - Compact */}
        <View className={`
          w-full py-2.5 rounded-xl mt-2 items-center
          ${isCompleted ? 'bg-gray-100 shadow-clay-inner' : `${theme.badge} shadow-clay-sm`}
          border border-white/50
        `}>
          <Text className={`font-bold text-sm ${isCompleted ? 'text-gray-400' : 'text-white'}`}>
            {isCompleted ? '👀 다시 보기' : '🚀 시작하기'}
          </Text>
        </View>

      </AnimatedPressable>
    </Animated.View>
  );
}
