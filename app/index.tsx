import React, { useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import ErrorBoundary from '@/components/ErrorBoundary';
import FairyCharacter from '@/components/FairyCharacter';
import MissionCard from '@/components/MissionCard';
import { useAppStore } from '@/lib/store';
import { playButtonHaptic, playSuccessSound } from '@/lib/sounds';
import type { FairyEmotion } from '@/types';
import * as Haptics from 'expo-haptics';

function HomeScreenContent() {
  const router = useRouter();
  const missions = useAppStore((s) => s.missions);
  const totalStars = useAppStore((s) => s.totalStars);
  const childName = useAppStore((s) => s.childName);
  const isLoaded = useAppStore((s) => s.isLoaded);
  const loadData = useAppStore((s) => s.loadData);
  const isMissionCompletedToday = useAppStore((s) => s.isMissionCompletedToday);
  const getTodayCompleted = useAppStore((s) => s.getTodayCompleted);

  const [refreshing, setRefreshing] = React.useState(false);

  // Safe data
  const safeMissions = Array.isArray(missions) ? missions : [];
  const safeChildName = typeof childName === 'string' ? childName : '';

  const todayCompleted = getTodayCompleted();
  const todayCompletedCount = Array.isArray(todayCompleted) ? todayCompleted.length : 0;
  const allDone = todayCompletedCount >= safeMissions.length && safeMissions.length > 0;

  // Effect for haptic/sound when all done (optional, but good for "Green interaction")
  useEffect(() => {
    if (allDone) {
      playSuccessSound();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [allDone]);

  // Greeting
  const greeting = useMemo(() => {
    const name = safeChildName || '친구';
    if (allDone) return `${name}아, 오늘 여행을 모두 마쳤어! 🎉`;
    if (todayCompletedCount > 0) return `${name}아, 아주 잘하고 있어! 🚀`;
    return `안녕 ${name}! 오늘의 모험을 떠나볼까? 🗺️`;
  }, [safeChildName, allDone, todayCompletedCount]);

  const fairyEmotion: FairyEmotion = allDone
    ? 'celebrating'
    : todayCompletedCount > 0
      ? 'cheering'
      : 'waving';

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } catch (e) {
      console.error('[HabitFairy] Refresh failed:', e);
    } finally {
      setRefreshing(false);
    }
  };

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-magic-bg">
        <Animated.View entering={FadeIn.duration(800)} className="items-center">
          <Text className="text-5xl mb-4">✨</Text>
          <Text className="text-magic-purple font-bold text-lg">별이가 준비 중...</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-magic-bg">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#9333EA"
            colors={['#9333EA', '#EC4899', '#06B6D4']}
          />
        }
      >
        {/* Fairy Section - Compact */}
        <Animated.View entering={FadeIn.duration(600)} className="items-center pt-4 pb-2">
          <FairyCharacter
            emotion={fairyEmotion}
            message={greeting}
            size="md"
            showMessage
          />
        </Animated.View>

        {/* Journey Header with Star Counter */}
        <View className="px-5 mb-2 flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-bold text-gray-700 font-sans">
              🗺️ 오늘의 여정
            </Text>
            <Text className="text-gray-400 text-xs mt-0.5">
              스와이프해서 미션 확인 👉
            </Text>
          </View>
          {/* Star Counter - Integrated */}
          <View className="bg-white px-4 py-2 rounded-2xl shadow-clay-sm border border-amber-100">
            <Text className="font-bold text-amber-600 text-sm">
              ⭐ {totalStars}개
            </Text>
          </View>
        </View>

        {/* Horizontal ScrollView (Journey Map) */}
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 16 }}
            className="flex-row"
            decelerationRate="fast"
            snapToInterval={272} // card width (256px) + margin (16px)
          >
            {safeMissions.length === 0 ? (
              <View className="w-64 h-56 bg-white rounded-3xl items-center justify-center shadow-clay-md mx-2 border border-magic-lavender/30 p-4">
                <Text className="text-5xl mb-3">✨</Text>
                <Text className="text-gray-600 text-center mb-2 font-bold text-base">
                  아직 미션이 없어요!
                </Text>
                <Text className="text-gray-400 text-center text-xs">
                  설정에서 미션을 추가해주세요 🎯
                </Text>
              </View>
            ) : (
              safeMissions.map((mission, idx) => (
                <View key={mission.id} className="mr-4">
                   {/* Connectors for Journey Map Look (Dashed Line) */}
                   {idx < safeMissions.length - 1 && (
                      <View className="absolute top-1/2 -right-8 w-8 h-1 bg-gray-300 z-0" style={{ borderStyle: 'dashed', borderWidth: 1, borderColor: '#D1D5DB' }} />
                   )}
                   <MissionCard
                     mission={mission}
                     isCompleted={isMissionCompletedToday(mission.id)}
                     index={idx}
                   />
                </View>
              ))
            )}
            
            {/* End of Journey Placeholder */}
             {safeMissions.length > 0 && (
              <View className="w-16 h-72 items-center justify-center ml-1">
                <View className="bg-white/80 rounded-2xl p-3 shadow-clay-sm border border-white">
                  <Text className="text-2xl">🏁</Text>
                  <Text className="text-[10px] text-gray-500 mt-1 font-bold text-center">도착!</Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>

      </ScrollView>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <ErrorBoundary fallbackMessage="홈 화면을 불러오는 중 문제가 발생했어요">
      <HomeScreenContent />
    </ErrorBoundary>
  );
}
