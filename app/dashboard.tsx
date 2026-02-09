// ============================================
// 부모 대시보드 — 달성률 차트 + 주간 통계
// 아이 이름 설정 + 미션별 현황 + 커스텀 미션 추가
// ============================================

import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
} from 'react-native-reanimated';
import { useAppStore } from '@/lib/store';
import { MISSION_ICONS as ICON_OPTIONS } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/lib/missions';
import { playButtonHaptic } from '@/lib/sounds';
import type { MissionCategory } from '@/types';

import {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

/** 불꽃 아이콘 애니메이션 */
function FlameIcon() {
  const scale = useSharedValue(1);
  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 600 }),
        withTiming(1.0, { duration: 600 }),
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.Text style={[styles.summaryEmoji, animatedStyle]}>🔥</Animated.Text>;
}

/** 주간 막대 그래프 */
function WeeklyBar({ day, rate, maxHeight = 100 }: { day: string; rate: number; maxHeight?: number }) {
  const barHeight = Math.max(4, (rate / 100) * maxHeight);
  const barColor = rate >= 80 ? '#34D399' : rate >= 50 ? '#FBBF24' : rate > 0 ? '#FDE68A' : '#E5E7EB';
  return (
    <View style={styles.barColumn}>
      <Text style={styles.barRate}>{rate > 0 ? `${rate}%` : ''}</Text>
      <View style={[styles.barTrack, { height: maxHeight }]}>
        <View style={[styles.bar, { height: barHeight, backgroundColor: barColor }]} />
      </View>
      <Text style={styles.barDay}>{day}</Text>
    </View>
  );
}

/** 요일 라벨 */
const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return DAY_LABELS[d.getDay()];
}

