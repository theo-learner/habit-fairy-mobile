import {
  PRESET_MISSIONS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  getMissionById,
  groupMissionsByCategory,
} from '../lib/missions';
import type { Mission, MissionCategory } from '../types';

describe('missions - PRESET_MISSIONS', () => {
  it('has 10 preset missions', () => {
    expect(PRESET_MISSIONS).toHaveLength(10);
  });

  it('all presets have required fields', () => {
    for (const m of PRESET_MISSIONS) {
      expect(m.id).toBeTruthy();
      expect(m.name).toBeTruthy();
      expect(m.icon).toBeTruthy();
      expect(m.category).toBeTruthy();
      expect(m.isPreset).toBe(true);
      expect(m.isActive).toBe(true);
      expect(typeof m.starReward).toBe('number');
      expect(typeof m.timerSeconds).toBe('number');
    }
  });

  it('all presets have unique ids', () => {
    const ids = PRESET_MISSIONS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all presets have unique sortOrder', () => {
    const orders = PRESET_MISSIONS.map((m) => m.sortOrder);
    expect(new Set(orders).size).toBe(orders.length);
  });
});

describe('missions - getMissionById', () => {
  it('finds a preset mission by id', () => {
    const m = getMissionById('mission-brush-teeth');
    expect(m).toBeDefined();
    expect(m!.name).toBe('양치하기');
  });

  it('returns undefined for unknown id', () => {
    expect(getMissionById('nonexistent')).toBeUndefined();
  });

  it('returns undefined for null/undefined id', () => {
    expect(getMissionById(null)).toBeUndefined();
    expect(getMissionById(undefined)).toBeUndefined();
  });

  it('finds custom mission from second param', () => {
    const custom: Mission = {
      id: 'custom-test',
      name: 'Test',
      description: 'desc',
      icon: '🎯',
      category: 'morning',
      timerSeconds: 0,
      starReward: 1,
      fairyMessageStart: '',
      fairyMessageComplete: '',
      isPreset: false,
      isActive: true,
      sortOrder: 99,
    };
    const found = getMissionById('custom-test', [custom]);
    expect(found).toBeDefined();
    expect(found!.name).toBe('Test');
  });
});

describe('missions - groupMissionsByCategory', () => {
  it('groups preset missions correctly', () => {
    const groups = groupMissionsByCategory(PRESET_MISSIONS);
    expect(groups.morning.length).toBeGreaterThan(0);
    expect(groups.daytime.length).toBeGreaterThan(0);
    expect(groups.evening.length).toBeGreaterThan(0);
  });

  it('handles empty array', () => {
    const groups = groupMissionsByCategory([]);
    for (const cat of CATEGORY_ORDER) {
      expect(groups[cat]).toEqual([]);
    }
  });

  it('handles invalid input gracefully', () => {
    // @ts-expect-error testing null safety
    const groups = groupMissionsByCategory(null);
    expect(groups.morning).toEqual([]);
  });
});

describe('missions - CATEGORY constants', () => {
  it('CATEGORY_LABELS covers all categories', () => {
    for (const cat of CATEGORY_ORDER) {
      expect(CATEGORY_LABELS[cat]).toBeTruthy();
    }
  });

  it('CATEGORY_ORDER has 5 categories', () => {
    expect(CATEGORY_ORDER).toHaveLength(5);
  });
});
