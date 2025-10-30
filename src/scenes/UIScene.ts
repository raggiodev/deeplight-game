import Phaser from 'phaser';
import { SceneKeys, GameConfig } from '@/config';
import { Logger } from '@core/Logger';
import { EventBus } from '@core/EventBus';

/**
 * UI overlay scene - persistent HUD display
 */
export class UIScene extends Phaser.Scene {
  private logger: Logger;
  private eventBus: EventBus;
  private fpsText?: Phaser.GameObjects.Text;
  private positionText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SceneKeys.UI });
    this.logger = Logger.getInstance();
    this.eventBus = EventBus.getInstance();
  }

  create(): void {
    this.logger.info('UIScene: Creating UI overlay...');

    const width = this.cameras.main.width;

    // Debug info (only in development)
    if (GameConfig.DEBUG.ENABLED && GameConfig.DEBUG.SHOW_FPS) {
      this.fpsText = this.add.text(10, 10, 'FPS: 0', {
        fontSize: '16px',
        color: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 5, y: 5 },
      });
      this.fpsText.setScrollFactor(0);
      this.fpsText.setDepth(1000);

      this.positionText = this.add.text(10, 35, 'Pos: (0, 0)', {
        fontSize: '16px',
        color: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 5, y: 5 },
      });
      this.positionText.setScrollFactor(0);
      this.positionText.setDepth(1000);
    }

    // Placeholder health display
    const healthText = this.add.text(width - 10, 10, 'Health: ♥♥♥♥♥', {
      fontSize: '20px',
      color: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 },
    });
    healthText.setOrigin(1, 0);
    healthText.setScrollFactor(0);
    healthText.setDepth(1000);
  }

  update(): void {
    if (GameConfig.DEBUG.ENABLED && GameConfig.DEBUG.SHOW_FPS && this.fpsText) {
      this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
    }
  }

  /**
   * Update player position display
   */
  updatePlayerPosition(x: number, y: number): void {
    if (this.positionText) {
      this.positionText.setText(`Pos: (${Math.round(x)}, ${Math.round(y)})`);
    }
  }
}
