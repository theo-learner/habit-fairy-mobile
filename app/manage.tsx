// ============================================
// 미션 관리 화면 — CRUD + 순서변경 + 토글
// 프리셋/커스텀 미션 모두 수정 가능
// 스와이프 삭제 + 모달 편집 + 빈 상태 처리
// ============================================

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';
import { useAppStore } from '@/lib/store';
import { CATEGORY_LABELS } from '@/lib/missions';
import { MISSION_ICONS } from '@/types';
import { playButtonHaptic } from '@/lib/sounds';
import type { Mission, MissionCategory } from '@/types';

/** 카테고리 옵션 */
const CATEGORY_OPTIONS: { value: MissionCategory; label: string }[] = [
  { value: 'morning', label: '🌅 아침' },
  { value: 'daytime', label: '☀️ 낮' },
  { value: 'evening', label: '🌙 저녁' },
];

/** 별 보상 옵션 */
const STAR_OPTIONS = [1, 2, 3, 4, 5];

/** 스와이프 삭제 오른쪽 액션 */
function SwipeDeleteAction({ onDelete }: { onDelete: () => void }) {
  return (
    <Pressable onPress={onDelete} style={styles.swipeDeleteAction}>
      <Text style={styles.swipeDeleteText}>🗑️{'\n'}삭제</Text>
    </Pressable>
  );
}

/** 미션 카드 (관리용) */
function ManageMissionCard({
  mission,
  index,
  totalCount,
  onEdit,
  onDelete,
  onToggle,
  onReorder,
}: {
  mission: Mission;
  index: number;
  totalCount: number;
  onEdit: (mission: Mission) => void;
  onDelete: (mission: Mission) => void;
  onToggle: (id: string) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
}) {
  const swipeableRef = React.useRef<Swipeable>(null);

  // 프리셋 미션은 스와이프 삭제 불가
  const renderRightActions = useCallback(() => {
    if (mission.isPreset) return null;
    return (
      <SwipeDeleteAction
        onDelete={() => {
          swipeableRef.current?.close();
          onDelete(mission);
        }}
      />
    );
  }, [mission, onDelete]);

  const content = (
    <Animated.View
      entering={FadeInDown.delay(index * 40).duration(300)}
      style={[
        styles.missionCard,
        !mission.isActive && styles.missionCardInactive,
      ]}
    >
      <View style={styles.missionCardTop}>
        {/* 이모지 + 이름 */}
        <View style={styles.missionCardInfo}>
          <Text style={styles.missionCardIcon}>{mission.icon ?? '⭐'}</Text>
          <View style={styles.missionCardText}>
            <View style={styles.missionCardNameRow}>
              <Text
                style={[
                  styles.missionCardName,
                  !mission.isActive && styles.missionCardNameInactive,
                ]}
                numberOfLines={1}
              >
                {mission.name ?? '미션'}
              </Text>
              {mission.isPreset && (
                <View style={styles.presetBadge}>
                  <Text style={styles.presetBadgeText}>기본</Text>
                </View>
              )}
              {!mission.isPreset && (
                <View style={styles.customBadge}>
                  <Text style={styles.customBadgeText}>커스텀</Text>
                </View>
              )}
            </View>
            <Text style={styles.missionCardDesc} numberOfLines={1}>
              {CATEGORY_LABELS[mission.category] ?? '미분류'} ・ ⭐×{mission.starReward ?? 1}
              {(mission.timerSeconds ?? 0) > 0
                ? ` ・ ⏱${Math.floor((mission.timerSeconds ?? 0) / 60)}분`
                : ''}
            </Text>
          </View>
        </View>

        {/* 활성/비활성 토글 */}
        <Switch
          value={mission.isActive}
          onValueChange={() => onToggle(mission.id)}
          trackColor={{ false: '#D1D5DB', true: '#FDE68A' }}
          thumbColor={mission.isActive ? '#F59E0B' : '#9CA3AF'}
          style={styles.toggleSwitch}
        />
      </View>

      {/* 하단 액션 버튼 */}
      <View style={styles.missionCardActions}>
        {/* 순서 이동 */}
        <View style={styles.reorderButtons}>
          <Pressable
            onPress={() => {
              playButtonHaptic();
              onReorder(mission.id, 'up');
            }}
            disabled={index === 0}
            style={[
              styles.reorderButton,
              index === 0 && styles.reorderButtonDisabled,
            ]}
          >
            <Text style={styles.reorderButtonText}>▲</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              playButtonHaptic();
              onReorder(mission.id, 'down');
            }}
            disabled={index === totalCount - 1}
            style={[
              styles.reorderButton,
              index === totalCount - 1 && styles.reorderButtonDisabled,
            ]}
          >
            <Text style={styles.reorderButtonText}>▼</Text>
          </Pressable>
        </View>

        {/* 수정/삭제 버튼 */}
        <View style={styles.actionButtons}>
          <Pressable
            onPress={() => {
              playButtonHaptic();
              onEdit(mission);
            }}
            style={styles.editActionButton}
          >
            <Text style={styles.editActionText}>✏️ 수정</Text>
          </Pressable>
          {!mission.isPreset && (
            <Pressable
              onPress={() => {
                playButtonHaptic();
                onDelete(mission);
              }}
              style={styles.deleteActionButton}
            >
              <Text style={styles.deleteActionText}>🗑️ 삭제</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Animated.View>
  );

  // 커스텀 미션만 스와이프 삭제 가능
  if (!mission.isPreset) {
    return (
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        overshootRight={false}
        friction={2}
      >
        {content}
      </Swipeable>
    );
  }

  return content;
}

