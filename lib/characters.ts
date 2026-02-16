// ============================================
// 캐릭터 데이터 및 설정
// 남아용 5종 + 여아용 5종 + 기본 요정
// ============================================

export interface CharacterData {
  id: string;
  name: string;
  nameKo: string;
  category: 'default' | 'boy' | 'girl';
  emoji: string;
  asset: any;
  description: string;
  // 캐릭터별 테마
  theme: {
    primary: string;      // 메인 컬러
    secondary: string;    // 보조 컬러
    gradient: string[];   // 그라데이션 컬러
    effectEmoji: string;  // 이펙트용 이모지
  };
}

export const CHARACTERS: CharacterData[] = [
  // 남아용 캐릭터
  {
    id: 'dino',
    name: 'Dino',
    nameKo: '다이노',
    category: 'boy',
    emoji: '🦕',
    asset: require('@/assets/characters/dino.png'),
    description: '씩씩한 아기 공룡',
    theme: {
      primary: '#22C55E',
      secondary: '#A78BFA',
      gradient: ['#DCFCE7', '#E9D5FF'],
      effectEmoji: '🌿',
    },
  },
  {
    id: 'turbo',
    name: 'Turbo',
    nameKo: '터보',
    category: 'boy',
    emoji: '🏎️',
    asset: require('@/assets/characters/turbo.png'),
    description: '번개처럼 빠른 슈퍼카',
    theme: {
      primary: '#EF4444',
      secondary: '#FBBF24',
      gradient: ['#FEE2E2', '#FEF3C7'],
      effectEmoji: '🔥',
    },
  },
  {
    id: 'kick',
    name: 'Kick',
    nameKo: '킥',
    category: 'boy',
    emoji: '⚽',
    asset: require('@/assets/characters/kick.png'),
    description: '축구왕을 꿈꾸는 친구',
    theme: {
      primary: '#1F2937',
      secondary: '#FBBF24',
      gradient: ['#F3F4F6', '#FEF3C7'],
      effectEmoji: '⭐',
    },
  },
  {
    id: 'cosmo',
    name: 'Cosmo',
    nameKo: '코스모',
    category: 'boy',
    emoji: '🚀',
    asset: require('@/assets/characters/cosmo.png'),
    description: '우주를 탐험하는 꼬마 우주인',
    theme: {
      primary: '#F97316',
      secondary: '#3B82F6',
      gradient: ['#FFEDD5', '#DBEAFE'],
      effectEmoji: '⭐',
    },
  },
  {
    id: 'bolt',
    name: 'Bolt',
    nameKo: '볼트',
    category: 'boy',
    emoji: '🤖',
    asset: require('@/assets/characters/bolt.png'),
    description: '똑똑한 미니 로봇 친구',
    theme: {
      primary: '#06B6D4',
      secondary: '#8B5CF6',
      gradient: ['#CFFAFE', '#EDE9FE'],
      effectEmoji: '⚡',
    },
  },
  // 여아용 캐릭터
  {
    id: 'princess',
    name: 'Princess',
    nameKo: '프린세스',
    category: 'girl',
    emoji: '👸',
    asset: require('@/assets/characters/princess.png'),
    description: '마법 지팡이를 든 공주님',
    theme: {
      primary: '#EC4899',
      secondary: '#FBBF24',
      gradient: ['#FCE7F3', '#FEF3C7'],
      effectEmoji: '👑',
    },
  },
  {
    id: 'uni',
    name: 'Uni',
    nameKo: '유니',
    category: 'girl',
    emoji: '🦄',
    asset: require('@/assets/characters/uni.png'),
    description: '무지개빛 아기 유니콘',
    theme: {
      primary: '#F472B6',
      secondary: '#A78BFA',
      gradient: ['#FDF2F8', '#EDE9FE'],
      effectEmoji: '🌈',
    },
  },
  {
    id: 'bunny',
    name: 'Bunny',
    nameKo: '버니',
    category: 'girl',
    emoji: '🐰',
    asset: require('@/assets/characters/bunny.png'),
    description: '꽃을 좋아하는 토끼',
    theme: {
      primary: '#FB7185',
      secondary: '#FBBF24',
      gradient: ['#FFE4E6', '#FEF9C3'],
      effectEmoji: '🌸',
    },
  },
  {
    id: 'marina',
    name: 'Marina',
    nameKo: '마리나',
    category: 'girl',
    emoji: '🧜‍♀️',
    asset: require('@/assets/characters/marina.png'),
    description: '바다에서 온 인어공주',
    theme: {
      primary: '#14B8A6',
      secondary: '#F472B6',
      gradient: ['#CCFBF1', '#FCE7F3'],
      effectEmoji: '🫧',
    },
  },
  {
    id: 'bella',
    name: 'Bella',
    nameKo: '벨라',
    category: 'girl',
    emoji: '🩰',
    asset: require('@/assets/characters/bella.png'),
    description: '춤추는 발레리나',
    theme: {
      primary: '#F9A8D4',
      secondary: '#FFFFFF',
      gradient: ['#FDF2F8', '#FFFFFF'],
      effectEmoji: '💫',
    },
  },
];

export const getCharacterById = (id: string): CharacterData | undefined => {
  return CHARACTERS.find(c => c.id === id);
};

export const getCharactersByCategory = (category: 'default' | 'boy' | 'girl'): CharacterData[] => {
  return CHARACTERS.filter(c => c.category === category);
};

export const DEFAULT_CHARACTER_ID = 'dino';
