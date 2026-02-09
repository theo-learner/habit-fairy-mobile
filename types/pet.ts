// ============================================
// 요정 3단 진화 시스템 - 타입 정의
// 확장성을 고려한 캐릭터 타입 시스템
// ============================================

/** 지원 캐릭터 타입 (확장 가능) */
export type PetType = 'fairy' | 'dino' | 'robot';

/** 진화 단계 */
export type PetStage = 1 | 2 | 3;
export type PetStageName = 'egg' | 'baby' | 'adult';

/** 단계별 설정 */
export interface StageConfig {
  name: PetStageName;
  displayName: string;
  asset: any;  // require() 결과 또는 URI
  dialogues: string[];
  maxExp: number;  // 다음 단계로 진화하기 위한 필요 경험치
}

/** 캐릭터별 정적 설정 (Config) */
export interface PetConfig {
  id: PetType;
  displayName: string;
  maxStage: number;
  stages: Record<PetStage, StageConfig>;
}

/** 사용자별 동적 상태 (State) */
export interface UserPetState {
  type: PetType;
  currentStage: PetStage;
  currentExp: number;
  equippedItems: {
    head?: string;
    back?: string;
    accessory?: string;
  };
  lastInteraction: string;  // ISO timestamp
  createdAt: string;        // 캐릭터 생성 시간
}

/** 초기 상태 */
export const DEFAULT_PET_STATE: UserPetState = {
  type: 'fairy',
  currentStage: 1,
  currentExp: 0,
  equippedItems: {},
  lastInteraction: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};
