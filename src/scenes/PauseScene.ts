import Phaser from 'phaser';
import { SceneKeys, InputActions } from '@/config';
import { Logger } from '@core/Logger';
import { InputManager } from '@core/InputManager';

/**
 * Pause menu scene - overlays the game scene when paused
 */
export class PauseScene extends Phaser.Scene {
  private logger: Logger;
  private inputManager!: InputManager;

  constructor() {
    super({ key: SceneKeys.PAUSE });
    this.logger = Logger.getInstance();
  }

  create(): void {
    this.logger.info('PauseScene: Creating pause menu...');

    // Initialize input manager
    this.inputManager = new InputManager(this);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Semi-transparent overlay
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setOrigin(0, 0);
    overlay.setScrollFactor(0);

    // Pause title
    const title = this.add.text(width / 2, height / 3, 'PAUSED', {
      fontSize: '64px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);
    title.setScrollFactor(0);

    // Instructions
    const instructions = this.add.text(
      width / 2,
      height / 2,
      'Press ESC to resume\nPress M to return to Main Menu',
      {
        fontSize: '24px',
        color: '#cccccc',
        align: 'center',
      }
    );
    instructions.setOrigin(0.5);
    instructions.setScrollFactor(0);

    this.logger.info('PauseScene: Pause menu created');
  }

  update(time: number, delta: number): void {
    this.inputManager.update(time);

    // Resume on pause button
    if (this.inputManager.justPressed(InputActions.PAUSE)) {
      this.resumeGame();
    }

    // Return to main menu on M key
    if (this.input.keyboard?.addKey('M').isDown) {
      this.returnToMainMenu();
    }
  }

  private resumeGame(): void {
    this.logger.info('PauseScene: Resuming game...');
    this.scene.stop(SceneKeys.PAUSE);
    this.scene.resume(SceneKeys.GAME);
  }

  private returnToMainMenu(): void {
    this.logger.info('PauseScene: Returning to main menu...');
    this.scene.stop(SceneKeys.PAUSE);
    this.scene.stop(SceneKeys.GAME);
    this.scene.stop(SceneKeys.UI);
    this.scene.start(SceneKeys.MAIN_MENU);
  }
}
