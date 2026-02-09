// ============================================
// 습관요정 (HabitFairy) Mobile — 타입 정의
// ============================================

/** 미션 카테고리 (시간대 + 활동) */
export type MissionCategory = 'morning' | 'daytime' | 'evening' | 'study' | 'health';

/** 미션 정의 */
export interface Mission {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: MissionCategory;
  timerSeconds: number; // 0이면 타이머 없음
  starReward: number; // 1~5
  fairyMessageStart: string; // 요정 시작 메시지
  fairyMessageComplete: string; // 요정 완료 메시지
  isPreset: boolean;
  isActive: boolean;
  sortOrder: number;
}

/** 미션 완료 기록 */
export interface MissionLog {
  id: string;
  childId: string;
  missionId: string;
  completedAt: string; // ISO datetime
  starsEarned: number;
  timerUsed: boolean;
  durationSeconds: number | null;
  fairyResponse: string | null;
}

/** 아이 프로필 */
export interface Child {
  id: string;
  parentId: string;
  name: string;
  birthDate: string | null;
  avatarConfig: Record<string, string>;
  totalStars: number;
  createdAt: string;
}

/** 요정 캐릭터 감정 상태 */
export type FairyEmotion =
  | 'happy'
  | 'excited'
  | 'cheering'
  | 'celebrating'
  | 'sleeping'
  | 'waving';

/** AI 요정 메시지 타입 */
export type FairyMessageType = 'start' | 'encourage' | 'complete' | 'greeting';

/** 주간 통계 */
export interface WeeklyStats {
  date: string; // YYYY-MM-DD
  completedCount: number;
  totalMissions: number;
  starsEarned: number;
}

/** 대시보드 요약 */
export interface DashboardSummary {
  todayCompleted: number;
  todayTotal: number;
  weeklyStats: WeeklyStats[];
  totalStars: number;
  streakDays: number;
}

/** 미션 아이콘 선택지 */
export const MISSION_ICONS = [
  '🪥', '🧼', '🫧', '👕', '👟', '👋', '🍚', '🧸', '📚', '🌙',
  '🎨', '🎵', '🏃', '🧹', '🪴', '🐶', '🎯', '💪', '🧘', '🎮',
  '✏️', '🧩', '🚿', '🍎', '🧤', '🎒', '🛏️', '⏰', '🎪', '🌈',
] as const;
