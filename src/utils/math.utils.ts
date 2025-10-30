import type { Vector2 } from '@types/game.types';

/**
 * Math utility functions
 */

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Check if a value is approximately equal to another (within epsilon)
 */
export function approximately(a: number, b: number, epsilon: number = 0.0001): boolean {
  return Math.abs(a - b) < epsilon;
}

/**
 * Calculate distance between two points
 */
export function distance(a: Vector2, b: Vector2): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Normalize a vector
 */
export function normalize(v: Vector2): Vector2 {
  const length = Math.sqrt(v.x * v.x + v.y * v.y);
  if (length === 0) return { x: 0, y: 0 };
  return { x: v.x / length, y: v.y / length };
}

/**
 * Apply friction to a velocity value
 */
export function applyFriction(velocity: number, friction: number, delta: number): number {
  if (velocity === 0) return 0;

  const frictionAmount = friction * delta;
  if (Math.abs(velocity) <= frictionAmount) {
    return 0;
  }

  return velocity > 0 ? velocity - frictionAmount : velocity + frictionAmount;
}

/**
 * Move value towards target at a given rate
 */
export function moveTowards(current: number, target: number, maxDelta: number): number {
  if (Math.abs(target - current) <= maxDelta) {
    return target;
  }
  return current + Math.sign(target - current) * maxDelta;
}
