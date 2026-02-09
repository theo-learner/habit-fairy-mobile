// ============================================
// 요정 3단 진화 시스템 - Factory 패턴
// 캐릭터 타입별 설정 및 에셋 로딩
// ============================================

import type { PetType, PetStage, PetConfig, StageConfig } from '@/types/pet';

/** 
 * 캐릭터별 설정 레지스트리
 * 새 캐릭터 추가 시 여기에 등록하면 됨
 */
const PET_REGISTRY: Record<PetType, PetConfig> = {
  fairy: {
    id: 'fairy',
    displayName: '별이',
    maxStage: 3,
    stages: {
      1: {
        name: 'egg',
        displayName: '신비한 알',
        asset: require('@/assets/fairy_v2.png'),  // TODO: 알 에셋으로 교체
        dialogues: [
          '따뜻하게 해줘...',
          '조금만 더...',
          '뭔가 움직이는 것 같아!',
        ],
        maxExp: 50,
      },
      2: {
        name: 'baby',
        displayName: '아기 별이',
        asset: require('@/assets/fairy_v2.png'),  // TODO: 아기 에셋으로 교체
        dialogues: [
          '안녕! 나는 별이야!',
          '오늘도 화이팅!',
          '미션 완료하면 기뻐요!',
          '같이 놀자!',
        ],
        maxExp: 150,
      },
      3: {
        name: 'adult',
        displayName: '요정 별이',
        asset: require('@/assets/fairy_v2.png'),
        dialogues: [
          '오늘도 멋진 하루야!',
          '넌 정말 대단해!',
          '함께해서 행복해!',
          '최고의 친구야!',
          '무엇이든 할 수 있어!',
        ],
        maxExp: 999999,  // 최종 단계
      },
    },
  },
  dino: {
    id: 'dino',
    displayName: '다이노',
    maxStage: 3,
    stages: {
      1: {
        name: 'egg',
        displayName: '공룡알',
        asset: require('@/assets/fairy_v2.png'),  // TODO: 공룡알 에셋
        dialogues: ['꿈틀꿈틀...', '따뜻해!'],
        maxExp: 50,
      },
      2: {
        name: 'baby',
        displayName: '아기 다이노',
        asset: require('@/assets/fairy_v2.png'),  // TODO: 아기 공룡 에셋
        dialogues: ['크아앙!', '배고파!', '놀자!'],
        maxExp: 150,
      },
      3: {
        name: 'adult',
        displayName: '멋진 다이노',
        asset: require('@/assets/fairy_v2.png'),  // TODO: 성체 공룡 에셋
        dialogues: ['으르렁! 최고야!', '강해졌어!'],
        maxExp: 999999,
      },
    },
  },
  robot: {
    id: 'robot',
    displayName: '로봇',
    maxStage: 3,
    stages: {
      1: {
        name: 'egg',
        displayName: '부품 박스',
        asset: require('@/assets/fairy_v2.png'),  // TODO: 박스 에셋
        dialogues: ['삐빅... 조립 중...', '전원 충전 중...'],
        maxExp: 50,
      },
      2: {
        name: 'baby',
        displayName: '미니 로봇',
        asset: require('@/assets/fairy_v2.png'),  // TODO: 미니 로봇 에셋
        dialogues: ['삐빅! 안녕!', '미션 수행!'],
        maxExp: 150,
      },
      3: {
        name: 'adult',
        displayName: '슈퍼 로봇',
        asset: require('@/assets/fairy_v2.png'),  // TODO: 슈퍼 로봇 에셋
        dialogues: ['미션 완료! 최고 효율!', '함께라면 무적!'],
        maxExp: 999999,
      },
    },
  },
};

/**
 * PetFactory - 캐릭터 설정 조회 유틸리티
 */
export class PetFactory {
  /** 캐릭터 전체 설정 조회 */
  static getConfig(type: PetType): PetConfig {
    return PET_REGISTRY[type];
  }

  /** 특정 단계 설정 조회 */
  static getStageConfig(type: PetType, stage: PetStage): StageConfig {
    return PET_REGISTRY[type].stages[stage];
  }

  /** 현재 단계의 에셋 조회 */
  static getAsset(type: PetType, stage: PetStage): any {
    return PET_REGISTRY[type].stages[stage].asset;
  }

  /** 랜덤 대사 조회 */
  static getRandomDialogue(type: PetType, stage: PetStage): string {
    const dialogues = PET_REGISTRY[type].stages[stage].dialogues;
    return dialogues[Math.floor(Math.random() * dialogues.length)];
  }

  /** 다음 단계 진화 가능 여부 */
  static canEvolve(type: PetType, stage: PetStage, currentExp: number): boolean {
    if (stage >= PET_REGISTRY[type].maxStage) return false;
    const maxExp = PET_REGISTRY[type].stages[stage].maxExp;
    return currentExp >= maxExp;
  }

  /** 지원하는 모든 캐릭터 타입 목록 */
  static getAllTypes(): PetType[] {
    return Object.keys(PET_REGISTRY) as PetType[];
  }
}

export default PetFactory;
