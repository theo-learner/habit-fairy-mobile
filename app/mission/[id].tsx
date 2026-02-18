// ============================================
// 미션 실행 페이지 — Headspace Kids 스타일
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
import { LinearGradient } from 'expo-linear-gradient';
import strings from '@/lib/i18n';
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

const C = {
  lavender: '#8E97C8',
  lavenderLight: '#B8C0E8',
  sage: '#7DB89E',
  dark: '#4A5568',
  coral: '#E8744F',
  white: '#FFFFFF',
  textDark: '#2D3436',
  textMid: '#636E72',
};

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

  if (!mission) {
    return (
      <LinearGradient colors={['#8E97C8', '#B8C0E8']} style={styles.errorContainer}>
        <Text style={styles.errorText}>{strings.error.missionNotFound}</Text>
        <Pressable onPress={() => router.back()} style={styles.pillBtn}>
          <Text style={styles.pillBtnText}>{strings.mission.goBack}</Text>
        </Pressable>
      </LinearGradient>
    );
  }

  const isAlreadyDone = isMissionCompletedToday(mission.id);
  const name = childName || strings.tabs.character;

  const handleBack = () => {
    if (phase === 'running') {
      Alert.alert(strings.mission.quitTitle, strings.mission.quitMessage, [
        { text: strings.mission.quitContinue, style: 'cancel' },
        { text: strings.mission.quitStop, onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  };

  const handleStart = () => {
    playButtonHaptic();
    setPhase('running');
    setFairyEmotion('cheering');
    setFairyMessage(mission.fairyMessageStart);
  };

  const handleComplete = useCallback(async () => {
    playCompleteHaptic();
    setPhase('done');
    setFairyEmotion('celebrating');
    setFairyMessage(mission.fairyMessageComplete);
    await completeMission(mission.id, mission.starReward);
    setTimeout(() => {
      playFanfareHaptic();
      setPhase('reward');
    }, 1200);
  }, [mission, completeMission]);

  const handleRewardComplete = useCallback(() => {
    router.back();
  }, [router]);

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
    <LinearGradient colors={['#8E97C8', '#B8C0E8']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* 상단 바 */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton} hitSlop={16}>
            <Text style={styles.backText}>← 돌아가기</Text>
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {mission.icon} {mission.name}
          </Text>
          <View style={{ width: 80 }} />
        </View>

        {/* 메인 */}
        <View style={styles.main}>
          <Animated.View entering={FadeIn.duration(600)} style={styles.fairySection}>
            <FairyCharacter emotion={fairyEmotion} message={currentFairyMessage} size="md" showMessage />
          </Animated.View>

          {phase === 'ready' && !isAlreadyDone && (
            <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.descSection}>
              <Text style={styles.descText}>{mission.description}</Text>
              <View style={styles.rewardPill}>
                <Text style={styles.rewardText}>{strings.mission.starReward(mission.starReward)}</Text>
              </View>
            </Animated.View>
          )}

          {phase === 'ready' && !isAlreadyDone && (
            <Animated.View entering={FadeInUp.delay(400).duration(300)}>
              <Pressable
                onPress={handleStart}
                style={({ pressed }) => [styles.pillBtn, pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 }]}
              >
                <Text style={styles.pillBtnText}>
                  {mission.timerSeconds > 0 ? '⏱️ 타이머 시작!' : '✅ 미션 시작!'}
                </Text>
              </Pressable>
            </Animated.View>
          )}

          {isAlreadyDone && phase === 'ready' && (
            <Animated.View entering={FadeIn} style={styles.alreadyDone}>
              <Text style={{ fontSize: 48 }}>✅</Text>
              <Text style={styles.alreadyDoneText}>{strings.mission.alreadyDone}</Text>
            </Animated.View>
          )}

          {phase === 'running' && mission.timerSeconds > 0 && (
            <Animated.View entering={FadeIn.duration(400)}>
              <CircleTimer totalSeconds={mission.timerSeconds} onComplete={handleComplete} autoStart />
            </Animated.View>
          )}

          {phase === 'running' && mission.timerSeconds === 0 && (
            <Animated.View entering={FadeInUp.duration(400)} style={{ alignItems: 'center', gap: 20 }}>
              <Text style={styles.noTimerText}>{strings.mission.completePrompt}</Text>
              <Pressable
                onPress={handleComplete}
                style={({ pressed }) => [styles.completePill, pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 }]}
              >
                <Text style={styles.completePillText}>✅ 미션 완료!</Text>
              </Pressable>
            </Animated.View>
          )}

          {phase === 'done' && (
            <Animated.View entering={ZoomIn.springify().damping(12)} style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 64 }}>🎊</Text>
              <Text style={styles.doneText}>{strings.mission.great}</Text>
            </Animated.View>
          )}
        </View>

        <StarReward
          stars={mission.starReward}
          isVisible={phase === 'reward'}
          onComplete={handleRewardComplete}
          message={mission.fairyMessageComplete}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 20,
    color: '#1A1A2E',
    fontFamily: 'Jua',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 8,
    minWidth: 80,
  },
  backText: {
    fontSize: 15,
    color: '#1A1A2E',
    fontFamily: 'Jua',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A2E',
    fontFamily: 'Jua',
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
    color: '#1A1A2E',
    fontFamily: 'Jua',
    textAlign: 'center',
    marginBottom: 12,
  },
  rewardPill: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  rewardText: {
    fontSize: 14,
    color: '#1A1A2E',
    fontFamily: 'Jua',
    fontWeight: '600',
  },
  pillBtn: {
    paddingHorizontal: 48,
    paddingVertical: 18,
    backgroundColor: C.white,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  pillBtnText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
    fontFamily: 'Jua',
  },
  alreadyDone: {
    alignItems: 'center',
    gap: 8,
  },
  alreadyDoneText: {
    fontSize: 16,
    color: '#1A1A2E',
    fontFamily: 'Jua',
    fontWeight: '600',
  },
  noTimerText: {
    fontSize: 15,
    color: '#1A1A2E',
    fontFamily: 'Jua',
    textAlign: 'center',
  },
  completePill: {
    paddingHorizontal: 48,
    paddingVertical: 18,
    backgroundColor: C.sage,
    borderRadius: 9999,
    shadowColor: C.sage,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  completePillText: {
    fontSize: 20,
    fontWeight: '700',
    color: C.white,
    fontFamily: 'Jua',
  },
  doneText: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'Jua',
    color: '#1A1A2E',
    marginTop: 8,
  },
});
