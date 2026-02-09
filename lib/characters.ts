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
}

export const CHARACTERS: CharacterData[] = [
  // 기본 캐릭터
  {
    id: 'fairy',
    name: 'Fairy',
    nameKo: '별이',
    category: 'default',
    emoji: '🧚',
    asset: require('@/assets/fairy_v2.png'),
    description: '반짝반짝 빛나는 요정 별이',
  },
  // 남아용 캐릭터
  {
    id: 'dino',
    name: 'Dino',
    nameKo: '다이노',
    category: 'boy',
    emoji: '🦕',
    asset: require('@/assets/characters/dino.png'),
    description: '씩씩한 아기 공룡',
  },
  {
    id: 'turbo',
    name: 'Turbo',
    nameKo: '터보',
    category: 'boy',
    emoji: '🏎️',
    asset: require('@/assets/characters/turbo.png'),
    description: '번개처럼 빠른 슈퍼카',
  },
  {
    id: 'kick',
    name: 'Kick',
    nameKo: '킥',
    category: 'boy',
    emoji: '⚽',
    asset: require('@/assets/characters/kick.png'),
    description: '축구왕을 꿈꾸는 친구',
  },
  {
    id: 'cosmo',
    name: 'Cosmo',
    nameKo: '코스모',
    category: 'boy',
    emoji: '🚀',
    asset: require('@/assets/characters/cosmo.png'),
    description: '우주를 탐험하는 꼬마 우주인',
  },
  {
    id: 'bolt',
    name: 'Bolt',
    nameKo: '볼트',
    category: 'boy',
    emoji: '🤖',
    asset: require('@/assets/characters/bolt.png'),
    description: '똑똒한 미니 로봇 친구',
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
  },
  {
    id: 'uni',
    name: 'Uni',
    nameKo: '유니',
    category: 'girl',
    emoji: '🦄',
    asset: require('@/assets/characters/uni.png'),
    description: '무지개빛 아기 유니콘',
  },
  {
    id: 'bunny',
    name: 'Bunny',
    nameKo: '버니',
    category: 'girl',
    emoji: '🐰',
    asset: require('@/assets/characters/bunny.png'),
    description: '꽃을 좋아하는 토끼',
  },
  {
    id: 'marina',
    name: 'Marina',
    nameKo: '마리나',
    category: 'girl',
    emoji: '🧜‍♀️',
    asset: require('@/assets/characters/marina.png'),
    description: '바다에서 온 인어공주',
  },
  {
    id: 'bella',
    name: 'Bella',
    nameKo: '벨라',
    category: 'girl',
    emoji: '🩰',
    asset: require('@/assets/characters/bella.png'),
    description: '춤추는 발레리나',
  },
];

export const getCharacterById = (id: string): CharacterData | undefined => {
  return CHARACTERS.find(c => c.id === id);
};

export const getCharactersByCategory = (category: 'default' | 'boy' | 'girl'): CharacterData[] => {
  return CHARACTERS.filter(c => c.category === category);
};

export const DEFAULT_CHARACTER_ID = 'fairy';
