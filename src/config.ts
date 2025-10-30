import Phaser from 'phaser';

/**
 * Game configuration constants
 */
export const GameConfig = {
  // Display settings
  GAME_WIDTH: 1280,
  GAME_HEIGHT: 720,
  SCALE_MODE: Phaser.Scale.FIT,
  PIXEL_ART: true,

  // Physics settings
  GRAVITY: 980,
  MAX_VELOCITY_Y: 800,

  // Player settings
  PLAYER: {
    ACCELERATION: 1000,
    MAX_SPEED: 250,
    FRICTION: 1000,
    JUMP_VELOCITY: -500,
    COYOTE_TIME_MS: 100, // 6 frames at 60fps
    JUMP_BUFFER_MS: 100,
    SIZE: { width: 32, height: 48 },
  },

  // Camera settings
  CAMERA: {
    LERP: 0.1,
    DEADZONE: {
      width: 400,
      height: 300,
    },
  },

  // Debug settings
  DEBUG: {
    ENABLED: import.meta.env.DEV,
    SHOW_FPS: true,
    SHOW_PHYSICS: true,
    SHOW_HITBOXES: true,
  },
} as const;

/**
 * Scene keys for scene management
 * FIXED: Added PAUSE scene key
 */
export const SceneKeys = {
  BOOT: 'BootScene',
  MAIN_MENU: 'MainMenuScene',
  GAME: 'GameScene',
  UI: 'UIScene',
  PAUSE: 'PauseScene',
  DEATH: 'DeathScene',
} as const;

/**
 * Input action keys
 */
export const InputActions = {
  MOVE_LEFT: 'moveLeft',
  MOVE_RIGHT: 'moveRight',
  JUMP: 'jump',
  ATTACK: 'attack',
  DASH: 'dash',
  PAUSE: 'pause',
} as const;

/**
 * Event keys for the event bus
 */
export const Events = {
  PLAYER_JUMP: 'player:jump',
  PLAYER_LAND: 'player:land',
  PLAYER_DAMAGE: 'player:damage',
  PLAYER_DEATH: 'player:death',
  CHECKPOINT_ACTIVATED: 'checkpoint:activated',
} as const;
