import type { PhysicsBody } from '@types/physics.types';
import { GameConfig } from '@/config';

/**
 * Physics component - handles gravity and physics properties
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
  }

  /**
   * Apply gravity
   */
  applyGravity(delta: number): void {
    const deltaSeconds = delta / 1000;
    this.velocity.y += this.gravity * deltaSeconds;

    // Cap fall speed
    if (this.velocity.y > GameConfig.MAX_VELOCITY_Y) {
      this.velocity.y = GameConfig.MAX_VELOCITY_Y;
    }
  }

  /**
   * Update position based on velocity
   */
  updatePosition(delta: number): void {
    const deltaSeconds = delta / 1000;
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
