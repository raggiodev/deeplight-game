import Phaser from 'phaser';
import { GameConfig } from '@/config';
import { lerp } from '@utils/math.utils';

/**
 * Camera system for smooth following and bounds management
 */
export class CameraSystem {
  private camera: Phaser.Cameras.Scene2D.Camera;
  private target: Phaser.GameObjects.GameObject | null;
  private bounds: Phaser.Geom.Rectangle | null;
  private lerpFactor: number;

  constructor(camera: Phaser.Cameras.Scene2D.Camera) {
    this.camera = camera;
    this.target = null;
    this.bounds = null;
    this.lerpFactor = GameConfig.CAMERA.LERP;
  }

  /**
   * Set camera target to follow
   */
  setTarget(target: Phaser.GameObjects.GameObject): void {
    this.target = target;
  }

  /**
   * Set camera bounds
   */
  setBounds(x: number, y: number, width: number, height: number): void {
    this.bounds = new Phaser.Geom.Rectangle(x, y, width, height);
    this.camera.setBounds(x, y, width, height);
  }

  /**
   * Update camera position with smooth following
   */
  update(): void {
    if (!this.target) return;

    const targetX = (this.target as any).x;
    const targetY = (this.target as any).y;

    if (targetX === undefined || targetY === undefined) return;

    // Calculate desired camera position (centered on target)
    const desiredX = targetX - this.camera.width / 2;
    const desiredY = targetY - this.camera.height / 2;

    // Apply lerp for smooth movement
    const newX = lerp(this.camera.scrollX, desiredX, this.lerpFactor);
    const newY = lerp(this.camera.scrollY, desiredY, this.lerpFactor);

    // Set camera scroll position
    this.camera.setScroll(newX, newY);
  }

  /**
   * Shake camera (for impact effects)
   */
  shake(duration: number = 200, intensity: number = 0.005): void {
    this.camera.shake(duration, intensity);
  }

  /**
   * Flash camera (for damage effects)
   */
  flash(duration: number = 200, red: number = 255, green: number = 0, blue: number = 0): void {
    this.camera.flash(duration, red, green, blue);
  }

  /**
   * Fade camera
   */
  fade(duration: number = 500, red: number = 0, green: number = 0, blue: number = 0): void {
    this.camera.fade(duration, red, green, blue);
  }
}
