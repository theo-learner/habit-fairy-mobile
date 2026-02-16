// ============================================
// 미션 실행 페이지 — 타이머 + 요정 + 별 보상
// ============================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';
import FairyCharacter from '@/components/FairyCharacter';
import CircleTimer from '@/components/CircleTimer';
import StarReward from '@/components/StarReward';
import { getMissionById } from '@/lib/missions';
import { useAppStore } from '@/lib/store';
import { playCompleteHaptic, playButtonHaptic, playFanfareHaptic } from '@/lib/sounds';
import type { FairyEmotion } from '@/types';

type Phase = 'ready' | 'running' | 'done' | 'reward';

export default function MissionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const allMissions = useAppStore((s) => s.missions || []);
  const mission = getMissionById(id || '', allMissions);

  const completeMission = useAppStore((s) => s.completeMission);
  const childName = useAppStore((s) => s.childName);
  const isMissionCompletedToday = useAppStore((s) => s.isMissionCompletedToday);

  const [phase, setPhase] = useState<Phase>('ready');
  const [fairyEmotion, setFairyEmotion] = useState<FairyEmotion>('excited');
  const [fairyMessage, setFairyMessage] = useState('');

  // 미션 없으면 에러
  if (!mission) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>미션을 찾을 수 없어요 😢</Text>
        <Pressable onPress={() => router.back()} style={styles.errorButton}>
          <Text style={styles.errorButtonText}>돌아가기</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const isAlreadyDone = isMissionCompletedToday(mission.id);
  const name = childName || '친구';

  /** 뒤로가기 (타이머 진행 중이면 확인) */
  const handleBack = () => {
    if (phase === 'running') {
      Alert.alert(
        '잠깐 쉬어갈까?',
        '괜찮아! 나중에 다시 도전하면 돼 😊',
        [
          { text: '계속할래!', style: 'cancel' },
          { text: '내일 다시 해보자!', onPress: () => router.back() },
        ],
      );
    } else {
      router.back();
    }
  };

  /** 미션 시작 */
  const handleStart = () => {
    playButtonHaptic();
    setPhase('running');
    setFairyEmotion('cheering');
    setFairyMessage(mission.fairyMessageStart);
  };

  /** 미션 완료 */
  const handleComplete = useCallback(async () => {
    playCompleteHaptic();
    setPhase('done');
    setFairyEmotion('celebrating');
    setFairyMessage(mission.fairyMessageComplete);

    // 데이터 저장
    await completeMission(mission.id, mission.starReward);

    // 보상 애니메이션
    setTimeout(() => {
      playFanfareHaptic();
      setPhase('reward');
    }, 1200);
  }, [mission, completeMission]);

  /** 보상 완료 후 */
  const handleRewardComplete = useCallback(() => {
    router.back();
  }, [router]);

  /** 요정 메시지 결정 — P6: 긍정적 톤 */
  const currentFairyMessage = (() => {
    if (isAlreadyDone) return `${name}아, 이미 해냈잖아! 요정이 자랑스러워! 🌟`;
    if (fairyMessage) return fairyMessage;
    switch (phase) {
      case 'ready':
        return `${name}아, ${mission.name} 미션을 시작해볼까? 💪`;
      case 'running':
        return mission.fairyMessageStart;
      case 'done':
        return mission.fairyMessageComplete;
      default:
        return '';
    }
  })();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* 상단 바 */}
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={styles.backButton}
          hitSlop={16}
        >
          <Text style={styles.backText}>← 돌아가기</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {mission.icon} {mission.name}
        </Text>
        <View style={{ width: 80 }} />
      </View>

      {/* 메인 콘텐츠 */}
      <View style={styles.main}>
        {/* 요정 캐릭터 */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.fairySection}>
          <FairyCharacter
            emotion={fairyEmotion}
            message={currentFairyMessage}
            size="md"
            showMessage
          />
        </Animated.View>

        {/* 미션 설명 (준비 상태) */}
        {phase === 'ready' && !isAlreadyDone && (
          <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.descSection}>
            <Text style={styles.descText}>{mission.description}</Text>
            <Text style={styles.rewardText}>
              완료하면 ⭐ ×{mission.starReward} 획득!
            </Text>
          </Animated.View>
        )}

        {/* 타이머 또는 버튼 */}
        {phase === 'ready' && !isAlreadyDone && (
          <Animated.View entering={FadeInUp.delay(400).duration(300)}>
            <Pressable
              onPress={handleStart}
              style={({ pressed }) => [
                styles.ctaButton,
                pressed && styles.ctaButtonPressed,
              ]}
            >
              <Text style={styles.ctaButtonText}>
                {mission.timerSeconds > 0 ? '⏱️ 타이머 시작!' : '✅ 미션 시작!'}
              </Text>
            </Pressable>
          </Animated.View>
        )}

        {/* 이미 완료된 미션 */}
        {isAlreadyDone && phase === 'ready' && (
          <Animated.View entering={FadeIn} style={styles.alreadyDone}>
            <Text style={styles.alreadyDoneEmoji}>✅</Text>
            <Text style={styles.alreadyDoneText}>오늘 이미 완료한 미션이에요!</Text>
          </Animated.View>
        )}

        {/* 타이머 실행 중 (타이머 미션) */}
        {phase === 'running' && mission.timerSeconds > 0 && (
          <Animated.View entering={FadeIn.duration(400)}>
            <CircleTimer
              totalSeconds={mission.timerSeconds}
              onComplete={handleComplete}
              autoStart
            />
          </Animated.View>
        )}

        {/* 타이머 없는 미션 실행 */}
        {phase === 'running' && mission.timerSeconds === 0 && (
          <Animated.View entering={FadeInUp.duration(400)} style={styles.noTimerSection}>
            <Text style={styles.noTimerText}>
              미션을 완료하면 아래 버튼을 눌러주세요!
            </Text>
            <Pressable
              onPress={handleComplete}
              style={({ pressed }) => [
                styles.completeButton,
                pressed && styles.completeButtonPressed,
              ]}
            >
              <Text style={styles.completeButtonText}>✅ 미션 완료!</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* 완료 중간 화면 */}
        {phase === 'done' && (
          <Animated.View entering={ZoomIn.springify().damping(12)} style={styles.doneSection}>
            <Text style={styles.doneEmoji}>🎊</Text>
            <Text style={styles.doneText}>대단해!</Text>
          </Animated.View>
        )}
      </View>

      {/* 별 보상 오버레이 */}
      <StarReward
        stars={mission.starReward}
        isVisible={phase === 'reward'}
        onComplete={handleRewardComplete}
        message={mission.fairyMessageComplete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFE',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 20,
    color: '#6B7280',
    marginBottom: 16,
  },
  errorButton: {
    backgroundColor: '#FBBF24',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 8,
    minWidth: 80,
  },
  backText: {
    fontSize: 15,
    color: '#6B7280',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  fairySection: {
    marginBottom: 8,
  },
  descSection: {
    alignItems: 'center',
  },
  descText: {
    fontSize: 17,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 8,
  },
  rewardText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600',
  },
  ctaButton: {
    paddingHorizontal: 48,
    paddingVertical: 20,
    backgroundColor: '#B39DDB',
    borderRadius: 30,
    shadowColor: '#B39DDB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaButtonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  ctaButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  alreadyDone: {
    alignItems: 'center',
    gap: 8,
  },
  alreadyDoneEmoji: {
    fontSize: 48,
  },
  alreadyDoneText: {
    fontSize: 16,
    color: '#34D399',
    fontWeight: '600',
  },
  noTimerSection: {
    alignItems: 'center',
    gap: 20,
  },
  noTimerText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  completeButton: {
    paddingHorizontal: 48,
    paddingVertical: 20,
    backgroundColor: '#80CBC4',
    borderRadius: 30,
    shadowColor: '#80CBC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  completeButtonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  completeButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  doneSection: {
    alignItems: 'center',
  },
  doneEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  doneText: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'Jua',
    color: '#B39DDB',
  },
});
