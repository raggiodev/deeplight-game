import Phaser from 'phaser';
import type { IEntity } from '@types/game.types';

/**
 * Base entity class that all game entities inherit from
 */
export abstract class Entity implements IEntity {
  public sprite: Phaser.GameObjects.Sprite;
  protected scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    this.scene = scene;
    this.sprite = scene.add.sprite(x, y, texture);
  }

  /**
   * Update entity - called every frame
   */
  abstract update(time: number, delta: number): void;

  /**
   * Get entity position
   */
  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  /**
   * Set entity position
   */
  setPosition(x: number, y: number): void {
    this.sprite.setPosition(x, y);
  }

  /**
   * Clean up entity
   */
  destroy(): void {
    this.sprite.destroy();
  }
}
