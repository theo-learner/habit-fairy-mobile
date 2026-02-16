import React, { useMemo, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Image,
  Dimensions,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop, Path, Ellipse } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

import ErrorBoundary from '@/components/ErrorBoundary';
import { useAppStore } from '@/lib/store';
import { playButtonHaptic, playSuccessSound, playCompleteHaptic } from '@/lib/sounds';
import { CHARACTERS } from '@/lib/characters';
import { getAppWidth } from '@/lib/layout';

const SCREEN_WIDTH = getAppWidth();

// ─── Headspace Kids 스타일 색상 ───
const C = {
  lavender: '#8E97C8',
  lavenderLight: '#B8C0E8',
  lavenderPale: '#D4D9F0',
  sage: '#7DB89E',
  dark: '#4A5568',
  coral: '#E8744F',
  white: '#FFFFFF',
  textDark: '#2D3436',
  textMid: '#636E72',
  textLight: '#B2BEC3',
};

// ─── 온보딩 (Headspace Kids 스타일) ───
function OnboardingScreen({ onComplete }: { onComplete: (name: string) => void }) {
  const [name, setName] = useState('');

  const handleStart = () => {
    const trimmed = name.trim() || '별이';
    playButtonHaptic();
    onComplete(trimmed);
  };

  return (
    <LinearGradient colors={['#8E97C8', '#B8C0E8']} style={styles.onboardingContainer}>
      <Animated.View entering={FadeInDown.duration(600)} style={styles.onboardingContent}>
        {/* 캐릭터 영역 */}
        <View style={styles.onboardingCharArea}>
          <Text style={styles.onboardingEmoji}>🧚‍♀️</Text>
        </View>
        <Text style={styles.onboardingTitle}>안녕! 나는 습관요정이야!</Text>
        <Text style={styles.onboardingSubtitle}>
          매일 함께 좋은 습관을 만들어 볼까?{'\n'}이름을 알려줘!
        </Text>
        <TextInput
          style={styles.onboardingInput}
          placeholder="이름을 입력해줘"
          placeholderTextColor="#B2BEC3"
          value={name}
          onChangeText={setName}
          maxLength={10}
          autoFocus
        />
        <Pressable
          onPress={handleStart}
          style={({ pressed }) => [
            styles.pillButton,
            pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 },
          ]}
        >
          <Text style={styles.pillButtonText}>모험 시작하기! 🚀</Text>
        </Pressable>
      </Animated.View>
    </LinearGradient>
  );
}

/** 긍정적 진행률 메시지 */
function getProgressMessage(completed: number, total: number): string {
  if (total === 0) return '미션을 추가해볼까? ✨';
  const ratio = completed / total;
  if (ratio === 0) return '첫 모험을 시작해볼까? ✨';
  if (ratio < 0.5) return `좋은 시작이야! ${total - completed}개 남았어!`;
  if (ratio < 1) return `거의 다 했어! 조금만 더! 💪`;
  return '오늘의 영웅! 🌟';
}

// ─── Hero 풍경 배경 (Headspace Kids 스타일 언덕+구름) ───
function HeroLandscape({ children }: { children: React.ReactNode }) {
  const W = SCREEN_WIDTH;
  return (
    <View style={styles.heroContainer}>
      {/* 배경 구름 */}
      <Svg width="100%" height={260} viewBox={`0 0 ${W} 260`} style={styles.heroSvg}>
        {/* 구름 1 */}
        <Ellipse cx={80} cy={60} rx={50} ry={22} fill="rgba(255,255,255,0.35)" />
        <Ellipse cx={110} cy={55} rx={35} ry={18} fill="rgba(255,255,255,0.3)" />
        {/* 구름 2 */}
        <Ellipse cx={W - 70} cy={80} rx={45} ry={20} fill="rgba(255,255,255,0.3)" />
        <Ellipse cx={W - 40} cy={75} rx={30} ry={15} fill="rgba(255,255,255,0.25)" />
        {/* 구름 3 작은 */}
        <Ellipse cx={W / 2 + 30} cy={40} rx={25} ry={12} fill="rgba(255,255,255,0.2)" />
        {/* 언덕 */}
        <Path
          d={`M0 220 Q${W * 0.25} 170 ${W * 0.5} 195 Q${W * 0.75} 220 ${W} 185 L${W} 260 L0 260 Z`}
          fill="rgba(125,184,158,0.25)"
        />
        <Path
          d={`M0 230 Q${W * 0.3} 205 ${W * 0.6} 218 Q${W * 0.85} 230 ${W} 215 L${W} 260 L0 260 Z`}
          fill="rgba(125,184,158,0.15)"
        />
        {/* 나무 */}
        <Circle cx={60} cy={200} r={18} fill="rgba(125,184,158,0.35)" />
        <Circle cx={55} cy={193} r={14} fill="rgba(125,184,158,0.3)" />
        <Circle cx={W - 50} cy={180} r={15} fill="rgba(125,184,158,0.3)" />
        <Circle cx={W - 45} cy={173} r={11} fill="rgba(125,184,158,0.25)" />
      </Svg>
      {/* 캐릭터 영역 */}
      <View style={styles.heroCharacterArea}>
        {children}
      </View>
    </View>
  );
}

