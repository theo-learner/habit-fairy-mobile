import { PetFactory } from '../utils/petFactory';

// Mock require for assets
jest.mock('@/assets/fairy_v2.png', () => 'fairy_v2_mock', { virtual: true });

describe('PetFactory', () => {
  describe('getConfig', () => {
    it('returns fairy config', () => {
      const config = PetFactory.getConfig('fairy');
      expect(config.id).toBe('fairy');
      expect(config.displayName).toBe('요정');
      expect(config.maxStage).toBe(3);
    });

    it('returns dino config', () => {
      const config = PetFactory.getConfig('dino');
      expect(config.id).toBe('dino');
    });

    it('returns robot config', () => {
      const config = PetFactory.getConfig('robot');
      expect(config.id).toBe('robot');
    });
  });

  describe('getStageConfig', () => {
    it('returns stage 1 config for fairy', () => {
      const stage = PetFactory.getStageConfig('fairy', 1);
      expect(stage.name).toBe('egg');
      expect(stage.displayName).toBe('신비한 알');
      expect(stage.maxExp).toBe(50);
    });

    it('returns stage 3 config', () => {
      const stage = PetFactory.getStageConfig('fairy', 3);
      expect(stage.name).toBe('adult');
    });
  });

  describe('getAsset', () => {
    it('returns an asset for any type/stage', () => {
      const asset = PetFactory.getAsset('fairy', 1);
      expect(asset).toBeDefined();
    });
  });

  describe('getRandomDialogue', () => {
    it('returns a string from the dialogues array', () => {
      const dialogue = PetFactory.getRandomDialogue('fairy', 1);
      expect(typeof dialogue).toBe('string');
      expect(dialogue.length).toBeGreaterThan(0);
    });

    it('returns from correct stage dialogues', () => {
      const stage1Dialogues = ['따뜻하게 해줘...', '조금만 더...', '뭔가 움직이는 것 같아!'];
      const dialogue = PetFactory.getRandomDialogue('fairy', 1);
      expect(stage1Dialogues).toContain(dialogue);
    });
  });

  describe('canEvolve', () => {
    it('returns true when exp meets threshold', () => {
      expect(PetFactory.canEvolve('fairy', 1, 50)).toBe(true);
      expect(PetFactory.canEvolve('fairy', 1, 100)).toBe(true);
    });

    it('returns false when exp is below threshold', () => {
      expect(PetFactory.canEvolve('fairy', 1, 49)).toBe(false);
    });

    it('returns false at max stage', () => {
      expect(PetFactory.canEvolve('fairy', 3, 999999)).toBe(false);
    });
  });

  describe('getAllTypes', () => {
    it('returns all 3 character types', () => {
      const types = PetFactory.getAllTypes();
      expect(types).toHaveLength(3);
      expect(types).toContain('fairy');
      expect(types).toContain('dino');
      expect(types).toContain('robot');
    });
  });
});
