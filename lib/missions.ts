// ============================================
// 미션 데이터 관리 — 프리셋 10개 + 커스텀 미션
// AsyncStorage 기반 로컬 저장 + Null Safety
// 프리셋 오버라이드 지원 (이름/설명/이모지 등 수정)
// ============================================

import { Mission, MissionCategory } from '@/types';
import { storage } from '@/lib/storage';

/** 기본 미션 10개 프리셋 */
export const PRESET_MISSIONS: Mission[] = [
  {
    id: 'mission-brush-teeth',
    name: '양치하기',
    description: '치카치카! 위아래 골고루 닦아요',
    icon: '🪥',
    category: 'morning',
    timerSeconds: 180,
    starReward: 2,
    fairyMessageStart: '이를 반짝반짝 닦을 시간이야!',
    fairyMessageComplete: '와~ 이가 정말 깨끗해졌다!',
    isPreset: true,
    isActive: true,
    sortOrder: 0,
  },
  {
    id: 'mission-wash-face',
    name: '세수하기',
    description: '물로 세수하고 깨끗한 얼굴!',
    icon: '🧼',
    category: 'morning',
    timerSeconds: 60,
    starReward: 1,
    fairyMessageStart: '얼굴을 깨끗하게 씻어볼까?',
    fairyMessageComplete: '깨끗한 얼굴! 정말 예쁘다!',
    isPreset: true,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'mission-wash-hands',
    name: '손 씻기',
    description: '비누로 거품 내서 깨끗하게!',
    icon: '🫧',
    category: 'daytime',
    timerSeconds: 30,
    starReward: 1,
    fairyMessageStart: '손에 있는 세균을 물리치자!',
    fairyMessageComplete: '세균이 모두 도망갔어!',
    isPreset: true,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'mission-dress-up',
    name: '옷 입기',
    description: '오늘의 옷을 스스로 입어요',
    icon: '👕',
    category: 'morning',
    timerSeconds: 300,
    starReward: 2,
    fairyMessageStart: '멋진 옷을 스스로 입어볼까?',
    fairyMessageComplete: '혼자 옷을 입다니 정말 대단해!',
    isPreset: true,
    isActive: true,
    sortOrder: 3,
  },
  {
    id: 'mission-shoes',
    name: '신발 신기',
    description: '왼쪽 오른쪽 잘 맞춰서!',
    icon: '👟',
    category: 'morning',
    timerSeconds: 120,
    starReward: 1,
    fairyMessageStart: '신발을 척척 신어볼까?',
    fairyMessageComplete: '왼쪽 오른쪽 완벽하게 신었네!',
    isPreset: true,
    isActive: true,
    sortOrder: 4,
  },
  {
    id: 'mission-greet',
    name: '인사하기',
    description: '안녕하세요! 밝게 인사해요',
    icon: '👋',
    category: 'morning',
    timerSeconds: 0,
    starReward: 1,
    fairyMessageStart: '오늘 만나는 사람에게 인사해볼까?',
    fairyMessageComplete: '밝은 인사 너무 멋져!',
    isPreset: true,
    isActive: true,
    sortOrder: 5,
  },
  {
    id: 'mission-eat',
    name: '밥 먹기',
    description: '골고루 냠냠 맛있게 먹어요',
    icon: '🍚',
    category: 'daytime',
    timerSeconds: 0,
    starReward: 3,
    fairyMessageStart: '맛있는 밥을 골고루 먹어볼까?',
    fairyMessageComplete: '골고루 다 먹었구나! 정말 잘했어!',
    isPreset: true,
    isActive: true,
    sortOrder: 6,
  },
  {
    id: 'mission-tidy-toys',
    name: '장난감 정리',
    description: '놀고 난 장난감을 제자리에!',
    icon: '🧸',
    category: 'daytime',
    timerSeconds: 300,
    starReward: 2,
    fairyMessageStart: '장난감들이 집에 가고 싶대!',
    fairyMessageComplete: '와~ 방이 정말 깨끗해졌다!',
    isPreset: true,
    isActive: true,
    sortOrder: 7,
  },
  {
    id: 'mission-read-book',
    name: '책 읽기',
    description: '그림책 한 권을 읽어요',
    icon: '📚',
    category: 'daytime',
    timerSeconds: 600,
    starReward: 3,
    fairyMessageStart: '오늘은 어떤 이야기를 읽어볼까?',
    fairyMessageComplete: '책 한 권을 다 읽다니 대단해!',
    isPreset: true,
    isActive: true,
    sortOrder: 8,
  },
  {
    id: 'mission-bedtime',
    name: '잠자리 준비',
    description: '이 닦고 파자마 입고 잘 준비!',
    icon: '🌙',
    category: 'evening',
    timerSeconds: 0,
    starReward: 2,
    fairyMessageStart: '오늘 하루 수고했어! 잘 준비해볼까?',
    fairyMessageComplete: '내일도 별이가 기다리고 있을게. 잘 자!',
    isPreset: true,
    isActive: true,
    sortOrder: 9,
  },
];

