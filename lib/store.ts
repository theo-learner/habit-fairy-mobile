// ============================================
// Zustand 상태 관리 — 미션 + 아이 데이터
// AsyncStorage persistence + Null Safety 강화
// 미션 CRUD + 순서변경 + 토글 지원
// ============================================

import { create } from 'zustand';
import { storage } from '@/lib/storage';
import { usePetStore } from '@/store/usePetStore';
import {
  PRESET_MISSIONS,
  getAllMissions as fetchAllMissions,
  getAllMissionsIncludingInactive,
  getCustomMissions,
  saveCustomMissions,
  getPresetOverrides,
  savePresetOverrides,
} from '@/lib/missions';
import type { Mission, MissionCategory } from '@/types';

/** 완료 기록: { 'YYYY-MM-DD': ['mission-id', ...] } */
type CompletedMap = Record<string, string[]>;

interface AppState {
  // --- 미션 ---
  missions: Mission[];           // 활성 미션 (홈화면용)
  allMissions: Mission[];        // 전체 미션 포함 비활성 (관리화면용)
  completedMap: CompletedMap;
  totalStars: number;
  childName: string;
  isLoaded: boolean;

  // --- 꾸미기 아이템 ---
  ownedItems: string[];          // 보유한 아이템 ID 목록
  equippedItems: Record<string, string | null>; // 장착한 아이템 { category: itemId }

  // --- 기존 액션 ---
  loadData: () => Promise<void>;
  completeMission: (missionId: string, starReward: number) => Promise<void>;
  isMissionCompletedToday: (missionId: string) => boolean;
  getTodayCompleted: () => string[];
  setChildName: (name: string) => Promise<void>;
  addCustomMission: (mission: Omit<Mission, 'id' | 'isPreset' | 'sortOrder'>) => Promise<void>;
  deleteCustomMission: (id: string) => Promise<void>;
  getLastNDays: (n: number) => string[];
  getStreakDays: () => number;

  // --- 꾸미기 액션 ---
  purchaseItem: (itemId: string, cost: number) => Promise<void>;
  toggleEquipItem: (itemId: string, category: string) => Promise<void>;

  // --- 미션 관리 액션 ---
  updateMission: (id: string, updates: Partial<Mission>) => Promise<void>;
  reorderMission: (id: string, direction: 'up' | 'down') => Promise<void>;
  toggleMission: (id: string) => Promise<void>;
  reloadAllMissions: () => Promise<void>;
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
  allMissions: PRESET_MISSIONS,
  completedMap: {},
  totalStars: 0,
  childName: '',
  isLoaded: false,
  ownedItems: [],
  equippedItems: {},

