import type { Vector2 } from './game.types';

/**
 * Physics body interface
 */
export interface PhysicsBody {
  velocity: Vector2;
  acceleration: Vector2;
  position: Vector2;
  size: { width: number; height: number };
  grounded: boolean;
  onWall: boolean;
}

/**
 * Collision result
 */
export interface CollisionResult {
  collided: boolean;
  normal: Vector2;
  overlap: number;
  side: 'top' | 'bottom' | 'left' | 'right' | null;
}

/**
 * Movement parameters
 */
export interface MovementParams {
  acceleration: number;
  maxSpeed: number;
  friction: number;
  jumpVelocity: number;
}
