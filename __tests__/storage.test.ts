import { storage } from '../lib/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// jest-expo provides AsyncStorage mock automatically

describe('storage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  describe('get', () => {
    it('returns fallback when key does not exist', async () => {
      const result = await storage.get('nonexistent', 'default');
      expect(result).toBe('default');
    });

    it('returns stored value', async () => {
      await AsyncStorage.setItem('habit-fairy:test', JSON.stringify('hello'));
      const result = await storage.get('test', 'default');
      expect(result).toBe('hello');
    });

    it('returns fallback on invalid JSON', async () => {
      await AsyncStorage.setItem('habit-fairy:bad', '{broken');
      const spy = jest.spyOn(console, 'error').mockImplementation();
      const result = await storage.get('bad', 42);
      expect(result).toBe(42);
      spy.mockRestore();
    });

    it('returns objects correctly', async () => {
      const obj = { a: 1, b: [2, 3] };
      await AsyncStorage.setItem('habit-fairy:obj', JSON.stringify(obj));
      const result = await storage.get('obj', {});
      expect(result).toEqual(obj);
    });

    it('returns fallback when stored value is null', async () => {
      await AsyncStorage.setItem('habit-fairy:nullval', JSON.stringify(null));
      const result = await storage.get('nullval', 'fallback');
      expect(result).toBe('fallback');
    });
  });

  describe('set', () => {
    it('stores a value', async () => {
      await storage.set('key1', 'value1');
      const raw = await AsyncStorage.getItem('habit-fairy:key1');
      expect(JSON.parse(raw!)).toBe('value1');
    });

    it('stores objects', async () => {
      await storage.set('obj', { x: 1 });
      const raw = await AsyncStorage.getItem('habit-fairy:obj');
      expect(JSON.parse(raw!)).toEqual({ x: 1 });
    });
  });

  describe('remove', () => {
    it('removes a stored value', async () => {
      await storage.set('toremove', 'data');
      await storage.remove('toremove');
      const raw = await AsyncStorage.getItem('habit-fairy:toremove');
      expect(raw).toBeNull();
    });

    it('does not throw on removing nonexistent key', async () => {
      await expect(storage.remove('ghost')).resolves.not.toThrow();
    });
  });
});
