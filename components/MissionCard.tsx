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
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { playButtonHaptic } from '@/lib/sounds';
import type { Mission, MissionCategory } from '@/types';

interface MissionCardProps {
  mission: Mission;
  isCompleted?: boolean;
  index?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CATEGORY_THEMES: Record<MissionCategory, { bg: string; border: string; badge: string; iconBg: string }> = {
  morning: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-400', iconBg: 'bg-orange-100' },
  daytime: { bg: 'bg-sky-50', border: 'border-sky-200', badge: 'bg-sky-400', iconBg: 'bg-sky-100' },
  evening: { bg: 'bg-indigo-50', border: 'border-indigo-200', badge: 'bg-indigo-400', iconBg: 'bg-indigo-100' },
  study: { bg: 'bg-violet-50', border: 'border-violet-200', badge: 'bg-violet-400', iconBg: 'bg-violet-100' },
  health: { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-500', iconBg: 'bg-emerald-100' },
};

// Helper to format timer
function formatTimer(seconds: number): string {
  if (seconds === 0) return '자유 시간';
  if (seconds < 60) return `${seconds}초`;
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return sec > 0 ? `${min}분 ${sec}초` : `${min}분`;
}

function Confetti({ delay = 0, color = '#FFD700' }: { delay?: number, color?: string }) {
  const y = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    y.value = withDelay(delay, withRepeat(withTiming(-60, { duration: 1500, easing: Easing.out(Easing.quad) }), -1, false));
    opacity.value = withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 1000 }), withTiming(0, { duration: 500 })), -1, false));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{ position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: color }, style]} />
  );
}

export default function MissionCard({
  mission,
  isCompleted = false,
  index = 0,
}: MissionCardProps) {
  const router = useRouter();
  const scale = useSharedValue(1);
  const theme = CATEGORY_THEMES[mission.category] || CATEGORY_THEMES.morning;

  useEffect(() => {
    if (isCompleted) {
      // Bounce effect on mount if completed
      scale.value = withSequence(
        withSpring(1.05),
        withSpring(1)
      );
    }
  }, [isCompleted]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(isCompleted ? 1 : 1);
  };

  const handlePress = () => {
    playButtonHaptic();
    router.push(`/mission/${mission.id}`);
  };

  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).duration(500).springify()}
      className="mb-4 mx-2"
    >
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
        className={`
          w-72 h-96 p-6 rounded-3xl border-2
          items-center justify-between
          ${theme.bg} ${theme.border}
          ${isCompleted ? 'opacity-90' : 'shadow-clay-md'}
        `}
      >
        {/* Confetti Effect for Completed */}
        {isCompleted && (
          <>
          <View className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            <View className="absolute top-1/2 left-10"><Confetti delay={0} color="#FF6B6B" /></View>
            <View className="absolute top-1/3 right-10"><Confetti delay={200} color="#4ECDC4" /></View>
            <View className="absolute bottom-1/3 left-20"><Confetti delay={400} color="#FFE66D" /></View>
            <View className="absolute top-1/2 left-1/2"><Confetti delay={600} color="#A8E6CF" /></View>
            <View className="absolute bottom-10 right-20"><Confetti delay={800} color="#FFD93D" /></View>
          </View>
          <View className="absolute top-0 left-0 right-0 items-center -mt-4 z-20">
             <Animated.Text entering={ZoomIn.delay(200)} className="text-4xl">🎉</Animated.Text>
          </View>
          </>
        )}

        {/* Status Badge */}
        <View className="absolute top-4 right-4 z-10">
          {isCompleted ? (
            <View className="bg-magic-lime px-3 py-1 rounded-full shadow-sm border border-white">
              <Text className="text-white font-bold text-xs">완료!</Text>
            </View>
          ) : (
            <View className={`${theme.badge} px-3 py-1 rounded-full shadow-sm`}>
              <Text className="text-white font-bold text-xs">도전!</Text>
            </View>
          )}
        </View>

        {/* Icon / Image Area */}
        <View className={`mt-8 mb-4 w-32 h-32 rounded-full ${theme.iconBg} items-center justify-center shadow-inner border border-white/50`}>
          <Text className="text-6xl">{mission.icon}</Text>
        </View>

        {/* Content */}
        <View className="items-center w-full z-10">
          <Text className="text-xl font-bold text-gray-800 text-center mb-2 font-sans">
            {mission.name}
          </Text>
          <Text className="text-sm text-gray-500 text-center mb-4 font-sans px-2" numberOfLines={2}>
            {mission.description}
          </Text>
          
          <View className="flex-row gap-2">
            {mission.timerSeconds > 0 && (
              <View className="bg-white/60 px-3 py-1.5 rounded-xl border border-gray-100">
                <Text className="text-xs text-gray-600">⏱ {formatTimer(mission.timerSeconds)}</Text>
              </View>
            )}
            <View className="bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-100">
              <Text className="text-xs text-yellow-600">⭐ {mission.starReward}</Text>
            </View>
          </View>
        </View>

        {/* Action Button Indicator */}
        <View className={`
          w-full py-3 rounded-xl mt-4 items-center
          ${isCompleted ? 'bg-gray-100' : theme.badge}
          shadow-sm
        `}>
          <Text className={`font-bold ${isCompleted ? 'text-gray-400' : 'text-white'}`}>
            {isCompleted ? '다시 보기' : '시작하기'}
          </Text>
        </View>

      </AnimatedPressable>
    </Animated.View>
  );
}
