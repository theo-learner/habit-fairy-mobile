import React, { useMemo, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInRight, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import ErrorBoundary from '@/components/ErrorBoundary';
import FairyCharacter from '@/components/FairyCharacter';
import MissionCard from '@/components/MissionCard';
import { useAppStore } from '@/lib/store';
import { playButtonHaptic, playSuccessSound } from '@/lib/sounds';
import type { FairyEmotion } from '@/types';
import * as Haptics from 'expo-haptics';

const CARD_WIDTH = 256; // w-64
const CARD_MARGIN = 16; // mr-4
const CARD_TOTAL_WIDTH = CARD_WIDTH + CARD_MARGIN;

// Pagination Dots Component
function PaginationDots({ 
  total, 
  current, 
  onDotPress 
}: { 
  total: number; 
  current: number;
  onDotPress?: (index: number) => void;
}) {
  if (total <= 1) return null;
  
  return (
    <View className="flex-row items-center justify-center py-3 gap-2">
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === current;
        const isCompleted = index < current;
        
        return (
          <Pressable
            key={index}
            onPress={() => onDotPress?.(index)}
            className="rounded-full"
            style={{
              width: isActive ? 24 : 8,
              height: 8,
              backgroundColor: isActive ? '#FFB7B2' : 'rgba(199, 206, 234, 0.5)',
            }}
          />
        );
      })}
      {/* Progress text */}
      <Text className="text-xs text-gray-400 ml-2 font-bold">
        {current + 1}/{total}
      </Text>
    </View>
  );
}

function HomeScreenContent() {
  const router = useRouter();
  const missions = useAppStore((s) => s.missions);
  const totalStars = useAppStore((s) => s.totalStars);
  const childName = useAppStore((s) => s.childName);
  const isLoaded = useAppStore((s) => s.isLoaded);
  const loadData = useAppStore((s) => s.loadData);
  const isMissionCompletedToday = useAppStore((s) => s.isMissionCompletedToday);
  const getTodayCompleted = useAppStore((s) => s.getTodayCompleted);
  const getStreakDays = useAppStore((s) => s.getStreakDays);

  // 연속 달성일 계산
  const streakDays = getStreakDays();

  // 레벨 계산 (별 기반: 0-9=Lv.1, 10-29=Lv.2, 30-59=Lv.3, 60-99=Lv.4, 100+=Lv.5)
  const calculateLevel = (stars: number): number => {
    if (stars >= 100) return 5;
    if (stars >= 60) return 4;
    if (stars >= 30) return 3;
    if (stars >= 10) return 2;
    return 1;
  };
  const currentLevel = calculateLevel(totalStars);

  const [refreshing, setRefreshing] = React.useState(false);
  const [currentMissionIndex, setCurrentMissionIndex] = useState(0);
  const horizontalScrollRef = useRef<ScrollView>(null);

  // Safe data
  const safeMissions = Array.isArray(missions) ? missions : [];
  const safeChildName = typeof childName === 'string' ? childName : '';

  const todayCompleted = getTodayCompleted();
  const todayCompletedCount = Array.isArray(todayCompleted) ? todayCompleted.length : 0;
  const allDone = todayCompletedCount >= safeMissions.length && safeMissions.length > 0;

  // Effect for haptic/sound when all done
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

  // Handle horizontal scroll to update pagination
  const handleHorizontalScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / CARD_TOTAL_WIDTH);
    const clampedIndex = Math.max(0, Math.min(index, safeMissions.length - 1));
    if (clampedIndex !== currentMissionIndex) {
      setCurrentMissionIndex(clampedIndex);
      Haptics.selectionAsync(); // Light haptic on page change
    }
  };

  // Scroll to specific mission
  const scrollToMission = (index: number) => {
    horizontalScrollRef.current?.scrollTo({
      x: index * CARD_TOTAL_WIDTH,
      animated: true,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: 'transparent' }}>
        <Animated.View entering={FadeIn.duration(800)} className="items-center">
          <Text className="text-5xl mb-4">✨</Text>
          <Text className="text-gray-600 font-bold text-lg">별이가 준비 중...</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: 'transparent' }}>
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

        {/* Progress Card - 오늘의 진행률 */}
        <Animated.View 
          entering={FadeIn.delay(200).duration(500)}
          className="mx-5 mb-4 p-4 rounded-3xl"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.8)',
          }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-sm text-gray-500 font-semibold">오늘의 진행률</Text>
              <Text className="text-lg font-bold text-gray-700">
                {safeMissions.length > 0 
                  ? allDone 
                    ? '모두 완료! 🎉' 
                    : `${todayCompletedCount}/${safeMissions.length} 완료`
                  : '미션을 추가해주세요'}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-3xl">
                {allDone ? '🏆' : todayCompletedCount > 0 ? '🔥' : '💪'}
              </Text>
            </View>
          </View>
          {/* Progress Bar */}
          <View className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
            <View 
              className="h-full rounded-full"
              style={{ 
                width: safeMissions.length > 0 ? `${(todayCompletedCount / safeMissions.length) * 100}%` : '0%',
                backgroundColor: allDone ? '#B5EAD7' : '#FFB7B2',
              }}
            />
          </View>
          {/* Stats Row */}
          <View className="flex-row justify-around mt-3 pt-3" style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.5)' }}>
            <View className="items-center">
              <Text className="text-2xl">💎</Text>
              <Text className="text-sm font-bold text-gray-600">{totalStars}</Text>
              <Text className="text-xs text-gray-400">보석</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl">📅</Text>
              <Text className="text-sm font-bold text-gray-600">{streakDays}</Text>
              <Text className="text-xs text-gray-400">연속일</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl">⭐</Text>
              <Text className="text-sm font-bold text-gray-600">Lv.{currentLevel}</Text>
              <Text className="text-xs text-gray-400">레벨</Text>
            </View>
          </View>
        </Animated.View>

        {/* Journey Header */}
        <View className="px-5 mb-2">
          <Text className="text-lg font-bold text-gray-700 font-sans">
            🗺️ 오늘의 미션
          </Text>
        </View>

        {/* Horizontal ScrollView (Journey Map) */}
        <View>
          <ScrollView
            ref={horizontalScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 12 }}
            className="flex-row"
            decelerationRate="fast"
            snapToInterval={CARD_TOTAL_WIDTH}
            snapToAlignment="start"
            onScroll={handleHorizontalScroll}
            scrollEventThrottle={16}
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

          {/* Pagination Dots */}
          {safeMissions.length > 1 && (
            <PaginationDots 
              total={safeMissions.length} 
              current={currentMissionIndex}
              onDotPress={scrollToMission}
            />
          )}
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