/** 카테고리 라벨 */
export const CATEGORY_LABELS: Record<MissionCategory, string> = {
  morning: '🌅 아침 루틴',
  daytime: '☀️ 낮 활동',
  evening: '🌙 저녁 루틴',
  study: '📖 공부 시간',
  health: '💪 건강 지키기',
};

/** 카테고리 순서 */
export const CATEGORY_ORDER: MissionCategory[] = ['morning', 'daytime', 'study', 'health', 'evening'];

/** 커스텀 미션 목록 로드 — 배열 유효성 검증 */
export async function getCustomMissions(): Promise<Mission[]> {
  const result = await storage.get<Mission[]>('customMissions', []);
  // 배열이 아닌 경우 방어
  return Array.isArray(result) ? result : [];
}

/** 커스텀 미션 저장 */
export async function saveCustomMissions(missions: Mission[]): Promise<void> {
  const safeMissions = Array.isArray(missions) ? missions : [];
  await storage.set('customMissions', safeMissions);
}

/** 프리셋 오버라이드 로드 — 프리셋 미션의 사용자 수정사항 */
export async function getPresetOverrides(): Promise<Record<string, Partial<Mission>>> {
  const result = await storage.get<Record<string, Partial<Mission>>>('presetOverrides', {});
  return result && typeof result === 'object' ? result : {};
}

/** 프리셋 오버라이드 저장 */
export async function savePresetOverrides(overrides: Record<string, Partial<Mission>>): Promise<void> {
  const safeOverrides = overrides && typeof overrides === 'object' ? overrides : {};
  await storage.set('presetOverrides', safeOverrides);
}

/** 커스텀 미션 추가 */
export async function addCustomMission(
  mission: Omit<Mission, 'id' | 'isPreset' | 'sortOrder'>,
): Promise<Mission> {
  const customs = await getCustomMissions();
  const newMission: Mission = {
    ...mission,
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    isPreset: false,
    sortOrder: PRESET_MISSIONS.length + customs.length,
  };
  customs.push(newMission);
  await saveCustomMissions(customs);
  return newMission;
}

/** 커스텀 미션 삭제 */
export async function deleteCustomMission(id: string): Promise<boolean> {
  const customs = await getCustomMissions();
  const filtered = customs.filter((m) => m.id !== id);
  if (filtered.length === customs.length) return false;
  await saveCustomMissions(filtered);
  return true;
}

/** 전체 미션 목록 (프리셋 + 커스텀, 활성만) — 홈화면용 */
export async function getAllMissions(): Promise<Mission[]> {
  try {
    const [customs, overrides] = await Promise.all([
      getCustomMissions(),
      getPresetOverrides(),
    ]);
    // 프리셋에 오버라이드 적용
    const presets = PRESET_MISSIONS.map((m) => {
      const override = overrides[m.id];
      return override ? { ...m, ...override, id: m.id, isPreset: true } : m;
    });
    const all = [...presets, ...customs];
    // sortOrder로 정렬 후 활성만 반환
    return all
      .filter((m) => m?.isActive)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  } catch (e) {
    console.error('[HabitFairy] getAllMissions 실패:', e);
    return PRESET_MISSIONS.filter((m) => m?.isActive);
  }
}

/** 전체 미션 목록 (프리셋 + 커스텀, 비활성 포함) — 관리화면용 */
export async function getAllMissionsIncludingInactive(): Promise<Mission[]> {
  try {
    const [customs, overrides] = await Promise.all([
      getCustomMissions(),
      getPresetOverrides(),
    ]);
    // 프리셋에 오버라이드 적용
    const presets = PRESET_MISSIONS.map((m) => {
      const override = overrides[m.id];
      return override ? { ...m, ...override, id: m.id, isPreset: true } : m;
    });
    const all = [...presets, ...customs];
    return all.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  } catch (e) {
    console.error('[HabitFairy] getAllMissionsIncludingInactive 실패:', e);
    return [...PRESET_MISSIONS];
  }
}

/** ID로 미션 찾기 — id가 falsy이면 undefined 반환 */
export function getMissionById(id: string | undefined | null, customMissions: Mission[] = []): Mission | undefined {
  if (!id) return undefined;
  const safeCustoms = Array.isArray(customMissions) ? customMissions : [];
  // 프리셋에서 먼저 검색, 없으면 커스텀 미션에서 검색
  return PRESET_MISSIONS.find((m) => m.id === id) ?? safeCustoms.find((m) => m.id === id);
}

/** 카테고리별 미션 그룹핑 — 빈 배열 안전 처리 */
export function groupMissionsByCategory(
  missions: Mission[],
): Record<MissionCategory, Mission[]> {
  const groups: Record<MissionCategory, Mission[]> = {
    morning: [],
    daytime: [],
    evening: [],
    study: [],
    health: [],
  };
  const safeMissions = Array.isArray(missions) ? missions : [];
  for (const m of safeMissions) {
    if (m?.category && groups[m.category]) {
      groups[m.category].push(m);
    }
  }
  return groups;
}
