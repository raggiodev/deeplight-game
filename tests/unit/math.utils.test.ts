import { describe, it, expect } from 'vitest';
import {
  clamp,
  lerp,
  approximately,
  distance,
  normalize,
  applyFriction,
  moveTowards,
} from '@utils/math.utils';

describe('Math Utils', () => {
  describe('clamp', () => {
    it('should clamp value to min', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it('should clamp value to max', () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('should not clamp value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });
  });

  describe('lerp', () => {
    it('should interpolate between values', () => {
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(0, 100, 0.25)).toBe(25);
    });

    it('should return start at t=0', () => {
      expect(lerp(10, 20, 0)).toBe(10);
    });

    it('should return end at t=1', () => {
      expect(lerp(10, 20, 1)).toBe(20);
    });
  });

  describe('approximately', () => {
    it('should return true for approximately equal values', () => {
      expect(approximately(1.0, 1.00001)).toBe(true);
    });

    it('should return false for different values', () => {
      expect(approximately(1.0, 1.1)).toBe(false);
    });

    it('should respect custom epsilon', () => {
      expect(approximately(1.0, 1.05, 0.1)).toBe(true);
    });
  });

  describe('distance', () => {
    it('should calculate distance between two points', () => {
      const a = { x: 0, y: 0 };
      const b = { x: 3, y: 4 };
      expect(distance(a, b)).toBe(5);
    });

    it('should return 0 for same point', () => {
      const a = { x: 5, y: 5 };
      expect(distance(a, a)).toBe(0);
    });
  });

  describe('normalize', () => {
    it('should normalize a vector', () => {
      const v = { x: 3, y: 4 };
      const normalized = normalize(v);
      expect(normalized.x).toBeCloseTo(0.6);
      expect(normalized.y).toBeCloseTo(0.8);
    });

    it('should handle zero vector', () => {
      const v = { x: 0, y: 0 };
      const normalized = normalize(v);
      expect(normalized.x).toBe(0);
      expect(normalized.y).toBe(0);
    });
  });

  describe('applyFriction', () => {
    it('should reduce velocity', () => {
      const result = applyFriction(100, 50, 1);
      expect(result).toBe(50);
    });

    it('should stop velocity when below friction threshold', () => {
      const result = applyFriction(10, 50, 1);
      expect(result).toBe(0);
    });

    it('should work with negative velocity', () => {
      const result = applyFriction(-100, 50, 1);
      expect(result).toBe(-50);
    });
  });

  describe('moveTowards', () => {
    it('should move towards target', () => {
      expect(moveTowards(0, 10, 3)).toBe(3);
    });

    it('should not overshoot target', () => {
      expect(moveTowards(8, 10, 5)).toBe(10);
    });

    it('should work with negative direction', () => {
      expect(moveTowards(10, 0, 3)).toBe(7);
    });
  });
});
