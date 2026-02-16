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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';
import { useAppStore } from '@/lib/store';
import { CATEGORY_LABELS } from '@/lib/missions';
import { MISSION_ICONS } from '@/types';
import { playButtonHaptic } from '@/lib/sounds';
import type { Mission, MissionCategory } from '@/types';

const C = {
  lavender: '#8E97C8',
  dark: '#4A5568',
  coral: '#E8744F',
  sage: '#7DB89E',
  white: '#FFFFFF',
  textDark: '#2D3436',
  textMid: '#636E72',
};

function ManageMissionCard({
  mission,
  index,
  onEdit,
  onDelete,
  onToggle,
}: {
  mission: Mission;
  index: number;
  onEdit: (mission: Mission) => void;
  onDelete: (mission: Mission) => void;
  onToggle: (id: string) => void;
}) {
  const swipeableRef = React.useRef<Swipeable>(null);

  const renderRightActions = useCallback(() => {
    if (mission.isPreset) return null;
    return (
      <Pressable
        onPress={() => {
          swipeableRef.current?.close();
          onDelete(mission);
        }}
        style={styles.swipeDeleteAction}
      >
        <Text style={styles.swipeDeleteText}>삭제</Text>
      </Pressable>
    );
  }, [mission, onDelete]);

  const content = (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(300)} style={styles.missionCard}>
      <View style={styles.cardContent}>
        {/* 원형 아이콘 (Headspace 스타일) */}
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>{mission.icon ?? '⭐'}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.missionName}>{mission.name}</Text>
          <View style={styles.tagsRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{CATEGORY_LABELS[mission.category]}</Text>
            </View>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.metaText}>⭐ x{mission.starReward}</Text>
            {(mission.timerSeconds ?? 0) > 0 && (
              <>
                <Text style={styles.dot}>·</Text>
                <Text style={styles.metaText}>🕒 {Math.floor((mission.timerSeconds ?? 0) / 60)}분</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <Switch
            value={mission.isActive}
            onValueChange={() => onToggle(mission.id)}
            trackColor={{ false: '#E0E0E0', true: C.sage }}
            thumbColor={C.white}
            style={{ transform: [{ scale: 0.8 }] }}
            accessibilityLabel={`${mission.name} 활성화`}
            accessibilityRole="switch"
          />
          <Pressable onPress={() => onEdit(mission)} style={styles.editButton}>
            <Text style={styles.editButtonText}>✎ 수정</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );

  if (!mission.isPreset) {
    return (
      <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false}>
        {content}
      </Swipeable>
    );
  }

  return content;
}

export default function ManageScreen() {
  const allMissions = useAppStore((s) => s.allMissions);
  const addCustomMission = useAppStore((s) => s.addCustomMission);
  const deleteCustomMission = useAppStore((s) => s.deleteCustomMission);
  const updateMission = useAppStore((s) => s.updateMission);
  const toggleMission = useAppStore((s) => s.toggleMission);
  const reloadAllMissions = useAppStore((s) => s.reloadAllMissions);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [isNewMission, setIsNewMission] = useState(false);

  useEffect(() => {
    reloadAllMissions();
  }, []);

  const safeMissions = useMemo(() => {
    const list = Array.isArray(allMissions) ? allMissions : [];
    return [...list].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [allMissions]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 안내 */}
        <View style={styles.noticeBox}>
          <Text style={styles.noticeTitle}>미션을 수정하거나 순서를 바꿔보세요!</Text>
          <Text style={styles.noticeSubtitle}>커스텀 미션은 왼쪽으로 스와이프해서 삭제할 수 있어요.</Text>
        </View>

        {/* 미션 리스트 */}
        <View style={styles.list}>
          {safeMissions.map((mission, idx) => (
            <ManageMissionCard
              key={mission.id}
              mission={mission}
              index={idx}
              onEdit={() => {}}
              onDelete={(m) => deleteCustomMission(m.id)}
              onToggle={toggleMission}
            />
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  noticeBox: {
    backgroundColor: C.white,
    padding: 18,
    borderRadius: 20,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.lavender,
    fontFamily: 'Jua',
    marginBottom: 4,
  },
  noticeSubtitle: {
    fontSize: 12,
    color: C.textMid,
    fontFamily: 'Jua',
  },
  list: {
    gap: 12,
  },
  missionCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    backgroundColor: C.dark,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  icon: {
    fontSize: 22,
  },
  infoContainer: {
    flex: 1,
  },
  missionName: {
    fontSize: 15,
    fontWeight: '700',
    color: C.textDark,
    fontFamily: 'Jua',
    marginBottom: 6,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: 'rgba(142,151,200,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    color: C.lavender,
    fontWeight: '600',
    fontFamily: 'Jua',
  },
  dot: {
    marginHorizontal: 4,
    color: '#DDD',
  },
  metaText: {
    fontSize: 12,
    color: C.textMid,
    fontFamily: 'Jua',
  },
  actionsContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 48,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: 12,
    color: C.textMid,
    fontWeight: '500',
    fontFamily: 'Jua',
  },
  swipeDeleteAction: {
    backgroundColor: C.coral,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 20,
    marginLeft: 10,
  },
  swipeDeleteText: {
    color: '#FFF',
    fontWeight: '700',
    fontFamily: 'Jua',
  },
});
