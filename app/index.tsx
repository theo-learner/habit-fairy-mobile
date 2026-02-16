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
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

import ErrorBoundary from '@/components/ErrorBoundary';
import { useAppStore } from '@/lib/store';
import { playButtonHaptic, playSuccessSound, playCompleteHaptic } from '@/lib/sounds';
import { CHARACTERS } from '@/lib/characters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── 온보딩 컴포넌트 (1단계로 단순화) ───
function OnboardingScreen({ onComplete }: { onComplete: (name: string) => void }) {
  const [name, setName] = useState('');

  const handleStart = () => {
    const trimmed = name.trim() || '별이';
    playButtonHaptic();
    onComplete(trimmed);
  };

  return (
    <View style={styles.onboardingContainer}>
      <Animated.View entering={FadeInDown.duration(600)} style={styles.onboardingContent}>
        <Text style={styles.onboardingEmoji}>🧚‍♀️</Text>
        <Text style={styles.onboardingTitle}>안녕! 나는 습관요정이야!</Text>
        <Text style={styles.onboardingSubtitle}>
          매일 함께 좋은 습관을 만들어 볼까?{'\n'}이름을 알려줘!
        </Text>
        <TextInput
          style={styles.onboardingInput}
          placeholder="이름을 입력해줘"
          placeholderTextColor="#AAAAAA"
          value={name}
          onChangeText={setName}
          maxLength={10}
          autoFocus
        />
        <Pressable
          onPress={handleStart}
          style={({ pressed }) => [
            styles.onboardingButton,
            pressed && { transform: [{ scale: 0.95 }], opacity: 0.9 },
          ]}
        >
          <Text style={styles.onboardingButtonText}>모험 시작하기! 🚀</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

/** 긍정적 진행률 메시지 (죄책감↓, 동기↑) */
function getProgressMessage(completed: number, total: number): string {
  if (total === 0) return '미션을 추가해볼까? ✨';
  const ratio = completed / total;
  if (ratio === 0) return '첫 모험을 시작해볼까? ✨';
  if (ratio < 0.5) return `좋은 시작이야! ${total - completed}개 남았어!`;
  if (ratio < 1) return `거의 다 했어! 조금만 더! 💪`;
  return '오늘의 영웅! 🌟';
}

// ─── 원형 진행률 컴포넌트 ───
function CircularProgress({ 
  progress, 
  size = 280, 
  strokeWidth = 24,
  children 
}: { 
  progress: number; 
  size?: number; 
  strokeWidth?: number;
  children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#4FACFE" stopOpacity="1" />
            <Stop offset="1" stopColor="#00F2FE" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E0E7FF"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#grad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ 
        width: size - strokeWidth * 2, 
        height: size - strokeWidth * 2, 
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: size / 2,
        backgroundColor: '#FFFFFF', 
        overflow: 'hidden',
        borderWidth: 1, 
        borderColor: '#F0F0F0'
      }}>
        {children}
      </View>
      
      <View style={styles.progressBadge} accessibilityRole="text" accessibilityLabel={`오늘 미션 진행률 ${Math.round(progress)}퍼센트`}>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>
    </View>
  );
}

