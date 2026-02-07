// ============================================
// 홈 화면 — 요정 캐릭터 + 미션 카드 리스트
// 카테고리별 (아침/낮/저녁) 미션 그룹핑
// Null Safety 강화 + ErrorBoundary 적용
// ============================================

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import ErrorBoundary from '@/components/ErrorBoundary';
import FairyCharacter from '@/components/FairyCharacter';
import MissionCard from '@/components/MissionCard';
import { useAppStore } from '@/lib/store';
import {
  groupMissionsByCategory,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
} from '@/lib/missions';
import type { FairyEmotion } from '@/types';

function HomeScreenContent() {
  const missions = useAppStore((s) => s.missions);
  const totalStars = useAppStore((s) => s.totalStars);
  const childName = useAppStore((s) => s.childName);
  const isLoaded = useAppStore((s) => s.isLoaded);
  const loadData = useAppStore((s) => s.loadData);
  const isMissionCompletedToday = useAppStore((s) => s.isMissionCompletedToday);
  const getTodayCompleted = useAppStore((s) => s.getTodayCompleted);

  const [refreshing, setRefreshing] = React.useState(false);

  // null safety: missions가 배열인지 확인
  const safeMissions = Array.isArray(missions) ? missions : [];
  const safeTotalStars = typeof totalStars === 'number' ? totalStars : 0;
  const safeChildName = typeof childName === 'string' ? childName : '';

  const grouped = useMemo(() => groupMissionsByCategory(safeMissions), [safeMissions]);
  const todayCompleted = getTodayCompleted();
  const todayCompletedCount = Array.isArray(todayCompleted) ? todayCompleted.length : 0;
  const allDone = todayCompletedCount >= safeMissions.length && safeMissions.length > 0;

  // 요정 인사말
  const greeting = useMemo(() => {
    const name = safeChildName || '친구';
    if (allDone) return `${name}아, 오늘 미션 올클리어! 🎉 정말 대단해!`;
    if (todayCompletedCount > 0) return `${name}아, 잘하고 있어! 조금만 더 힘내자! 💪`;
    return `안녕 ${name}! 나는 습관요정 별이야! ✨\n오늘도 신나는 미션을 함께하자!`;
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
      console.error('[HabitFairy] 새로고침 실패:', e);
    } finally {
      setRefreshing(false);
    }
  };

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>✨ 별이가 준비 중...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FBBF24"
            colors={['#FBBF24']}
          />
        }
      >
        {/* 요정 캐릭터 + 인사 */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.fairySection}>
          <FairyCharacter
            emotion={fairyEmotion}
            message={greeting}
            size="lg"
            showMessage
          />
        </Animated.View>

        {/* 별 카운터 */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.starCounter}>
          <Text style={styles.starCounterText}>⭐ × {safeTotalStars}</Text>
        </Animated.View>

        {/* 오늘 요약 */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{safeMissions.length}</Text>
            <Text style={styles.summaryLabel}>오늘의 미션</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: '#34D399' }]}>
              {todayCompletedCount}
            </Text>
            <Text style={styles.summaryLabel}>완료</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>
              {Math.max(0, safeMissions.length - todayCompletedCount)}
            </Text>
            <Text style={styles.summaryLabel}>남은 미션</Text>
          </View>
        </Animated.View>

        {/* 카테고리별 미션 리스트 */}
        {CATEGORY_ORDER.map((cat) => {
          const catMissions = grouped?.[cat];
          if (!Array.isArray(catMissions) || catMissions.length === 0) return null;
          return (
            <View key={cat} style={styles.categorySection}>
              <Text style={styles.categoryLabel}>
                {CATEGORY_LABELS[cat]}
              </Text>
              {catMissions.map((mission, idx) => (
                <MissionCard
                  key={mission?.id ?? `mission-${idx}`}
                  mission={mission}
                  isCompleted={isMissionCompletedToday(mission?.id ?? '')}
                  index={idx}
                />
              ))}
            </View>
          );
        })}

        {/* 미션이 하나도 없을 때 */}
        {safeMissions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🧚</Text>
            <Text style={styles.emptyText}>아직 미션이 없어요{'\n'}대시보드에서 미션을 추가해보세요!</Text>
          </View>
        )}

        {/* 하단 여백 */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/** ErrorBoundary로 감싼 홈 화면 */
export default function HomeScreen() {
  return (
    <ErrorBoundary fallbackMessage="홈 화면을 불러오는 중 문제가 발생했어요">
      <HomeScreenContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFBEB',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#F59E0B',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  fairySection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  starCounter: {
    alignSelf: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  starCounterText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#B45309',
  },
  summary: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    // 그림자
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E7EB',
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 12,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
});
