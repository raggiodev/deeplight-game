import type { PhysicsBody } from '../types/physics.types';
import { GameConfig } from '@/config';
import { MAX_FALL_SPEED, MAX_JUMP_SPEED } from '@utils/constants';

/**
 * Physics component - handles gravity and physics properties
 * FIXED: Added proper velocity limits for new coordinate system
 */
export class PhysicsComponent implements PhysicsBody {
  public velocity: { x: number; y: number };
  public acceleration: { x: number; y: number };
  public position: { x: number; y: number };
  public size: { width: number; height: number };
  public grounded: boolean;
  public onWall: boolean;
  public gravity: number;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    gravity: number = GameConfig.GRAVITY
  ) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.acceleration = { x: 0, y: 0 };
    this.size = { width, height };
    this.grounded = false;
    this.onWall = false;
    this.gravity = gravity;

    // Asegurarnos de que la velocidad inicial sea 0
    this.velocity.y = 0;
  }

  /**
   * Apply gravity and limit velocities
   */
  applyGravity(delta: number): void {
    const deltaSeconds = delta / 1000;

    // Always apply gravity if not grounded
    if (!this.grounded) {
      // Apply gravity (negative accelerates downward)
      this.velocity.y += this.gravity * deltaSeconds;

      // Limit vertical velocity
      if (this.velocity.y < MAX_FALL_SPEED) {
        this.velocity.y = MAX_FALL_SPEED; // Cap falling speed (negative)
      } else if (this.velocity.y > MAX_JUMP_SPEED) {
        this.velocity.y = MAX_JUMP_SPEED; // Cap jump speed (positive)
      }
    } else {
      // When grounded, zero out vertical velocity
      this.velocity.y = 0;
    }
  }

  /**
   * Update position based on velocity
   * FIXED: Always update position, let collision system correct it
   */
  updatePosition(delta: number): void {
    const deltaSeconds = delta / 1000;

    // CRITICAL FIX: Always update both X and Y positions
    // Collision resolution will correct the position if needed
    this.position.x += this.velocity.x * deltaSeconds;
    this.position.y += this.velocity.y * deltaSeconds;
  }

  /**
   * Get bounding box
   */
  getBounds(): { left: number; right: number; top: number; bottom: number } {
    return {
      left: this.position.x - this.size.width / 2,
      right: this.position.x + this.size.width / 2,
      top: this.position.y - this.size.height / 2,
      bottom: this.position.y + this.size.height / 2,
    };
  }
}
