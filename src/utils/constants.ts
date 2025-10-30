/**
 * Game constants and magic numbers
 */

export const TILE_SIZE = 32;
export const HALF_TILE = TILE_SIZE / 2;

export const COLLISION_CATEGORY = {
  PLAYER: 0x0001,
  ENEMY: 0x0002,
  GROUND: 0x0004,
  PLATFORM: 0x0008,
  PROJECTILE: 0x0010,
} as const;

export const PHYSICS_EPSILON = 0.001;
export const GRAVITY = 980; // pixels per second squared

export const ANIMATION_FRAME_RATE = {
  IDLE: 8,
  RUN: 12,
  JUMP: 10,
  ATTACK: 15,
} as const;
