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
import EvolutionaryCharacter from '@/components/EvolutionaryCharacter';
import MissionCard from '@/components/MissionCard';
import { usePetStore } from '@/store/usePetStore';
import PetFactory from '@/utils/petFactory';
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

  // Evolution System
  const pet = usePetStore((s) => s.pet);
  const canEvolve = usePetStore((s) => s.canEvolve);
  const getExpProgress = usePetStore((s) => s.getExpProgress);
  const stageConfig = PetFactory.getStageConfig(pet.type, pet.currentStage);

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
        <Text className="text-magic-purple font-bold text-lg">✨ 별이가 준비 중...</Text>
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
            tintColor="#8B5CF6"
            colors={['#8B5CF6']}
          />
        }
      >
        {/* Fairy Section with Evolution System */}
        <Animated.View entering={FadeIn.duration(600)} className="items-center py-6">
          {/* Evolution Character */}
          <EvolutionaryCharacter
            size="lg"
            showExpBar={pet.currentStage < 3}
            showDialogue={true}
          />
          
          {/* Stage & Stars Info */}
          <View className="flex-row items-center gap-3 mt-4">
            <View className="bg-purple-100 px-3 py-1.5 rounded-full border border-purple-200">
              <Text className="font-bold text-purple-600 text-sm">
                {pet.currentStage === 1 ? '🥚 알' : pet.currentStage === 2 ? '🐣 아기' : '⭐ 성장 완료'}
              </Text>
            </View>
            <View className="bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
              <Text className="font-bold text-amber-600 text-sm">
                ⭐ {totalStars}개
              </Text>
            </View>
          </View>

          {/* Evolution Progress Hint */}
          {pet.currentStage < 3 && (
            <Text className="text-gray-400 text-xs mt-2">
              미션을 완료하면 경험치가 올라요! (별 1개 = 5 EXP)
            </Text>
          )}
        </Animated.View>

        {/* Journey Map Title */}
        <View className="px-6 mb-2">
          <Text className="text-xl font-bold text-gray-700 font-sans">
            🗺️ 오늘의 여정
          </Text>
          <Text className="text-gray-400 text-sm">
            오른쪽으로 스크롤해서 미션을 확인하세요 👉
          </Text>
        </View>

        {/* Horizontal ScrollView (Journey Map) */}
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 16 }}
            className="flex-row"
            decelerationRate="fast"
            snapToInterval={300} // card width (approx) + margin
          >
            {safeMissions.length === 0 ? (
              <View className="w-80 h-64 bg-white rounded-3xl items-center justify-center shadow-clay-md mx-2">
                <Text className="text-4xl mb-4">✨</Text>
                <Text className="text-gray-500 text-center mb-4">
                  아직 미션이 없어요.{'\n'}설정에서 미션을 추가해주세요!
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
              <View className="w-20 h-96 items-center justify-center opacity-50 ml-2">
                <Text className="text-2xl">🏁</Text>
                <Text className="text-xs text-gray-400 mt-2 font-bold">도착!</Text>
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
