/** 꾸미기 아이템 데이터 */
export const AVATAR_ITEMS = [
  { id: 'hat-ribbon', name: '분홍 리본', emoji: '🎀', cost: 5, category: '모자' },
  { id: 'hat-wizard', name: '마법사 모자', emoji: '🎩', cost: 10, category: '모자' },
  { id: 'hat-crown', name: '왕관', emoji: '👑', cost: 20, category: '모자' },
  { id: 'hat-flower', name: '꽃 머리띠', emoji: '🌸', cost: 15, category: '모자' },
  { id: 'wing-butterfly', name: '나비 날개', emoji: '🦋', cost: 30, category: '날개' },
  { id: 'wing-angel', name: '천사 날개', emoji: '🕊️', cost: 50, category: '날개' },
  { id: 'bg-rainbow', name: '무지개 배경', emoji: '🌈', cost: 25, category: '배경' },
  { id: 'bg-stars', name: '별빛 배경', emoji: '🌌', cost: 40, category: '배경' },
  { id: 'acc-wand', name: '마법 지팡이', emoji: '🪄', cost: 35, category: '소품' },
  { id: 'acc-heart', name: '하트 목걸이', emoji: '💖', cost: 15, category: '소품' },
  { id: 'acc-star', name: '별빛 안경', emoji: '🤩', cost: 20, category: '소품' },
  { id: 'acc-unicorn', name: '유니콘 뿔', emoji: '🦄', cost: 100, category: '소품' },
];

export type AvatarItem = (typeof AVATAR_ITEMS)[0];

export const getItemById = (id: string) => AVATAR_ITEMS.find(i => i.id === id);
