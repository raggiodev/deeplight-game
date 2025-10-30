import Phaser from 'phaser';
import { SceneKeys, GameConfig } from '@/config';
import { Logger } from '@core/Logger';
import { InputManager } from '@core/InputManager';
import { CameraSystem } from '@systems/CameraSystem';
import { PhysicsSystem } from '@systems/PhysicsSystem';
import { Player } from '@entities/Player';
import { UIScene } from './UIScene';
import { TILE_SIZE } from '@utils/constants';

/**
 * Main game scene where gameplay happens
 */
export class GameScene extends Phaser.Scene {
  private logger: Logger;
  private inputManager!: InputManager;
  private cameraSystem!: CameraSystem;
  private player!: Player;
  private map!: Phaser.Tilemaps.Tilemap;
  private groundLayer!: Phaser.Tilemaps.TilemapLayer;
  private uiScene!: UIScene;

  constructor() {
    super({ key: SceneKeys.GAME });
    this.logger = Logger.getInstance();
  }

  create(): void {
    this.logger.info('GameScene: Creating game world...');

    // Initialize input manager
    this.inputManager = new InputManager(this);

    // Create test level
    this.createTestLevel();

    // Create player
    this.player = new Player(this, 200, 300, this.inputManager);

    // Setup camera
    this.cameraSystem = new CameraSystem(this.cameras.main);
    this.cameraSystem.setTarget(this.player.sprite);
    this.cameraSystem.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    // Get UI scene reference
    this.uiScene = this.scene.get(SceneKeys.UI) as UIScene;

    this.logger.info('GameScene: Game world created');
  }

  update(time: number, delta: number): void {
    // Update player
    this.player.update(time, delta);

    // Handle collisions
    this.handleCollisions();

    // Update camera
    this.cameraSystem.update();

    // Update UI with player position
    const pos = this.player.getPosition();
    this.uiScene?.updatePlayerPosition(pos.x, pos.y);
  }

  /**
   * Create a test level with platforms
   */
  private createTestLevel(): void {
    // Create tilemap (programmatic for now, will be replaced with Tiled maps later)
    const mapWidth = 40; // tiles
    const mapHeight = 23; // tiles

    this.map = this.make.tilemap({
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
      width: mapWidth,
      height: mapHeight,
    });

    // Add tileset
    const tiles = this.map.addTilesetImage('tile-ground', 'tile-ground');

    if (!tiles) {
      this.logger.error('Failed to load tileset');
      return;
    }

    // Create layer
    this.groundLayer = this.map.createBlankLayer('Ground', tiles)!;

    // Build test level layout
    this.buildTestRoom(mapWidth, mapHeight);

    // Set collision on all tiles
    this.groundLayer.setCollisionByExclusion([-1]);

    // Visual debug
    if (GameConfig.DEBUG.ENABLED && GameConfig.DEBUG.SHOW_PHYSICS) {
      const debugGraphics = this.add.graphics();
      this.groundLayer.renderDebug(debugGraphics, {
        tileColor: null,
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 128),
        faceColor: new Phaser.Display.Color(40, 39, 37, 255),
      });
    }
  }

  /**
   * Build a test room with platforms
   */
  private buildTestRoom(mapWidth: number, mapHeight: number): void {
    // Floor
    for (let x = 0; x < mapWidth; x++) {
      this.groundLayer.putTileAt(0, x, mapHeight - 1);
    }

    // Left wall
    for (let y = 0; y < mapHeight; y++) {
      this.groundLayer.putTileAt(0, 0, y);
    }

    // Right wall
    for (let y = 0; y < mapHeight; y++) {
      this.groundLayer.putTileAt(0, mapWidth - 1, y);
    }

    // Platform 1 - low left
    for (let x = 5; x < 12; x++) {
      this.groundLayer.putTileAt(0, x, mapHeight - 5);
    }

    // Platform 2 - mid right
    for (let x = 20; x < 28; x++) {
      this.groundLayer.putTileAt(0, x, mapHeight - 8);
    }

    // Platform 3 - high left
    for (let x = 8; x < 15; x++) {
      this.groundLayer.putTileAt(0, x, mapHeight - 12);
    }

    // Platform 4 - mid center
    for (let x = 15; x < 20; x++) {
      this.groundLayer.putTileAt(0, x, mapHeight - 10);
    }

    // Platform 5 - small high right
    for (let x = 30; x < 35; x++) {
      this.groundLayer.putTileAt(0, x, mapHeight - 15);
    }

    this.logger.info('Test room built');
  }

  /**
   * Handle player collisions with tilemap
   */
  private handleCollisions(): void {
    const playerBody = this.player.getPhysicsBody();

    // Store grounded state before collision
    const wasGrounded = playerBody.grounded;

    // Resolve tilemap collisions
    PhysicsSystem.resolveTilemapCollision(playerBody, this.map, this.groundLayer);

    // Trigger landing event if just became grounded
    if (!wasGrounded && playerBody.grounded) {
      this.player.onLand();
    }
  }
}
