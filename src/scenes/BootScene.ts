import Phaser from 'phaser';
import { SceneKeys } from '@/config';
import { Logger } from '@core/Logger';

/**
 * Boot scene - handles initial asset loading and setup
 */
export class BootScene extends Phaser.Scene {
  private logger: Logger;

  constructor() {
    super({ key: SceneKeys.BOOT });
    this.logger = Logger.getInstance();
  }

  preload(): void {
    this.logger.info('BootScene: Loading assets...');

    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '20px',
      color: '#ffffff',
    });
    loadingText.setOrigin(0.5, 0.5);

    const percentText = this.add.text(width / 2, height / 2, '0%', {
      fontSize: '18px',
      color: '#ffffff',
    });
    percentText.setOrigin(0.5, 0.5);

    // Update loading bar
    this.load.on('progress', (value: number) => {
      percentText.setText(`${Math.floor(value * 100)}%`);
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      this.logger.info('BootScene: Assets loaded');
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // Load placeholder assets (will be replaced with real assets later)
    // For now, we'll generate them programmatically in the create method
  }

  create(): void {
    this.logger.info('BootScene: Starting main menu...');

    // Create placeholder textures for development
    this.createPlaceholderTextures();

    // Start main menu scene
    this.scene.start(SceneKeys.MAIN_MENU);
  }

  /**
   * Create placeholder textures for development
   */
  private createPlaceholderTextures(): void {
    // Player placeholder (green rectangle)
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player-idle', 32, 48);
    playerGraphics.destroy();

    // Ground tile placeholder (brown rectangle)
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 32, 32);
    groundGraphics.generateTexture('tile-ground', 32, 32);
    groundGraphics.destroy();

    // Platform tile placeholder (gray rectangle)
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x666666, 1);
    platformGraphics.fillRect(0, 0, 32, 32);
    platformGraphics.generateTexture('tile-platform', 32, 32);
    platformGraphics.destroy();

    this.logger.info('BootScene: Placeholder textures created');
  }
}