// ─── 체크 완료 애니메이션 오버레이 ───
function CompletionAnimation({ 
  visible, 
  onDone 
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

// ─── 미션 카드 컴포넌트 (P0: 정보구조 재정렬 + 44px 터치 + 긍정 톤) ───
function GridMissionCard({ 
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
  const bgColors = {
    morning: '#FFDEE9', 
    daytime: '#B5FFFC', 
    evening: '#D9AFD9', 
    study: '#C2E9FB',   
    health: '#E0C3FC',  
  };
  const bgColor = isCompleted ? '#E8F5E9' : (bgColors[mission.category as keyof typeof bgColors] || '#FFF1EB');

  return (
    <Pressable 
      onPress={onPress} 
      style={[styles.missionCard, { backgroundColor: bgColor }]}
      accessibilityRole="button"
      accessibilityLabel={`${mission.name} 미션${isCompleted ? ', 완료됨' : ''}`}
      accessibilityHint={isCompleted ? '완료된 미션입니다' : '탭하여 미션을 시작하세요'}
    >
      {/* P4: 오늘 할 일 이름 (상단) */}
      <Text style={styles.missionTitle} numberOfLines={1}>{mission.name}</Text>
      
      {/* 연속일 표시 */}
      {streakDays > 0 && (
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>🔥 {streakDays}일 연속</Text>
        </View>
      )}

      <View style={styles.missionIconContainer}>
        <Text style={{ fontSize: 40 }}>{mission.icon}</Text>
      </View>

      {/* P5: 체크 버튼 최소 44px */}
      {isCompleted ? (
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>완료! ⭐</Text>
        </View>
      ) : (
        <Pressable 
          onPress={(e) => {
            e.stopPropagation?.();
            onQuickCheck();
          }}
          hitSlop={8}
          style={({ pressed }) => [
            styles.checkButton,
            pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
          ]}
        >
          <Text style={styles.checkButtonText}>체크 ✓</Text>
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

  // P1: 온보딩 — childName이 없으면 표시
  useEffect(() => {
    if (isLoaded && !childName) {
      setShowOnboarding(true);
    }
  }, [isLoaded, childName]);

  const handleOnboardingComplete = async (name: string) => {
    await setChildName(name);
    setShowOnboarding(false);
  };

  const character = CHARACTERS.find(c => c.id === selectedCharacterId) || CHARACTERS[0];

  const safeMissions = Array.isArray(missions) ? missions : [];
  const todayCompleted = getTodayCompleted();
  const completedCount = Array.isArray(todayCompleted) ? todayCompleted.length : 0;
  const totalCount = safeMissions.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const streakDays = getStreakDays();

  // P4: 정보구조 재정렬 — 미완료 먼저, 완료 뒤로
  const sortedMissions = useMemo(() => {
    return [...safeMissions].sort((a, b) => {
      const aCompleted = isMissionCompletedToday(a.id) ? 1 : 0;
      const bCompleted = isMissionCompletedToday(b.id) ? 1 : 0;
      return aCompleted - bCompleted; // 미완료(0) 먼저, 완료(1) 뒤로
    });
  }, [safeMissions, todayCompleted]);

  const incompleteMissions = sortedMissions.filter(m => !isMissionCompletedToday(m.id));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleMissionPress = (id: string) => {
    playButtonHaptic();
    router.push(`/mission/${id}`);
  };

  // P3: 빠른 체크 + 완료 애니메이션
  const handleQuickCheck = async (mission: any) => {
    playCompleteHaptic();
    await completeMission(mission.id, mission.starReward);
    setShowCompletionAnim(true);
  };

  // P2: "지금 체크하기" CTA — 첫 번째 미완료 미션으로 이동
  const handleCtaPress = () => {
    playButtonHaptic();
    if (incompleteMissions.length > 0) {
      router.push(`/mission/${incompleteMissions[0].id}`);
    }
  };

  // P6: 긍정 톤 메시지 (감정 UX 개선 — 죄책감↓, 재시작 유도)
  const greetingMessage = useMemo(() => {
    const displayName = childName || '별이';
    return `안녕, ${displayName}!`;
  }, [childName]);

  const progressMessage = useMemo(() => {
    return getProgressMessage(completedCount, totalCount);
  }, [completedCount, totalCount]);

  const subtitleMessage = useMemo(() => {
    if (completedCount === totalCount && totalCount > 0) {
      return '대단해! 내일도 함께하자! 🌟';
    }
    if (completedCount > 0) {
      return `${totalCount - completedCount}개만 더 하면 돼! 괜찮아, 천천히!`;
    }
    return '오늘의 모험을 시작해볼까?';
  }, [completedCount, totalCount]);

  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          {streakDays > 0 && (
            <Text style={styles.streakHeader}>🔥 {streakDays}일 연속 달성!</Text>
          )}
        </View>
        <Pressable onPress={() => router.push('/manage')} style={styles.profileButton}>
          <Image 
            source={require('../assets/icon.png')} 
            style={{ width: 32, height: 32, borderRadius: 16 }} 
          />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4FACFE" />
        }
      >
        <View style={styles.mainSection}>
          <CircularProgress progress={progress}>
            <Animated.Image
              entering={FadeIn.duration(800)}
              source={character.asset}
              style={styles.characterImage}
              resizeMode="contain"
            />
          </CircularProgress>
        </View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>{greetingMessage}</Text>
          <Text style={styles.greetingSubtitle}>{progressMessage}</Text>
        </Animated.View>

        {/* P4: 정보구조 재정렬된 그리드 */}
        <View style={styles.gridContainer}>
          {sortedMissions.map((mission, index) => (
            <Animated.View 
              key={mission.id} 
              entering={FadeInDown.delay(300 + index * 100)}
              style={styles.gridItemWrapper}
            >
              <GridMissionCard
                mission={mission}
                isCompleted={isMissionCompletedToday(mission.id)}
                streakDays={streakDays}
                onPress={() => handleMissionPress(mission.id)}
                onQuickCheck={() => handleQuickCheck(mission)}
              />
            </Animated.View>
          ))}
          <Pressable 
            onPress={() => router.push('/manage')} 
            style={[styles.missionCard, styles.addCard]}
          >
            <Text style={{ fontSize: 32, color: '#A0A0A0' }}>+</Text>
          </Pressable>
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* P2: "지금 체크하기" CTA 고정 버튼 */}
      {incompleteMissions.length > 0 && (
        <Animated.View entering={FadeInUp.delay(500)} style={styles.ctaContainer}>
          <Pressable
            onPress={handleCtaPress}
            style={({ pressed }) => [
              styles.ctaButton,
              pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 },
            ]}
          >
            <Text style={styles.ctaButtonText}>
              지금 체크하기 ✨ ({incompleteMissions.length}개 남음)
            </Text>
          </Pressable>
        </Animated.View>
      )}

      {/* P3: 완료 애니메이션 */}
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
    backgroundColor: '#FFF5F7', 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  streakHeader: {
    fontSize: 14,
    fontFamily: 'Jua',
    color: '#FF6B35',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mainSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  characterImage: {
    width: 180,
    height: 220,
    marginBottom: 10,
  },
  progressBadge: {
    position: 'absolute',
    bottom: -15,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressText: {
    fontSize: 16,
    fontFamily: 'Jua',
    color: '#333',
  },
  greetingSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  greetingTitle: {
    fontSize: 24,
    fontFamily: 'Jua',
    color: '#111',
    marginBottom: 4,
  },
  greetingSubtitle: {
    fontSize: 16,
    fontFamily: 'Jua',
    color: '#666',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  gridItemWrapper: {
    width: '48%', 
    marginBottom: 16,
  },
  missionCard: {
    width: '100%',
    aspectRatio: 1, 
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  addCard: {
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  missionTitle: {
    fontSize: 18,
    fontFamily: 'Jua',
    color: '#333',
  },
  missionIconContainer: {
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  streakBadge: {
    backgroundColor: 'rgba(255,107,53,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  streakText: {
    fontSize: 11,
    fontFamily: 'Jua',
    color: '#FF6B35',
  },
  // P5: 체크 버튼 최소 44px
  checkButton: {
    minHeight: 44,
    minWidth: 44,
    backgroundColor: '#4CD964',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  checkButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Jua',
    fontSize: 15,
    fontWeight: '700',
  },
  completedBadge: {
    minHeight: 44,
    backgroundColor: 'rgba(76,217,100,0.15)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  completedText: {
    color: '#4CD964',
    fontFamily: 'Jua',
    fontSize: 14,
  },
  // P2: CTA 고정 버튼
  ctaContainer: {
    position: 'absolute',
    bottom: 90, // TabBar 위
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  ctaButton: {
    width: '100%',
    backgroundColor: '#4FACFE',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4FACFE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Jua',
    fontSize: 18,
    fontWeight: '700',
  },
  // P3: 완료 애니메이션
  completionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.85)',
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
    color: '#4CD964',
    fontWeight: '700',
  },
  // P1: 온보딩
  onboardingContainer: {
    flex: 1,
    backgroundColor: '#FFF5F7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  onboardingContent: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  onboardingEmoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  onboardingTitle: {
    fontSize: 28,
    fontFamily: 'Jua',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  onboardingSubtitle: {
    fontSize: 16,
    fontFamily: 'Jua',
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  onboardingInput: {
    width: '100%',
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    fontSize: 18,
    fontFamily: 'Jua',
    color: '#333',
    borderWidth: 2,
    borderColor: '#E0E7FF',
    marginBottom: 24,
    textAlign: 'center',
  },
  onboardingButton: {
    width: '100%',
    backgroundColor: '#4FACFE',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: '#4FACFE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  onboardingButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Jua',
    fontSize: 20,
    fontWeight: '700',
  },
});
