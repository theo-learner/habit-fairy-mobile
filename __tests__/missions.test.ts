import {
  PRESET_MISSIONS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  getMissionById,
  groupMissionsByCategory,
  getCustomMissions,
  saveCustomMissions,
  addCustomMission,
  deleteCustomMission,
  getAllMissions,
  getAllMissionsIncludingInactive,
  getPresetOverrides,
  savePresetOverrides,
} from '../lib/missions';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

describe('missions - async CRUD', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('getCustomMissions returns empty array by default', async () => {
    const result = await getCustomMissions();
    expect(result).toEqual([]);
  });

  it('saveCustomMissions and getCustomMissions round-trip', async () => {
    const custom: Mission = {
      id: 'custom-1', name: 'Test', description: '', icon: '🎯',
      category: 'morning', timerSeconds: 0, starReward: 1,
      fairyMessageStart: '', fairyMessageComplete: '',
      isPreset: false, isActive: true, sortOrder: 50,
    };
    await saveCustomMissions([custom]);
    const result = await getCustomMissions();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('custom-1');
  });

  it('addCustomMission creates mission with unique id', async () => {
    const m = await addCustomMission({
      name: 'New', description: '', icon: '✨',
      category: 'daytime', timerSeconds: 60, starReward: 2,
      fairyMessageStart: '', fairyMessageComplete: '', isActive: true,
    });
    expect(m.id).toMatch(/^custom-/);
    expect(m.isPreset).toBe(false);
    const all = await getCustomMissions();
    expect(all).toHaveLength(1);
  });

  it('deleteCustomMission removes by id', async () => {
    await addCustomMission({
      name: 'ToDelete', description: '', icon: '🗑',
      category: 'morning', timerSeconds: 0, starReward: 1,
      fairyMessageStart: '', fairyMessageComplete: '', isActive: true,
    });
    const customs = await getCustomMissions();
    const deleted = await deleteCustomMission(customs[0].id);
    expect(deleted).toBe(true);
    expect(await getCustomMissions()).toHaveLength(0);
  });

  it('deleteCustomMission returns false for unknown id', async () => {
    const deleted = await deleteCustomMission('nonexistent');
    expect(deleted).toBe(false);
  });

  it('getPresetOverrides returns empty object by default', async () => {
    const result = await getPresetOverrides();
    expect(result).toEqual({});
  });

  it('savePresetOverrides and getPresetOverrides round-trip', async () => {
    await savePresetOverrides({ 'mission-brush-teeth': { name: 'Custom Name' } });
    const result = await getPresetOverrides();
    expect(result['mission-brush-teeth']?.name).toBe('Custom Name');
  });

  it('getAllMissions returns active presets by default', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();
    const all = await getAllMissions();
    expect(all.length).toBe(PRESET_MISSIONS.filter(m => m.isActive).length);
    spy.mockRestore();
  });

  it('getAllMissions applies overrides', async () => {
    await savePresetOverrides({ 'mission-brush-teeth': { name: 'Override!' } });
    const spy = jest.spyOn(console, 'error').mockImplementation();
    const all = await getAllMissions();
    const brushTeeth = all.find(m => m.id === 'mission-brush-teeth');
    expect(brushTeeth?.name).toBe('Override!');
    spy.mockRestore();
  });

  it('getAllMissionsIncludingInactive returns all', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();
    const all = await getAllMissionsIncludingInactive();
    expect(all.length).toBe(PRESET_MISSIONS.length);
    spy.mockRestore();
  });
});