export default function DashboardScreen() {
  const missions = useAppStore((s) => s.missions);
  const completedMap = useAppStore((s) => s.completedMap);
  const totalStars = useAppStore((s) => s.totalStars);
  const childName = useAppStore((s) => s.childName);
  const setChildName = useAppStore((s) => s.setChildName);
  const getLastNDays = useAppStore((s) => s.getLastNDays);
  const getStreakDays = useAppStore((s) => s.getStreakDays);
  const addCustomMission = useAppStore((s) => s.addCustomMission);

  const [showNameEdit, setShowNameEdit] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [showAddMission, setShowAddMission] = useState(false);

  // 커스텀 미션 추가 폼
  const [newMissionName, setNewMissionName] = useState('');
  const [newMissionIcon, setNewMissionIcon] = useState('⭐');
  const [newMissionCategory, setNewMissionCategory] = useState<MissionCategory>('morning');
  const [newMissionTimer, setNewMissionTimer] = useState('0');
  const [newMissionStars, setNewMissionStars] = useState(1);

  const last7Days = useMemo(() => getLastNDays(7), []);
  const totalMissions = missions.length;
  const streakDays = getStreakDays();

  // 오늘 통계
  const today = new Date().toISOString().split('T')[0];
  const todayCompleted = (completedMap[today] || []).length;
  const todayRate = totalMissions > 0 ? Math.round((todayCompleted / totalMissions) * 100) : 0;

  // 주간 차트 데이터
  const chartData = useMemo(() => {
    return last7Days.map((date) => {
      const completed = (completedMap[date] || []).length;
      return {
        date,
        day: getDayLabel(date),
        rate: totalMissions > 0 ? Math.round((completed / totalMissions) * 100) : 0,
      };
    });
  }, [last7Days, completedMap, totalMissions]);

  const weeklyAvgRate = useMemo(() => {
    const total = chartData.reduce((sum, d) => sum + d.rate, 0);
    return Math.round(total / chartData.length);
  }, [chartData]);

  // 아이 이름 저장
  const saveChildName = useCallback(() => {
    const name = nameInput.trim();
    if (name) {
      setChildName(name);
    }
    setShowNameEdit(false);
  }, [nameInput, setChildName]);

  // 커스텀 미션 저장
  const handleAddMission = useCallback(async () => {
    if (!newMissionName.trim()) {
      Alert.alert('미션 이름을 입력해주세요');
      return;
    }
    await addCustomMission({
      name: newMissionName.trim(),
      description: `${newMissionName.trim()} 미션이에요!`,
      icon: newMissionIcon,
      category: newMissionCategory,
      timerSeconds: parseInt(newMissionTimer) * 60 || 0,
      starReward: newMissionStars,
      fairyMessageStart: `${newMissionName.trim()} 시작해볼까? 화이팅! 💪`,
      fairyMessageComplete: `${newMissionName.trim()} 완료! 정말 잘했어! ⭐`,
      isActive: true,
    });
    setShowAddMission(false);
    setNewMissionName('');
    setNewMissionTimer('0');
    setNewMissionStars(1);
    Alert.alert('✨ 미션 추가 완료!', `${newMissionName.trim()} 미션이 추가되었어요`);
  }, [newMissionName, newMissionIcon, newMissionCategory, newMissionTimer, newMissionStars, addCustomMission]);

  // 달성률 원형 차트용
  const circleProgress = todayRate;
  const circumference = 2 * Math.PI * 15.9;
  const dashArray = `${circleProgress} ${100 - circleProgress}`;
  const rateColor = todayRate >= 80 ? '#34D399' : todayRate >= 50 ? '#FBBF24' : '#F87171';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <Text style={styles.headerTitle}>📊 부모 대시보드</Text>
        </Animated.View>

        {/* 아이 이름 설정 */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)} style={styles.card}>
          <View style={styles.nameRow}>
            <View>
              <Text style={styles.labelSmall}>아이 이름</Text>
              <Text style={styles.nameText}>
                {childName || '이름을 설정해주세요'} {childName ? '🧒' : ''}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                playButtonHaptic();
                setNameInput(childName);
                setShowNameEdit(!showNameEdit);
              }}
              style={styles.editButton}
            >
              <Text style={styles.editButtonText}>{childName ? '수정' : '설정'}</Text>
            </Pressable>
          </View>
          {showNameEdit && (
            <View style={styles.nameEditRow}>
              <TextInput
                style={styles.nameInput}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="아이 이름"
                maxLength={10}
                onSubmitEditing={saveChildName}
              />
              <Pressable onPress={saveChildName} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>저장</Text>
              </Pressable>
            </View>
          )}
        </Animated.View>

        {/* 오늘 요약 */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryEmoji}>✅</Text>
            <Text style={styles.summaryValue}>{todayCompleted}/{totalMissions}</Text>
            <Text style={styles.summaryLabel}>오늘 달성</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryEmoji}>⭐</Text>
            <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>{totalStars}</Text>
            <Text style={styles.summaryLabel}>모은 별</Text>
          </View>
          <View style={styles.summaryCard}>
            <FlameIcon />
            <Text style={[styles.summaryValue, { color: '#EF4444' }]}>{streakDays}일</Text>
            <Text style={styles.summaryLabel}>연속 달성</Text>
          </View>
        </Animated.View>

        {/* 오늘 달성률 */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.card}>
          <View style={styles.rateRow}>
            <View>
              <Text style={styles.cardTitle}>오늘 달성률</Text>
              <Text style={styles.rateHint}>
                {todayCompleted === 0
                  ? '아직 시작하지 않았어요'
                  : todayCompleted >= totalMissions
                    ? '모든 미션 완료! 🎉'
                    : `${totalMissions - todayCompleted}개 남았어요`}
              </Text>
            </View>
            <View style={styles.rateCircleWrap}>
              <Svg width={72} height={72} viewBox="0 0 36 36">
                <Circle cx={18} cy={18} r={15.9} fill="none" stroke="#E5E7EB" strokeWidth={3} />
                <Circle
                  cx={18}
                  cy={18}
                  r={15.9}
                  fill="none"
                  stroke={rateColor}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeDasharray={dashArray}
                  transform="rotate(-90 18 18)"
                />
              </Svg>
              <Text style={styles.ratePercent}>{todayRate}%</Text>
            </View>
          </View>
        </Animated.View>

        {/* 주간 차트 */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.card}>
          <View style={styles.chartHeader}>
            <Text style={styles.cardTitle}>📈 주간 달성률</Text>
            <Text style={styles.chartAvg}>평균 {weeklyAvgRate}%</Text>
          </View>
          <View style={styles.chartArea}>
            {chartData.map((d, i) => (
              <Animated.View key={d.date} entering={FadeInRight.delay(i * 50).duration(300)}>
                <WeeklyBar day={d.day} rate={d.rate} />
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* 미션별 현황 */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.card}>
          <Text style={styles.cardTitle}>📋 미션별 현황 (7일)</Text>
          <View style={styles.missionList}>
            {missions.map((mission) => {
              const completedDays = last7Days.filter(
                (date) => (completedMap[date] || []).includes(mission.id),
              ).length;
              const missionRate = Math.round((completedDays / 7) * 100);
              const barColor = missionRate >= 70 ? '#34D399' : missionRate >= 40 ? '#FBBF24' : '#D1D5DB';

              return (
                <View key={mission.id} style={styles.missionRow}>
                  <Text style={styles.missionIcon}>{mission.icon}</Text>
                  <View style={styles.missionInfo}>
                    <View style={styles.missionNameRow}>
                      <Text style={styles.missionName} numberOfLines={1}>
                        {mission.name}
                        {!mission.isPreset && <Text style={styles.customBadge}> ✨</Text>}
                      </Text>
                      <Text style={styles.missionDays}>{completedDays}/7일</Text>
                    </View>
                    <View style={styles.missionBarTrack}>
                      <View
                        style={[
                          styles.missionBar,
                          { width: `${missionRate}%`, backgroundColor: barColor },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* 커스텀 미션 추가 버튼 */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Pressable
            onPress={() => {
              playButtonHaptic();
              setShowAddMission(true);
            }}
            style={({ pressed }) => [
              styles.addMissionButton,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={styles.addMissionButtonText}>➕ 커스텀 미션 추가</Text>
          </Pressable>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* 커스텀 미션 추가 모달 */}
      <Modal visible={showAddMission} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>➕ 새 미션 만들기</Text>

            {/* 미션 이름 */}
            <Text style={styles.fieldLabel}>미션 이름 *</Text>
            <TextInput
              style={styles.fieldInput}
              value={newMissionName}
              onChangeText={setNewMissionName}
              placeholder="예: 물 한 컵 마시기"
              maxLength={20}
            />

            {/* 이모지 선택 */}
            <Text style={styles.fieldLabel}>이모지 선택</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiRow}>
              {['⭐', '💧', '🥤', '🧃', '🎨', '🎵', '🏃', '🧹', '🪴', '🐶', '🎯', '💪'].map(
                (e) => (
                  <Pressable
                    key={e}
                    onPress={() => setNewMissionIcon(e)}
                    style={[
                      styles.emojiOption,
                      newMissionIcon === e && styles.emojiOptionActive,
                    ]}
                  >
                    <Text style={styles.emojiText}>{e}</Text>
                  </Pressable>
                ),
              )}
            </ScrollView>

            {/* 시간대 (카테고리) */}
            <Text style={styles.fieldLabel}>카테고리</Text>
            <View style={[styles.categoryRow, { flexWrap: 'wrap' }]}>
              {CATEGORY_ORDER.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setNewMissionCategory(cat)}
                  style={[
                    styles.categoryOption,
                    { minWidth: '30%', marginBottom: 8 },
                    newMissionCategory === cat && styles.categoryOptionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      newMissionCategory === cat && styles.categoryOptionTextActive,
                    ]}
                  >
                    {CATEGORY_LABELS[cat]}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* 타이머 */}
            <Text style={styles.fieldLabel}>타이머 (분, 0=없음)</Text>
            <TextInput
              style={styles.fieldInput}
              value={newMissionTimer}
              onChangeText={setNewMissionTimer}
              keyboardType="number-pad"
              maxLength={3}
            />

            {/* 별 보상 */}
            <Text style={styles.fieldLabel}>별 보상</Text>
            <View style={styles.starSelectRow}>
              {[1, 2, 3].map((n) => (
                <Pressable
                  key={n}
                  onPress={() => setNewMissionStars(n)}
                  style={[
                    styles.starOption,
                    newMissionStars === n && styles.starOptionActive,
                  ]}
                >
                  <Text style={styles.starOptionText}>{'⭐'.repeat(n)}</Text>
                </Pressable>
              ))}
            </View>

            {/* 버튼 */}
            <Pressable
              onPress={handleAddMission}
              style={({ pressed }) => [
                styles.modalCta,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.modalCtaText}>미션 추가하기</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowAddMission(false)}
              style={styles.modalCancel}
            >
              <Text style={styles.modalCancelText}>취소</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8 },
  header: { marginBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#1F2937' },

  // 카드 공통
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#374151', marginBottom: 12 },

  // 이름
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelSmall: { fontSize: 12, color: '#9CA3AF' },
  nameText: { fontSize: 17, fontWeight: '700', color: '#1F2937', marginTop: 2 },
  editButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: '#FEF3C7' },
  editButtonText: { fontSize: 13, color: '#F59E0B', fontWeight: '600' },
  nameEditRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  nameInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: '#1F2937',
  },
  saveButton: {
    backgroundColor: '#FBBF24',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  saveButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  // 요약
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryEmoji: { fontSize: 24, marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: '800', color: '#059669' },
  summaryLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },

  // 달성률
  rateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rateHint: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },
  rateCircleWrap: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  ratePercent: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },

  // 주간 차트
  chartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  chartAvg: { fontSize: 13, color: '#9CA3AF' },
  chartArea: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end' },
  barColumn: { alignItems: 'center', gap: 4 },
  barRate: { fontSize: 10, color: '#9CA3AF', height: 14 },
  barTrack: { width: 28, borderRadius: 4, backgroundColor: '#F3F4F6', justifyContent: 'flex-end', overflow: 'hidden' },
  bar: { width: '100%', borderRadius: 4, minHeight: 4 },
  barDay: { fontSize: 12, color: '#6B7280', fontWeight: '500' },

  // 미션별
  missionList: { gap: 12 },
  missionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  missionIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  missionInfo: { flex: 1 },
  missionNameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  missionName: { fontSize: 13, fontWeight: '600', color: '#374151', flex: 1 },
  customBadge: { color: '#F59E0B' },
  missionDays: { fontSize: 11, color: '#9CA3AF' },
  missionBarTrack: { height: 6, borderRadius: 3, backgroundColor: '#F3F4F6', overflow: 'hidden' },
  missionBar: { height: '100%', borderRadius: 3 },

  // 미션 추가 버튼
  addMissionButton: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  addMissionButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

  // 모달
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1F2937', marginBottom: 20, textAlign: 'center' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginTop: 12, marginBottom: 6 },
  fieldInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1F2937',
  },
  emojiRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  emojiOption: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' },
  emojiOptionActive: { backgroundColor: '#FEF3C7', borderWidth: 2, borderColor: '#FBBF24' },
  emojiText: { fontSize: 22 },
  categoryRow: { flexDirection: 'row', gap: 8 },
  categoryOption: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center' },
  categoryOptionActive: { backgroundColor: '#FBBF24' },
  categoryOptionText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  categoryOptionTextActive: { color: '#FFFFFF' },
  starSelectRow: { flexDirection: 'row', gap: 8 },
  starOption: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F9FAFB', alignItems: 'center' },
  starOptionActive: { backgroundColor: '#FEF3C7', borderWidth: 2, borderColor: '#FBBF24' },
  starOptionText: { fontSize: 14 },
  modalCta: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  modalCtaText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  modalCancel: { alignItems: 'center', paddingVertical: 12, marginTop: 8 },
  modalCancelText: { fontSize: 14, color: '#9CA3AF' },
});
