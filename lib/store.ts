// ============================================
// Zustand 상태 관리 — 미션 + 아이 데이터
// AsyncStorage persistence + Null Safety 강화
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
  deleteCustomMission: (id: string) => Promise<void>;
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

  /** 앱 시작 시 AsyncStorage에서 데이터 로드 — 실패해도 기본값으로 동작 */
  loadData: async () => {
    try {
      const [completedMap, totalStars, childName, missions] = await Promise.all([
        storage.get<CompletedMap>('completedMissions', {}),
        storage.get<number>('totalStars', 0),
        storage.get<string>('childName', ''),
        fetchAllMissions(),
      ]);

      // null/undefined 방어: 각 값이 유효하지 않으면 기본값 사용
      set({
        completedMap: completedMap && typeof completedMap === 'object' ? completedMap : {},
        totalStars: typeof totalStars === 'number' && !isNaN(totalStars) ? totalStars : 0,
        childName: typeof childName === 'string' ? childName : '',
        missions: Array.isArray(missions) && missions.length > 0 ? missions : PRESET_MISSIONS,
        isLoaded: true,
      });
    } catch (e) {
      console.error('[HabitFairy] loadData 실패, 기본값 사용:', e);
      // 로드 실패 시 기본값으로 동작 (graceful fallback)
      set({
        completedMap: {},
        totalStars: 0,
        childName: '',
        missions: PRESET_MISSIONS,
        isLoaded: true,
      });
    }
  },

  /** 미션 완료 처리 */
  completeMission: async (missionId, starReward) => {
    try {
      const { completedMap, totalStars } = get();
      const today = getToday();
      const safeMap = completedMap ?? {};
      const todayCompleted = Array.isArray(safeMap[today]) ? safeMap[today] : [];

      // 이미 완료된 미션이면 무시
      if (todayCompleted.includes(missionId)) return;

      // starReward 유효성 검증
      const safeStarReward = typeof starReward === 'number' && !isNaN(starReward) ? starReward : 0;
      const safeTotalStars = typeof totalStars === 'number' && !isNaN(totalStars) ? totalStars : 0;

      const newTodayCompleted = [...todayCompleted, missionId];
      const newCompletedMap = { ...safeMap, [today]: newTodayCompleted };
      const newTotalStars = safeTotalStars + safeStarReward;

      set({ completedMap: newCompletedMap, totalStars: newTotalStars });

      // AsyncStorage에 저장
      await Promise.all([
        storage.set('completedMissions', newCompletedMap),
        storage.set('totalStars', newTotalStars),
      ]);
    } catch (e) {
      console.error('[HabitFairy] completeMission 실패:', e);
    }
  },

  /** 오늘 해당 미션 완료 여부 */
  isMissionCompletedToday: (missionId) => {
    const { completedMap } = get();
    const today = getToday();
    const safeMap = completedMap ?? {};
    const todayList = Array.isArray(safeMap[today]) ? safeMap[today] : [];
    return todayList.includes(missionId);
  },

  /** 오늘 완료된 미션 ID 목록 */
  getTodayCompleted: () => {
    const { completedMap } = get();
    const today = getToday();
    const safeMap = completedMap ?? {};
    return Array.isArray(safeMap[today]) ? safeMap[today] : [];
  },

  /** 아이 이름 설정 */
  setChildName: async (name) => {
    try {
      const safeName = typeof name === 'string' ? name : '';
      set({ childName: safeName });
      await storage.set('childName', safeName);
    } catch (e) {
      console.error('[HabitFairy] setChildName 실패:', e);
    }
  },

  /** 커스텀 미션 추가 */
  addCustomMission: async (mission) => {
    try {
      const { missions } = get();
      const safeMissions = Array.isArray(missions) ? missions : [];
      const newMission: Mission = {
        ...mission,
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        isPreset: false,
        sortOrder: safeMissions.length,
      };
      const customs = safeMissions.filter((m) => !m.isPreset);
      customs.push(newMission);
      await storage.set('customMissions', customs);
      // 미션 목록 즉시 반영
      const activeMissions = [...PRESET_MISSIONS, ...customs].filter((m) => m.isActive);
      set({ missions: activeMissions });
    } catch (e) {
      console.error('[HabitFairy] addCustomMission 실패:', e);
    }
  },

  /** 커스텀 미션 삭제 */
  deleteCustomMission: async (id: string) => {
    try {
      const { missions } = get();
      const safeMissions = Array.isArray(missions) ? missions : [];
      const customs = safeMissions.filter((m) => !m.isPreset && m.id !== id);
      await storage.set('customMissions', customs);
      // 미션 목록 즉시 반영
      const activeMissions = [...PRESET_MISSIONS, ...customs].filter((m) => m.isActive);
      set({ missions: activeMissions });
    } catch (e) {
      console.error('[HabitFairy] deleteCustomMission 실패:', e);
    }
  },

  /** 최근 N일 날짜 배열 */
  getLastNDays: (n) => computeLastNDays(n),

  /** 연속 달성일 계산 */
  getStreakDays: () => {
    const { completedMap } = get();
    const safeMap = completedMap ?? {};
    const days = computeLastNDays(30);
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      const dayList = Array.isArray(safeMap[days[i]]) ? safeMap[days[i]] : [];
      if (dayList.length > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  },
}));
