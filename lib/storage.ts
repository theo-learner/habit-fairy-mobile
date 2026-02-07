// ============================================
// AsyncStorage 유틸리티 — 키 prefix 관리
// ============================================

import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'habit-fairy:';

export const storage = {
  /** 값 읽기 (없으면 fallback 반환) */
  async get<T>(key: string, fallback: T): Promise<T> {
    try {
      const raw = await AsyncStorage.getItem(`${PREFIX}${key}`);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },

  /** 값 저장 */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
    } catch (e) {
      console.error('[HabitFairy] Storage 저장 실패:', e);
    }
  },

  /** 값 삭제 */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${PREFIX}${key}`);
    } catch (e) {
      console.error('[HabitFairy] Storage 삭제 실패:', e);
    }
  },
};
