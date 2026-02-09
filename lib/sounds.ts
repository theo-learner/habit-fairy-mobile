// ============================================
// 사운드 유틸리티 — expo-av 기반 효과음
// 외부 파일 없이 진동(햅틱) + 간단한 오디오 피드백
// ============================================

import * as Haptics from 'expo-haptics';

/** 버튼 탭 햅틱 — 가벼운 탭 */
export async function playButtonHaptic(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // 햅틱 미지원 디바이스 무시
  }
}

/** 미션 완료 햅틱 — 강한 진동 */
export async function playCompleteHaptic(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // 무시
  }
}

/** 성공 사운드 (Haptic alias) */
export const playSuccessSound = playCompleteHaptic;

/** 별 획득 햅틱 — 중간 탭 */
export async function playStarHaptic(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // 무시
  }
}

/** 타이머 틱 햅틱 — 매우 가벼운 탭 */
export async function playTickHaptic(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // 무시
  }
}

/** 팡파레 햅틱 — 연속 진동 */
export async function playFanfareHaptic(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 200);
    setTimeout(async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 400);
  } catch {
    // 무시
  }
}