/** 미션 편집/추가 모달 */
function MissionEditModal({
  visible,
  mission,
  isNew,
  onSave,
  onCancel,
}: {
  visible: boolean;
  mission: Partial<Mission> | null;
  isNew: boolean;
  onSave: (data: Partial<Mission>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('⭐');
  const [category, setCategory] = useState<MissionCategory>('morning');
  const [timerMinutes, setTimerMinutes] = useState('0');
  const [starReward, setStarReward] = useState(1);

  // 미션 데이터가 변경되면 폼 초기화
  useEffect(() => {
    if (visible && mission) {
      setName(mission.name ?? '');
      setDescription(mission.description ?? '');
      setIcon(mission.icon ?? '⭐');
      setCategory(mission.category ?? 'morning');
      setTimerMinutes(String(Math.floor((mission.timerSeconds ?? 0) / 60)));
      setStarReward(mission.starReward ?? 1);
    } else if (visible && !mission) {
      // 새 미션
      setName('');
      setDescription('');
      setIcon('⭐');
      setCategory('morning');
      setTimerMinutes('0');
      setStarReward(1);
    }
  }, [visible, mission]);

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('⚠️ 입력 필요', '미션 이름을 입력해주세요');
      return;
    }
    const timerSec = Math.max(0, (parseInt(timerMinutes, 10) || 0) * 60);
    const safeStars = Math.min(5, Math.max(1, starReward));
    const descText = description.trim() || `${trimmedName} 미션이에요!`;

    onSave({
      name: trimmedName,
      description: descText,
      icon,
      category,
      timerSeconds: timerSec,
      starReward: safeStars,
      fairyMessageStart: `${trimmedName} 시작해볼까? 화이팅! 💪`,
      fairyMessageComplete: `${trimmedName} 완료! 정말 잘했어! ⭐`,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>
              {isNew ? '➕ 새 미션 만들기' : '✏️ 미션 수정'}
            </Text>

            {/* 미션 이름 */}
            <Text style={styles.fieldLabel}>미션 이름 *</Text>
            <TextInput
              style={styles.fieldInput}
              value={name}
              onChangeText={setName}
              placeholder="예: 물 한 컵 마시기"
              maxLength={20}
            />

            {/* 설명 */}
            <Text style={styles.fieldLabel}>설명</Text>
            <TextInput
              style={[styles.fieldInput, styles.fieldInputMultiline]}
              value={description}
              onChangeText={setDescription}
              placeholder="미션 설명을 입력해주세요"
              maxLength={50}
              multiline
              numberOfLines={2}
            />

            {/* 이모지 선택 */}
            <Text style={styles.fieldLabel}>이모지 선택</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.emojiRow}
              contentContainerStyle={styles.emojiRowContent}
            >
              {MISSION_ICONS.map((e) => (
                <Pressable
                  key={e}
                  onPress={() => setIcon(e)}
                  style={[
                    styles.emojiOption,
                    icon === e && styles.emojiOptionActive,
                  ]}
                >
                  <Text style={styles.emojiText}>{e}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* 시간대 */}
            <Text style={styles.fieldLabel}>시간대</Text>
            <View style={styles.categoryRow}>
              {CATEGORY_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => setCategory(opt.value)}
                  style={[
                    styles.categoryOption,
                    category === opt.value && styles.categoryOptionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      category === opt.value && styles.categoryOptionTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* 타이머 */}
            <Text style={styles.fieldLabel}>타이머 (분, 0=없음)</Text>
            <TextInput
              style={styles.fieldInput}
              value={timerMinutes}
              onChangeText={setTimerMinutes}
              keyboardType="number-pad"
              maxLength={3}
            />

            {/* 별 보상 */}
            <Text style={styles.fieldLabel}>별 보상</Text>
            <View style={styles.starSelectRow}>
              {STAR_OPTIONS.map((n) => (
                <Pressable
                  key={n}
                  onPress={() => setStarReward(n)}
                  style={[
                    styles.starOption,
                    starReward === n && styles.starOptionActive,
                  ]}
                >
                  <Text style={styles.starOptionText}>{'⭐'.repeat(n)}</Text>
                </Pressable>
              ))}
            </View>

            {/* 저장/취소 버튼 */}
            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [
                styles.modalCta,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.modalCtaText}>
                {isNew ? '미션 추가하기' : '수정 완료'}
              </Text>
            </Pressable>
            <Pressable onPress={onCancel} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>취소</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/** 메인 관리 화면 */
export default function ManageScreen() {
  const allMissions = useAppStore((s) => s.allMissions);
  const addCustomMission = useAppStore((s) => s.addCustomMission);
  const deleteCustomMission = useAppStore((s) => s.deleteCustomMission);
  const updateMission = useAppStore((s) => s.updateMission);
  const toggleMission = useAppStore((s) => s.toggleMission);
  const reorderMission = useAppStore((s) => s.reorderMission);
  const reloadAllMissions = useAppStore((s) => s.reloadAllMissions);

  // 모달 상태
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [isNewMission, setIsNewMission] = useState(false);

  // 화면 진입 시 데이터 새로고침
  useEffect(() => {
    reloadAllMissions();
  }, [reloadAllMissions]);

  const safeMissions = useMemo(() => {
    const list = Array.isArray(allMissions) ? allMissions : [];
    return [...list].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [allMissions]);

  const activeCount = useMemo(
    () => safeMissions.filter((m) => m.isActive).length,
    [safeMissions],
  );

  /** 수정 모달 열기 */
  const handleEdit = useCallback((mission: Mission) => {
    setEditingMission(mission);
    setIsNewMission(false);
    setModalVisible(true);
  }, []);

  /** 새 미션 모달 열기 */
  const handleAddNew = useCallback(() => {
    playButtonHaptic();
    setEditingMission(null);
    setIsNewMission(true);
    setModalVisible(true);
  }, []);

  /** 미션 삭제 확인 */
  const handleDelete = useCallback(
    (mission: Mission) => {
      if (mission.isPreset) {
        Alert.alert('ℹ️ 알림', '기본 미션은 삭제할 수 없어요.\n대신 비활성화할 수 있어요!');
        return;
      }
      Alert.alert(
        '🗑️ 미션 삭제',
        `"${mission.name ?? '미션'}" 미션을 삭제할까요?`,
        [
          { text: '취소', style: 'cancel' },
          {
            text: '삭제',
            style: 'destructive',
            onPress: () => deleteCustomMission(mission.id),
          },
        ],
      );
    },
    [deleteCustomMission],
  );

  /** 모달 저장 */
  const handleModalSave = useCallback(
    async (data: Partial<Mission>) => {
      if (isNewMission) {
        // 새 미션 추가
        await addCustomMission({
          name: data.name ?? '새 미션',
          description: data.description ?? '',
          icon: data.icon ?? '⭐',
          category: data.category ?? 'morning',
          timerSeconds: data.timerSeconds ?? 0,
          starReward: data.starReward ?? 1,
          fairyMessageStart: data.fairyMessageStart ?? '시작해볼까? 💪',
          fairyMessageComplete: data.fairyMessageComplete ?? '잘했어! ⭐',
          isActive: true,
        });
        Alert.alert('✨ 추가 완료!', `"${data.name ?? '새 미션'}" 미션이 추가되었어요`);
      } else if (editingMission) {
        // 기존 미션 수정
        await updateMission(editingMission.id, data);
        Alert.alert('✅ 수정 완료!', `"${data.name ?? editingMission.name}" 미션이 수정되었어요`);
      }
      setModalVisible(false);
      setEditingMission(null);
    },
    [isNewMission, editingMission, addCustomMission, updateMission],
  );

  /** 모달 닫기 */
  const handleModalCancel = useCallback(() => {
    setModalVisible(false);
    setEditingMission(null);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <Text style={styles.headerTitle}>⚙️ 미션 관리</Text>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>
              활성 {activeCount}/{safeMissions.length}
            </Text>
          </View>
        </Animated.View>

        {/* 안내 */}
        <Animated.View entering={FadeInDown.delay(50).duration(300)} style={styles.infoCard}>
          <Text style={styles.infoText}>
            미션을 수정하거나 순서를 바꿔보세요!{'\n'}
            커스텀 미션은 왼쪽으로 스와이프해서 삭제할 수 있어요.
          </Text>
        </Animated.View>

        {/* 미션 목록 */}
        {safeMissions.length > 0 ? (
          <View style={styles.missionList}>
            {safeMissions.map((mission, idx) => (
              <ManageMissionCard
                key={mission.id}
                mission={mission}
                index={idx}
                totalCount={safeMissions.length}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggle={toggleMission}
                onReorder={reorderMission}
              />
            ))}
          </View>
        ) : (
          /* 빈 상태 */
          <Animated.View entering={FadeIn.duration(500)} style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🧚</Text>
            <Text style={styles.emptyTitle}>미션이 없어요!</Text>
            <Text style={styles.emptyDesc}>
              아래 버튼을 눌러{'\n'}첫 번째 미션을 추가해보세요!
            </Text>
          </Animated.View>
        )}

        {/* 새 미션 추가 버튼 */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Pressable
            onPress={handleAddNew}
            style={({ pressed }) => [
              styles.addButton,
              pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
            ]}
          >
            <Text style={styles.addButtonText}>➕ 새 미션 추가</Text>
          </Pressable>
        </Animated.View>

        {/* 하단 여백 */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* 편집/추가 모달 */}
      <MissionEditModal
        visible={modalVisible}
        mission={editingMission}
        isNew={isNewMission}
        onSave={handleModalSave}
        onCancel={handleModalCancel}
      />
    </SafeAreaView>
  );
}

// ============================================
// 스타일
// ============================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
  },
  headerBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  headerBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B45309',
  },

  // 안내 카드
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 20,
    textAlign: 'center',
  },

  // 미션 목록
  missionList: {
    gap: 10,
    marginBottom: 16,
  },

  // 미션 카드
  missionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  missionCardInactive: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    opacity: 0.7,
  },
  missionCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  missionCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  missionCardIcon: {
    fontSize: 28,
    width: 36,
    textAlign: 'center',
  },
  missionCardText: {
    flex: 1,
  },
  missionCardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  missionCardName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    flexShrink: 1,
  },
  missionCardNameInactive: {
    color: '#9CA3AF',
  },
  presetBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  presetBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2563EB',
  },
  customBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  customBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D97706',
  },
  missionCardDesc: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  toggleSwitch: {
    marginLeft: 8,
  },

  // 카드 하단 액션
  missionCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  reorderButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  reorderButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderButtonDisabled: {
    opacity: 0.3,
  },
  reorderButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
  },
  editActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  deleteActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
  },
  deleteActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },

  // 스와이프 삭제
  swipeDeleteAction: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    marginLeft: -4,
  },
  swipeDeleteText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
  },

  // 빈 상태
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },

  // 추가 버튼
  addButton: {
    backgroundColor: '#6366F1',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },

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
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 6,
  },
  fieldInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1F2937',
  },
  fieldInputMultiline: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  emojiRow: {
    marginBottom: 4,
  },
  emojiRowContent: {
    flexDirection: 'row',
    gap: 8,
  },
  emojiOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiOptionActive: {
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#FBBF24',
  },
  emojiText: {
    fontSize: 22,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  categoryOptionActive: {
    backgroundColor: '#FBBF24',
  },
  categoryOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryOptionTextActive: {
    color: '#FFFFFF',
  },
  starSelectRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  starOption: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  starOptionActive: {
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#FBBF24',
  },
  starOptionText: {
    fontSize: 12,
  },
  modalCta: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  modalCtaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalCancel: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