  /** 앱 시작 시 AsyncStorage에서 데이터 로드 — 실패해도 기본값으로 동작 */
  loadData: async () => {
    try {
      const [completedMap, totalStars, childName, missions, allMissions, ownedItems, equippedItems] = await Promise.all([
        storage.get<CompletedMap>('completedMissions', {}),
        storage.get<number>('totalStars', 0),
        storage.get<string>('childName', ''),
        fetchAllMissions(),
        getAllMissionsIncludingInactive(),
        storage.get<string[]>('ownedItems', []),
        storage.get<Record<string, string | null>>('equippedItems', {}),
      ]);

      // null/undefined 방어: 각 값이 유효하지 않으면 기본값 사용
      set({
        completedMap: completedMap && typeof completedMap === 'object' ? completedMap : {},
        totalStars: typeof totalStars === 'number' && !isNaN(totalStars) ? totalStars : 0,
        childName: typeof childName === 'string' ? childName : '',
        missions: Array.isArray(missions) && missions.length > 0 ? missions : PRESET_MISSIONS,
        allMissions: Array.isArray(allMissions) && allMissions.length > 0 ? allMissions : PRESET_MISSIONS,
        ownedItems: Array.isArray(ownedItems) ? ownedItems : [],
        equippedItems: equippedItems && typeof equippedItems === 'object' ? equippedItems : {},
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
        allMissions: PRESET_MISSIONS,
        ownedItems: [],
        equippedItems: {},
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

      // 🌟 진화 시스템 연동: 미션 완료 시 경험치 획득 (별 1개 = 5 EXP)
      const expGain = safeStarReward * 5;
      usePetStore.getState().gainExp(expGain);
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
      const { allMissions } = get();
      const safeAll = Array.isArray(allMissions) ? allMissions : [];
      const newMission: Mission = {
        ...mission,
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        isPreset: false,
        sortOrder: safeAll.length,
      };

      // 커스텀 미션 저장
      const customs = safeAll.filter((m) => !m.isPreset);
      customs.push(newMission);
      await saveCustomMissions(customs);

      // 전체 + 활성 목록 갱신
      const newAll = [...safeAll, newMission];
      const activeMissions = newAll
        .filter((m) => m.isActive)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      set({ missions: activeMissions, allMissions: newAll });
    } catch (e) {
      console.error('[HabitFairy] addCustomMission 실패:', e);
    }
  },

  /** 커스텀 미션 삭제 */
  deleteCustomMission: async (id: string) => {
    try {
      const { allMissions } = get();
      const safeAll = Array.isArray(allMissions) ? allMissions : [];
      const target = safeAll.find((m) => m.id === id);

      // 프리셋 미션은 삭제 불가 (비활성화만 가능)
      if (!target || target.isPreset) return;

      const newAll = safeAll.filter((m) => m.id !== id);
      const customs = newAll.filter((m) => !m.isPreset);
      await saveCustomMissions(customs);

      const activeMissions = newAll
        .filter((m) => m.isActive)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      set({ missions: activeMissions, allMissions: newAll });
    } catch (e) {
      console.error('[HabitFairy] deleteCustomMission 실패:', e);
    }
  },

  /** 아이템 구매 */
  purchaseItem: async (itemId, cost) => {
    try {
      const { totalStars, ownedItems } = get();
      if (totalStars < cost) return;
      if (ownedItems.includes(itemId)) return;

      const newStars = totalStars - cost;
      const newOwned = [...ownedItems, itemId];

      set({ totalStars: newStars, ownedItems: newOwned });
      await Promise.all([
        storage.set('totalStars', newStars),
        storage.set('ownedItems', newOwned),
      ]);
    } catch (e) {
      console.error('[HabitFairy] purchaseItem 실패:', e);
    }
  },

  /** 아이템 장착/해제 토글 */
  toggleEquipItem: async (itemId, category) => {
    try {
      const { equippedItems, ownedItems } = get();
      if (!ownedItems.includes(itemId)) return;

      const newEquipped = { ...equippedItems };
      if (newEquipped[category] === itemId) {
        // 이미 장착 중이면 해제
        newEquipped[category] = null;
      } else {
        // 아니면 장착
        newEquipped[category] = itemId;
      }

      set({ equippedItems: newEquipped });
      await storage.set('equippedItems', newEquipped);
    } catch (e) {
      console.error('[HabitFairy] toggleEquipItem 실패:', e);
    }
  },

  /** 미션 수정 — 프리셋은 오버라이드, 커스텀은 직접 수정 */
  updateMission: async (id: string, updates: Partial<Mission>) => {
    try {
      const { allMissions } = get();
      const safeAll = Array.isArray(allMissions) ? allMissions : [];
      const target = safeAll.find((m) => m.id === id);
      if (!target) return;

      // 안전 필드만 업데이트 허용 (id, isPreset은 변경 불가)
      const safeUpdates = { ...updates };
      delete safeUpdates.id;
      delete safeUpdates.isPreset;

      if (target.isPreset) {
        // 프리셋: 오버라이드로 저장
        const overrides = await getPresetOverrides();
        overrides[id] = { ...(overrides[id] ?? {}), ...safeUpdates };
        await savePresetOverrides(overrides);
      } else {
        // 커스텀: 직접 수정 후 저장
        const customs = safeAll.filter((m) => !m.isPreset).map((m) =>
          m.id === id ? { ...m, ...safeUpdates } : m,
        );
        await saveCustomMissions(customs);
      }

      // 메모리 상태 업데이트
      const newAll = safeAll.map((m) =>
        m.id === id ? { ...m, ...safeUpdates } : m,
      );
      const activeMissions = newAll
        .filter((m) => m.isActive)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      set({ missions: activeMissions, allMissions: newAll });
    } catch (e) {
      console.error('[HabitFairy] updateMission 실패:', e);
    }
  },

  /** 미션 순서 변경 — 위/아래 이동 */
  reorderMission: async (id: string, direction: 'up' | 'down') => {
    try {
      const { allMissions } = get();
      const safeAll = Array.isArray(allMissions) ? allMissions : [];
      const sorted = [...safeAll].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      const idx = sorted.findIndex((m) => m.id === id);
      if (idx < 0) return;

      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return;

      // sortOrder 교환
      const tempOrder = sorted[idx].sortOrder;
      sorted[idx] = { ...sorted[idx], sortOrder: sorted[swapIdx].sortOrder };
      sorted[swapIdx] = { ...sorted[swapIdx], sortOrder: tempOrder };

      // 영속 저장: 프리셋 오버라이드 + 커스텀 미션
      const overrides = await getPresetOverrides();
      const customs: Mission[] = [];

      for (const m of sorted) {
        if (m.isPreset) {
          overrides[m.id] = { ...(overrides[m.id] ?? {}), sortOrder: m.sortOrder };
        } else {
          customs.push(m);
        }
      }

      await Promise.all([
        savePresetOverrides(overrides),
        saveCustomMissions(customs),
      ]);

      // 상태 갱신
      const newAll = sorted.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      const activeMissions = newAll
        .filter((m) => m.isActive)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      set({ missions: activeMissions, allMissions: [...newAll] });
    } catch (e) {
      console.error('[HabitFairy] reorderMission 실패:', e);
    }
  },

  /** 미션 활성/비활성 토글 */
  toggleMission: async (id: string) => {
    try {
      const { allMissions } = get();
      const safeAll = Array.isArray(allMissions) ? allMissions : [];
      const target = safeAll.find((m) => m.id === id);
      if (!target) return;

      const newActive = !target.isActive;

      if (target.isPreset) {
        const overrides = await getPresetOverrides();
        overrides[id] = { ...(overrides[id] ?? {}), isActive: newActive };
        await savePresetOverrides(overrides);
      } else {
        const customs = safeAll.filter((m) => !m.isPreset).map((m) =>
          m.id === id ? { ...m, isActive: newActive } : m,
        );
        await saveCustomMissions(customs);
      }

      const newAll = safeAll.map((m) =>
        m.id === id ? { ...m, isActive: newActive } : m,
      );
      const activeMissions = newAll
        .filter((m) => m.isActive)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      set({ missions: activeMissions, allMissions: newAll });
    } catch (e) {
      console.error('[HabitFairy] toggleMission 실패:', e);
    }
  },

  /** 전체 미션 목록 새로고침 (관리화면 진입 시 등) */
  reloadAllMissions: async () => {
    try {
      const [missions, allMissions] = await Promise.all([
        fetchAllMissions(),
        getAllMissionsIncludingInactive(),
      ]);
      set({
        missions: Array.isArray(missions) ? missions : PRESET_MISSIONS,
        allMissions: Array.isArray(allMissions) ? allMissions : PRESET_MISSIONS,
      });
    } catch (e) {
      console.error('[HabitFairy] reloadAllMissions 실패:', e);
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