// ─── 체크 완료 애니메이션 ───
function CompletionAnimation({
  visible,
  onDone,
}: {
  visible: boolean;
  onDone: () => void;
}) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onDone, 500);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      entering={ZoomIn.duration(300).springify().damping(10)}
      style={styles.completionOverlay}
    >
      <Text style={styles.completionEmoji}>✅</Text>
      <Text style={styles.completionText}>잘했어! 🎉</Text>
    </Animated.View>
  );
}

// ─── Headspace 스타일 미션 카드 (원형 아이콘 + 하단 텍스트) ───
function MissionCircleCard({
  mission,
  isCompleted,
  streakDays,
  onPress,
  onQuickCheck,
}: {
  mission: any;
  isCompleted: boolean;
  streakDays: number;
  onPress: () => void;
  onQuickCheck: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.missionCircleWrapper}
      accessibilityRole="button"
      accessibilityLabel={`${mission.name} 미션${isCompleted ? ', 완료됨' : ''}`}
    >
      {/* 원형 아이콘 */}
      <View style={[
        styles.missionCircle,
        isCompleted && styles.missionCircleCompleted,
      ]}>
        <Text style={styles.missionCircleIcon}>{mission.icon}</Text>
        {isCompleted && (
          <View style={styles.missionCheckBadge}>
            <Text style={{ fontSize: 12, color: '#FFF' }}>✓</Text>
          </View>
        )}
      </View>

      {/* 미션 이름 */}
      <Text style={styles.missionCircleName} numberOfLines={2}>
        {mission.name}
      </Text>

      {/* 연속일 */}
      {streakDays > 0 && !isCompleted && (
        <Text style={styles.missionStreakText}>🔥{streakDays}일</Text>
      )}

      {/* 빠른 체크 버튼 (미완료 시) */}
      {!isCompleted && (
        <Pressable
          onPress={(e) => {
            e.stopPropagation?.();
            onQuickCheck();
          }}
          hitSlop={8}
          style={({ pressed }) => [
            styles.quickCheckBtn,
            pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
          ]}
        >
          <Text style={styles.quickCheckText}>체크 ✓</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

function HomeScreenContent() {
  const router = useRouter();
  const missions = useAppStore((s) => s.missions);
  const childName = useAppStore((s) => s.childName) || '';
  const selectedCharacterId = useAppStore((s) => s.selectedCharacter);
  const loadData = useAppStore((s) => s.loadData);
  const setChildName = useAppStore((s) => s.setChildName);
  const isMissionCompletedToday = useAppStore((s) => s.isMissionCompletedToday);
  const getTodayCompleted = useAppStore((s) => s.getTodayCompleted);
  const completeMission = useAppStore((s) => s.completeMission);
  const getStreakDays = useAppStore((s) => s.getStreakDays);
  const isLoaded = useAppStore((s) => s.isLoaded);

  const [refreshing, setRefreshing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCompletionAnim, setShowCompletionAnim] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded && !childName) {
      setShowOnboarding(true);
    }
  }, [isLoaded, childName]);

  const handleOnboardingComplete = async (name: string) => {
    await setChildName(name);
    setShowOnboarding(false);
  };

  const character = CHARACTERS.find((c) => c.id === selectedCharacterId) || CHARACTERS[0];

  const safeMissions = Array.isArray(missions) ? missions : [];
  const todayCompleted = getTodayCompleted();
  const completedCount = Array.isArray(todayCompleted) ? todayCompleted.length : 0;
  const totalCount = safeMissions.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const streakDays = getStreakDays();

  const sortedMissions = useMemo(() => {
    return [...safeMissions].sort((a, b) => {
      const aCompleted = isMissionCompletedToday(a.id) ? 1 : 0;
      const bCompleted = isMissionCompletedToday(b.id) ? 1 : 0;
      return aCompleted - bCompleted;
    });
  }, [safeMissions, todayCompleted]);

  const incompleteMissions = sortedMissions.filter((m) => !isMissionCompletedToday(m.id));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleMissionPress = (id: string) => {
    playButtonHaptic();
    router.push(`/mission/${id}`);
  };

  const handleQuickCheck = async (mission: any) => {
    playCompleteHaptic();
    await completeMission(mission.id, mission.starReward);
    setShowCompletionAnim(true);
  };

  const handleCtaPress = () => {
    playButtonHaptic();
    if (incompleteMissions.length > 0) {
      router.push(`/mission/${incompleteMissions[0].id}`);
    }
  };

  const greetingMessage = useMemo(() => {
    const displayName = childName || '별이';
    return `안녕, ${displayName}!`;
  }, [childName]);

  const progressMessage = useMemo(() => {
    return getProgressMessage(completedCount, totalCount);
  }, [completedCount, totalCount]);

  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero 영역: 캐릭터 + 풍경 배경 */}
        <HeroLandscape>
          <Animated.Image
            entering={FadeIn.duration(800)}
            source={character.asset}
            style={styles.heroCharImage}
            resizeMode="contain"
          />
        </HeroLandscape>

        {/* 인사 + 진행률 pill */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>{greetingMessage}</Text>
          <Text style={styles.greetingSubtitle}>{progressMessage}</Text>

          {/* 진행률 pill */}
          <View style={styles.progressPill}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${Math.max(progress, 5)}%` }]} />
            </View>
            <Text style={styles.progressPillText}>
              {completedCount}/{totalCount} 완료
            </Text>
          </View>

          {streakDays > 0 && (
            <View style={styles.streakPill}>
              <Text style={styles.streakPillText}>🔥 {streakDays}일 연속 달성!</Text>
            </View>
          )}
        </Animated.View>

        {/* 미션 그리드 (Headspace 카테고리 스타일: 2열 원형 아이콘) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>오늘의 미션</Text>
        </View>

        <View style={styles.missionGrid}>
          {sortedMissions.map((mission, index) => (
            <Animated.View
              key={mission.id}
              entering={FadeInDown.delay(300 + index * 80)}
              style={styles.missionGridItem}
            >
              <MissionCircleCard
                mission={mission}
                isCompleted={isMissionCompletedToday(mission.id)}
                streakDays={streakDays}
                onPress={() => handleMissionPress(mission.id)}
                onQuickCheck={() => handleQuickCheck(mission)}
              />
            </Animated.View>
          ))}

          {/* 추가 버튼 */}
          <View style={styles.missionGridItem}>
            <Pressable
              onPress={() => router.push('/manage')}
              style={styles.addMissionCircle}
            >
              <View style={styles.addMissionIcon}>
                <Text style={{ fontSize: 28, color: C.textLight }}>+</Text>
              </View>
              <Text style={[styles.missionCircleName, { color: C.textLight }]}>추가</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* CTA pill 버튼 */}
      {incompleteMissions.length > 0 && (
        <Animated.View entering={FadeInUp.delay(500)} style={styles.ctaContainer}>
          <Pressable
            onPress={handleCtaPress}
            style={({ pressed }) => [
              styles.ctaPill,
              pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 },
            ]}
          >
            <Text style={styles.ctaPillText}>
              지금 체크하기 ✨ ({incompleteMissions.length}개 남음)
            </Text>
          </Pressable>
        </Animated.View>
      )}

      <CompletionAnimation
        visible={showCompletionAnim}
        onDone={() => setShowCompletionAnim(false)}
      />
    </SafeAreaView>
  );
}

export default function HomeScreen() {
  return (
    <ErrorBoundary fallbackMessage="홈 화면 오류">
      <HomeScreenContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ── Hero 풍경 ──
  heroContainer: {
    height: 260,
    position: 'relative',
    overflow: 'hidden',
    maxWidth: '100%',
  },
  heroSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  heroCharacterArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCharImage: {
    width: 160,
    height: 180,
  },

  // ── 인사 섹션 ──
  greetingSection: {
    paddingHorizontal: 24,
    marginTop: -20,
    marginBottom: 24,
    backgroundColor: C.white,
    borderRadius: 24,
    marginHorizontal: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  greetingTitle: {
    fontSize: 26,
    fontFamily: 'Jua',
    color: C.textDark,
    marginBottom: 4,
  },
  greetingSubtitle: {
    fontSize: 15,
    fontFamily: 'Jua',
    color: C.textMid,
    marginBottom: 16,
  },
  progressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#EDF0F7',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: C.coral,
    borderRadius: 4,
  },
  progressPillText: {
    fontSize: 13,
    fontFamily: 'Jua',
    color: C.textMid,
  },
  streakPill: {
    backgroundColor: 'rgba(232,116,79,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  streakPillText: {
    fontSize: 13,
    fontFamily: 'Jua',
    color: C.coral,
  },

  // ── 섹션 헤더 ──
  sectionHeader: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Jua',
    color: C.white,
    fontWeight: '600',
  },

  // ── 미션 그리드 (2열, Headspace 원형 카테고리) ──
  missionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  missionGridItem: {
    width: '48%',
    marginBottom: 16,
  },

  // ── 미션 원형 카드 ──
  missionCircleWrapper: {
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  missionCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.dark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  missionCircleCompleted: {
    backgroundColor: C.sage,
  },
  missionCircleIcon: {
    fontSize: 32,
  },
  missionCheckBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.sage,
    borderWidth: 2,
    borderColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionCircleName: {
    fontSize: 14,
    fontFamily: 'Jua',
    color: C.textDark,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 4,
  },
  missionStreakText: {
    fontSize: 11,
    fontFamily: 'Jua',
    color: C.coral,
    marginBottom: 6,
  },
  quickCheckBtn: {
    minHeight: 36,
    minWidth: 80,
    backgroundColor: C.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.coral,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 4,
  },
  quickCheckText: {
    color: C.coral,
    fontFamily: 'Jua',
    fontSize: 13,
    fontWeight: '600',
  },

  // ── 추가 버튼 ──
  addMissionCircle: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  addMissionIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#DDD',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  // ── CTA pill ──
  ctaContainer: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  ctaPill: {
    width: '100%',
    backgroundColor: C.white,
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaPillText: {
    color: C.coral,
    fontFamily: 'Jua',
    fontSize: 17,
    fontWeight: '700',
  },

  // ── 완료 애니메이션 ──
  completionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  completionEmoji: {
    fontSize: 72,
    marginBottom: 12,
  },
  completionText: {
    fontSize: 28,
    fontFamily: 'Jua',
    color: C.sage,
    fontWeight: '700',
  },

  // ── 온보딩 ──
  onboardingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  onboardingContent: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  onboardingCharArea: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  onboardingEmoji: {
    fontSize: 72,
  },
  onboardingTitle: {
    fontSize: 28,
    fontFamily: 'Jua',
    color: C.white,
    marginBottom: 12,
    textAlign: 'center',
  },
  onboardingSubtitle: {
    fontSize: 16,
    fontFamily: 'Jua',
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  onboardingInput: {
    width: '100%',
    height: 52,
    backgroundColor: C.white,
    borderRadius: 24,
    paddingHorizontal: 20,
    fontSize: 18,
    fontFamily: 'Jua',
    color: C.textDark,
    marginBottom: 24,
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  pillButton: {
    width: '100%',
    backgroundColor: C.white,
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  pillButtonText: {
    color: C.coral,
    fontFamily: 'Jua',
    fontSize: 20,
    fontWeight: '700',
  },
});
