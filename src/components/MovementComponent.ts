import type { MovementParams } from '../types/physics.types';
import { GameConfig } from '@/config';
import { applyFriction } from '@utils/math.utils';

/**
 * Movement component - handles acceleration-based movement
 */
export class MovementComponent {
  public velocity: { x: number; y: number };
  public acceleration: number;
  public maxSpeed: number;
  public friction: number;
  public grounded: boolean;
  public coyoteTimeRemaining: number;

  constructor(params?: Partial<MovementParams>) {
    this.velocity = { x: 0, y: 0 };
    this.acceleration = params?.acceleration ?? GameConfig.PLAYER.ACCELERATION;
    this.maxSpeed = params?.maxSpeed ?? GameConfig.PLAYER.MAX_SPEED;
    this.friction = params?.friction ?? GameConfig.PLAYER.FRICTION;
    this.grounded = false;
    this.coyoteTimeRemaining = 0;
  }

  /**
   * Apply horizontal movement
   */
  move(direction: number, delta: number): void {
    const deltaSeconds = delta / 1000;

    if (direction !== 0) {
      // Apply acceleration
      this.velocity.x += direction * this.acceleration * deltaSeconds;

      // Clamp to max speed
      if (Math.abs(this.velocity.x) > this.maxSpeed) {
        this.velocity.x = Math.sign(this.velocity.x) * this.maxSpeed;
      }
    } else {
      // Apply friction when not moving
      this.velocity.x = applyFriction(this.velocity.x, this.friction, deltaSeconds);
    }
  }

  /**
   * Apply jump velocity
   */
  jump(jumpVelocity: number): void {
    this.velocity.y = jumpVelocity;
    this.grounded = false;
    this.coyoteTimeRemaining = 0;
  }

  /**
   * Update coyote time
   */
  updateCoyoteTime(delta: number): void {
    if (!this.grounded && this.coyoteTimeRemaining > 0) {
      this.coyoteTimeRemaining -= delta;
    }
  }

  /**
   * Set grounded state
   */
  setGrounded(grounded: boolean): void {
    if (this.grounded && !grounded) {
      // Just left ground - start coyote time
      this.coyoteTimeRemaining = GameConfig.PLAYER.COYOTE_TIME_MS;
    }
    this.grounded = grounded;
  }

  /**
   * Check if can jump (grounded or within coyote time)
   */
  canJump(): boolean {
    return this.grounded || this.coyoteTimeRemaining > 0;
  }
}
