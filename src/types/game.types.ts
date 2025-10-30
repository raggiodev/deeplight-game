import type Phaser from 'phaser';

/**
 * Base game entity interface
 */
export interface IEntity {
  sprite: Phaser.GameObjects.Sprite;
  update(time: number, delta: number): void;
  destroy(): void;
}

/**
 * Position vector
 */
export interface Vector2 {
  x: number;
  y: number;
}

/**
 * Rectangle bounds
 */
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Game state interface
 */
export interface GameState {
  playerHealth: number;
  playerMaxHealth: number;
  checkpoints: string[];
  unlockedAbilities: string[];
  currentRoom: string;
}

/**
 * Animation config
 */
export interface AnimationConfig {
  key: string;
  frames: number[];
  frameRate: number;
  repeat?: number;
}

/**
 * Scene data passed between scenes
 */
export interface SceneData {
  playerPosition?: Vector2;
  fromRoom?: string;
  [key: string]: any;
}
