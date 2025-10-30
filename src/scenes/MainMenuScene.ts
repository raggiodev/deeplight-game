import Phaser from 'phaser';
import { SceneKeys } from '@/config';
import { Logger } from '@core/Logger';

/**
 * Main menu scene
 */
export class MainMenuScene extends Phaser.Scene {
  private logger: Logger;

  constructor() {
    super({ key: SceneKeys.MAIN_MENU });
    this.logger = Logger.getInstance();
  }

  create(): void {
    this.logger.info('MainMenuScene: Creating main menu...');

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Title
    const title = this.add.text(width / 2, height / 3, 'DeepLight', {
      fontSize: '64px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(width / 2, height / 3 + 70, '2D Metroidvania Game', {
      fontSize: '24px',
      color: '#cccccc',
    });
    subtitle.setOrigin(0.5);

    // Start button
    const startButton = this.add.text(width / 2, height / 2 + 50, 'START GAME', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 },
    });
    startButton.setOrigin(0.5);
    startButton.setInteractive({ useHandCursor: true });

    // Button hover effects
    startButton.on('pointerover', () => {
      startButton.setStyle({ backgroundColor: '#555555' });
    });

    startButton.on('pointerout', () => {
      startButton.setStyle({ backgroundColor: '#333333' });
    });

    startButton.on('pointerdown', () => {
      this.startGame();
    });

    // Instructions
    const instructions = this.add.text(
      width / 2,
      height - 100,
      'Controls: WASD/Arrow Keys to move, Space to jump\nESC to pause',
      {
        fontSize: '16px',
        color: '#888888',
        align: 'center',
      }
    );
    instructions.setOrigin(0.5);

    // Version info
    const version = this.add.text(10, height - 30, 'v0.1.0 - Milestone 1', {
      fontSize: '14px',
      color: '#666666',
    });

    // Keyboard shortcut to start
    this.input.keyboard!.once('keydown-SPACE', () => {
      this.startGame();
    });
  }

  private startGame(): void {
    this.logger.info('MainMenuScene: Starting game...');
    this.scene.start(SceneKeys.GAME);
    this.scene.launch(SceneKeys.UI);
  }
}
