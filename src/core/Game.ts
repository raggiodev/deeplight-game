import Phaser from 'phaser';
import { GameConfig, SceneKeys } from '@/config';
import { BootScene } from '@scenes/BootScene';
import { MainMenuScene } from '@scenes/MainMenuScene';
import { GameScene } from '@scenes/GameScene';
import { UIScene } from '@scenes/UIScene';
import { Logger } from './Logger';

/**
 * Main game class - bootstraps Phaser and manages game lifecycle
 */
export class Game extends Phaser.Game {
  private logger: Logger;

  constructor() {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: GameConfig.GAME_WIDTH,
      height: GameConfig.GAME_HEIGHT,
      parent: 'game-container',
      backgroundColor: '#000000',
      scale: {
        mode: GameConfig.SCALE_MODE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: GameConfig.GRAVITY, x: 0 },
          debug: GameConfig.DEBUG.SHOW_PHYSICS,
        },
      },
      render: {
        pixelArt: GameConfig.PIXEL_ART,
        antialias: !GameConfig.PIXEL_ART,
      },
      input: {
        gamepad: true,
      },
      scene: [BootScene, MainMenuScene, GameScene, UIScene],
    };

    super(config);

    this.logger = Logger.getInstance();
    this.logger.info('Game instance created');

    // Setup global error handler
    this.events.on('error', this.handleError, this);
  }

  private handleError(error: Error): void {
    this.logger.error('Game error:', error);
  }
}
