// ============================================
// 요정 3단 진화 시스템 - 상태 관리 (Zustand)
// AsyncStorage persist 연동
// ============================================

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PetType, PetStage, UserPetState } from '@/types/pet';
import { DEFAULT_PET_STATE } from '@/types/pet';
import PetFactory from '@/utils/petFactory';

interface PetStore {
  // State
  pet: UserPetState;
  isLoaded: boolean;

  // Actions
  /** 경험치 획득 */
  gainExp: (amount: number) => void;
  
  /** 진화 실행 (경험치 충족 시) */
  evolve: () => boolean;
  
  /** 아이템 장착 */
  equipItem: (slot: 'head' | 'back' | 'accessory', itemId: string | null) => void;
  
  /** 캐릭터 타입 변경 (리셋) */
  changePetType: (type: PetType) => void;
  
  /** 마지막 상호작용 시간 업데이트 */
  updateLastInteraction: () => void;

  /** 전체 리셋 */
  resetPet: () => void;

  // Computed
  /** 현재 단계의 최대 경험치 */
  getMaxExp: () => number;
  
  /** 경험치 진행률 (0~1) */
  getExpProgress: () => number;
  
  /** 진화 가능 여부 */
  canEvolve: () => boolean;
}

export const usePetStore = create<PetStore>()(
  persist(
    (set, get) => ({
      pet: DEFAULT_PET_STATE,
      isLoaded: false,

      gainExp: (amount) => {
        set((state) => {
          const newExp = state.pet.currentExp + amount;
          return {
            pet: {
              ...state.pet,
              currentExp: newExp,
              lastInteraction: new Date().toISOString(),
            },
          };
        });
      },

      evolve: () => {
        const { pet } = get();
        const canEvolveNow = PetFactory.canEvolve(pet.type, pet.currentStage, pet.currentExp);
        
        if (!canEvolveNow) return false;
        if (pet.currentStage >= 3) return false;

        set((state) => ({
          pet: {
            ...state.pet,
            currentStage: (state.pet.currentStage + 1) as PetStage,
            currentExp: 0,  // 진화 후 경험치 리셋
            lastInteraction: new Date().toISOString(),
          },
        }));
        return true;
      },

      equipItem: (slot, itemId) => {
        set((state) => ({
          pet: {
            ...state.pet,
            equippedItems: {
              ...state.pet.equippedItems,
              [slot]: itemId,
            },
          },
        }));
      },

      changePetType: (type) => {
        set({
          pet: {
            ...DEFAULT_PET_STATE,
            type,
            createdAt: new Date().toISOString(),
            lastInteraction: new Date().toISOString(),
          },
        });
      },

      updateLastInteraction: () => {
        set((state) => ({
          pet: {
            ...state.pet,
            lastInteraction: new Date().toISOString(),
          },
        }));
      },

      resetPet: () => {
        set({
          pet: {
            ...DEFAULT_PET_STATE,
            createdAt: new Date().toISOString(),
            lastInteraction: new Date().toISOString(),
          },
        });
      },

      getMaxExp: () => {
        const { pet } = get();
        return PetFactory.getStageConfig(pet.type, pet.currentStage).maxExp;
      },

      getExpProgress: () => {
        const { pet } = get();
        const maxExp = PetFactory.getStageConfig(pet.type, pet.currentStage).maxExp;
        if (maxExp === 999999) return 1;  // 최종 단계
        return Math.min(pet.currentExp / maxExp, 1);
      },

      canEvolve: () => {
        const { pet } = get();
        return PetFactory.canEvolve(pet.type, pet.currentStage, pet.currentExp);
      },
    }),
    {
      name: 'habit-fairy-pet-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoaded = true;
        }
      },
    }
  )
);

export default usePetStore;
