import Phaser from 'phaser';
import { Entity } from './Entity';
import { MovementComponent } from '@components/MovementComponent';
import { PhysicsComponent } from '@components/PhysicsComponent';
import { InputManager } from '@core/InputManager';
import { EventBus } from '@core/EventBus';
import { GameConfig, InputActions, Events } from '@/config';
import { Logger } from '@core/Logger';

/**
 * Player entity - main character controlled by the player
 * FIXED: Reordered update cycle to fix collision detection
 */
export class Player extends Entity {
  private movement: MovementComponent;
  private physics: PhysicsComponent;
  private inputManager: InputManager;
  private eventBus: EventBus;
  private logger: Logger;
  private jumpBufferTime: number;
  private facingRight: boolean;

  constructor(scene: Phaser.Scene, x: number, y: number, inputManager: InputManager) {
    super(scene, x, y, 'player-idle');

    this.inputManager = inputManager;
    this.eventBus = EventBus.getInstance();
    this.logger = Logger.getInstance();

    // Initialize components
    this.movement = new MovementComponent();
    this.physics = new PhysicsComponent(
      x,
      y,
      GameConfig.PLAYER.SIZE.width,
      GameConfig.PLAYER.SIZE.height
    );

    this.jumpBufferTime = 0;
    this.facingRight = true;

    // Set sprite origin to center
    this.sprite.setOrigin(0.5, 0.5);

    this.logger.info('Player created at position:', { x, y });
  }

  update(time: number, delta: number): void {
    // Update input manager
    this.inputManager.update(time);

    // Handle input
    this.handleMovementInput(delta);
    this.handleJumpInput(delta);

    // Update movement component
    this.movement.updateCoyoteTime(delta);

    // Apply physics (gravity)
    this.physics.applyGravity(delta);

    // Update velocity from movement component
    this.physics.velocity.x = this.movement.velocity.x;
    this.physics.velocity.y = this.movement.velocity.y;

    // CRITICAL FIX: Update position BEFORE collision resolution
    // This allows the collision system to correct the position
    this.physics.updatePosition(delta);

    // NOTE: Collision resolution happens in GameScene.handleCollisions()
    // After collision, sprite position is synced in syncSpritePosition()

    // Update sprite facing direction
    if (this.physics.velocity.x > 0 && !this.facingRight) {
      this.facingRight = true;
      this.sprite.setFlipX(false);
    } else if (this.physics.velocity.x < 0 && this.facingRight) {
      this.facingRight = false;
      this.sprite.setFlipX(true);
    }

    // Sync movement grounded state with physics
    this.movement.setGrounded(this.physics.grounded);

    // Update jump buffer
    if (this.jumpBufferTime > 0) {
      this.jumpBufferTime -= delta;
    }
  }

  /**
   * FIXED: New method to sync sprite position after collision resolution
   * This ensures sprite displays at the corrected physics position
   */
  syncSpritePosition(): void {
    this.sprite.setPosition(this.physics.position.x, this.physics.position.y);
  }

  private handleMovementInput(delta: number): void {
    const horizontalAxis = this.inputManager.getHorizontalAxis();
    this.movement.move(horizontalAxis, delta);
  }

  private handleJumpInput(delta: number): void {
    // Jump button pressed
    if (this.inputManager.justPressed(InputActions.JUMP)) {
      this.jumpBufferTime = GameConfig.PLAYER.JUMP_BUFFER_MS;
    }

    // Execute jump if buffer is active and can jump
    if (this.jumpBufferTime > 0 && this.movement.canJump()) {
      this.performJump();
      this.jumpBufferTime = 0;
    }

    // Variable jump height - release jump button early for shorter jump
    if (
      this.inputManager.justReleased(InputActions.JUMP) &&
      this.physics.velocity.y < 0 &&
      !this.physics.grounded
    ) {
      this.physics.velocity.y *= 0.5; // Cut jump velocity in half
      this.movement.velocity.y = this.physics.velocity.y;
    }
  }

  private performJump(): void {
    this.movement.jump(GameConfig.PLAYER.JUMP_VELOCITY);
    this.physics.velocity.y = GameConfig.PLAYER.JUMP_VELOCITY;
    this.eventBus.emit(Events.PLAYER_JUMP);
    this.logger.debug('Player jumped');
  }

  /**
   * Get player position
   */
  getPosition(): { x: number; y: number } {
    return { x: this.physics.position.x, y: this.physics.position.y };
  }

  /**
   * Set player position
   */
  setPosition(x: number, y: number): void {
    this.physics.position.x = x;
    this.physics.position.y = y;
    this.sprite.setPosition(x, y);
  }

  /**
   * Get physics body for collision detection
   */
  getPhysicsBody(): PhysicsComponent {
    return this.physics;
  }

  /**
   * Handle landing on ground
   */
  onLand(): void {
    this.physics.grounded = true;
    this.movement.setGrounded(true);
    this.eventBus.emit(Events.PLAYER_LAND);
  }
}
