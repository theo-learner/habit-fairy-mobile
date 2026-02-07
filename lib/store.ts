// ============================================
// Zustand 상태 관리 — 미션 + 아이 데이터
// AsyncStorage persistence
// ============================================

import { create } from 'zustand';
import { storage } from '@/lib/storage';
import { PRESET_MISSIONS, getAllMissions as fetchAllMissions } from '@/lib/missions';
import type { Mission, MissionCategory } from '@/types';

/** 완료 기록: { 'YYYY-MM-DD': ['mission-id', ...] } */
type CompletedMap = Record<string, string[]>;

interface AppState {
  // --- 미션 ---
  missions: Mission[];
  completedMap: CompletedMap;
  totalStars: number;
  childName: string;
  isLoaded: boolean;

  // --- 액션 ---
  loadData: () => Promise<void>;
  completeMission: (missionId: string, starReward: number) => Promise<void>;
  isMissionCompletedToday: (missionId: string) => boolean;
  getTodayCompleted: () => string[];
  setChildName: (name: string) => Promise<void>;
  addCustomMission: (mission: Omit<Mission, 'id' | 'isPreset' | 'sortOrder'>) => Promise<void>;
  getLastNDays: (n: number) => string[];
  getStreakDays: () => number;
}

/** 오늘 날짜 YYYY-MM-DD */
function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

/** 최근 N일 날짜 배열 */
function computeLastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

export const useAppStore = create<AppState>((set, get) => ({
  missions: PRESET_MISSIONS,
  completedMap: {},
  totalStars: 0,
  childName: '',
  isLoaded: false,

  /** 앱 시작 시 AsyncStorage에서 데이터 로드 */
  loadData: async () => {
    const [completedMap, totalStars, childName, missions] = await Promise.all([
      storage.get<CompletedMap>('completedMissions', {}),
      storage.get<number>('totalStars', 0),
      storage.get<string>('childName', ''),
      fetchAllMissions(),
    ]);
    set({ completedMap, totalStars, childName, missions, isLoaded: true });
  },

  /** 미션 완료 처리 */
  completeMission: async (missionId, starReward) => {
    const { completedMap, totalStars } = get();
    const today = getToday();
    const todayCompleted = completedMap[today] || [];

    // 이미 완료된 미션이면 무시
    if (todayCompleted.includes(missionId)) return;

    const newTodayCompleted = [...todayCompleted, missionId];
    const newCompletedMap = { ...completedMap, [today]: newTodayCompleted };
    const newTotalStars = totalStars + starReward;

    set({ completedMap: newCompletedMap, totalStars: newTotalStars });

    // AsyncStorage에 저장
    await Promise.all([
      storage.set('completedMissions', newCompletedMap),
      storage.set('totalStars', newTotalStars),
    ]);
  },

  /** 오늘 해당 미션 완료 여부 */
  isMissionCompletedToday: (missionId) => {
    const { completedMap } = get();
    const today = getToday();
    return (completedMap[today] || []).includes(missionId);
  },

  /** 오늘 완료된 미션 ID 목록 */
  getTodayCompleted: () => {
    const { completedMap } = get();
    const today = getToday();
    return completedMap[today] || [];
  },

  /** 아이 이름 설정 */
  setChildName: async (name) => {
    set({ childName: name });
    await storage.set('childName', name);
  },

  /** 커스텀 미션 추가 */
  addCustomMission: async (mission) => {
    const { missions } = get();
    const newMission: Mission = {
      ...mission,
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      isPreset: false,
      sortOrder: missions.length,
    };
    const customs = missions.filter((m) => !m.isPreset);
    customs.push(newMission);
    await storage.set('customMissions', customs);
    set({ missions: [...PRESET_MISSIONS, ...customs].filter((m) => m.isActive) });
  },

  /** 최근 N일 날짜 배열 */
  getLastNDays: (n) => computeLastNDays(n),

  /** 연속 달성일 계산 */
  getStreakDays: () => {
    const { completedMap } = get();
    const days = computeLastNDays(30);
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if ((completedMap[days[i]] || []).length > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  },
}));
