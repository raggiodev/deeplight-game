import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Player } from '@entities/Player';
import { PhysicsComponent } from '@components/PhysicsComponent';
import { GameConfig } from '@/config';

// Mock Phaser Scene
const createMockScene = () => ({
  add: {
    sprite: vi.fn(() => ({
      setOrigin: vi.fn(),
      setPosition: vi.fn(),
      setFlipX: vi.fn(),
      x: 0,
      y: 0,
      destroy: vi.fn(),
    })),
  },
  input: {
    keyboard: {
      addKey: vi.fn(() => ({ isDown: false })),
    },
  },
});

// Mock InputManager
const createMockInputManager = (overrides = {}) => ({
  update: vi.fn(),
  getHorizontalAxis: vi.fn(() => 0),
  justPressed: vi.fn(() => false),
  justReleased: vi.fn(() => false),
  isPressed: vi.fn(() => false),
  ...overrides,
});

describe('Player Jump Integration Tests', () => {
  let player: Player;
  let mockScene: any;
  let mockInputManager: any;

  beforeEach(() => {
    mockScene = createMockScene();
  });

  describe('Jump from ground', () => {
    it('should jump when grounded and jump pressed', () => {
      // Setup: Player on ground
      mockInputManager = createMockInputManager({
        justPressed: vi.fn((action) => action === 'jump'),
      });

      player = new Player(mockScene, 100, 100, mockInputManager);
      const physicsBody = player.getPhysicsBody();

      // Set grounded manually (simulating collision resolution)
      physicsBody.grounded = true;

      // Get initial Y position
      const initialY = physicsBody.position.y;

      // Update player (should process jump)
      player.update(0, 16.67);

      // Assert: Player should have negative Y velocity (moving up)
      expect(physicsBody.velocity.y).toBe(GameConfig.PLAYER.JUMP_VELOCITY);
      expect(physicsBody.velocity.y).toBeLessThan(0);
    });

    it('should not jump when not grounded', () => {
      mockInputManager = createMockInputManager({
        justPressed: vi.fn((action) => action === 'jump'),
      });

      player = new Player(mockScene, 100, 100, mockInputManager);
      const physicsBody = player.getPhysicsBody();

      // Player in air
      physicsBody.grounded = false;
      physicsBody.velocity.y = 50; // Already falling

      const initialVelocity = physicsBody.velocity.y;

      // Update player
      player.update(0, 16.67);

      // Assert: Velocity should not become negative jump velocity
      expect(physicsBody.velocity.y).not.toBe(GameConfig.PLAYER.JUMP_VELOCITY);
    });
  });

  describe('Coyote time', () => {
    it('should allow jump within coyote time after leaving ground', () => {
      mockInputManager = createMockInputManager();

      player = new Player(mockScene, 100, 100, mockInputManager);
      const physicsBody = player.getPhysicsBody();

      // Frame 1: Player is grounded
      physicsBody.grounded = true;
      player.update(0, 16.67);

      // Frame 2: Player walks off ledge (grounded becomes false)
      physicsBody.grounded = false;
      player.update(16.67, 16.67);

      // Frame 3: Player presses jump within coyote time (100ms)
      mockInputManager.justPressed = vi.fn((action) => action === 'jump');
      player.update(33.34, 16.67);

      // Assert: Should still be able to jump
      expect(physicsBody.velocity.y).toBe(GameConfig.PLAYER.JUMP_VELOCITY);
    });
  });

  describe('Jump buffering', () => {
    it('should execute jump if pressed before landing', () => {
      mockInputManager = createMockInputManager();

      player = new Player(mockScene, 100, 100, mockInputManager);
      const physicsBody = player.getPhysicsBody();

      // Player is falling
      physicsBody.grounded = false;
      physicsBody.velocity.y = 100;

      // Frame 1: Player presses jump while in air
      mockInputManager.justPressed = vi.fn((action) => action === 'jump');
      player.update(0, 16.67);

      // Reset just pressed
      mockInputManager.justPressed = vi.fn(() => false);

      // Frame 2: Player lands (within 100ms buffer)
      physicsBody.grounded = true;
      player.update(16.67, 16.67);

      // Assert: Jump should execute immediately on landing
      expect(physicsBody.velocity.y).toBe(GameConfig.PLAYER.JUMP_VELOCITY);
    });
  });

  describe('Variable jump height', () => {
    it('should cut jump velocity when jump button released early', () => {
      mockInputManager = createMockInputManager({
        justPressed: vi.fn((action) => action === 'jump'),
      });

      player = new Player(mockScene, 100, 100, mockInputManager);
      const physicsBody = player.getPhysicsBody();

      // Player grounded and jumps
      physicsBody.grounded = true;
      player.update(0, 16.67);

      // Player is now in air with upward velocity
      physicsBody.grounded = false;
      const fullJumpVelocity = physicsBody.velocity.y;
      expect(fullJumpVelocity).toBeLessThan(0);

      // Player releases jump button early
      mockInputManager.justPressed = vi.fn(() => false);
      mockInputManager.justReleased = vi.fn((action) => action === 'jump');

      player.update(16.67, 16.67);

      // Assert: Velocity should be cut in half
      expect(physicsBody.velocity.y).toBeCloseTo(fullJumpVelocity * 0.5, 1);
      expect(physicsBody.velocity.y).toBeGreaterThan(fullJumpVelocity); // Closer to 0
    });
  });

  describe('Landing behavior', () => {
    it('should trigger onLand when landing on ground', () => {
      mockInputManager = createMockInputManager();

      player = new Player(mockScene, 100, 100, mockInputManager);
      const physicsBody = player.getPhysicsBody();

      // Spy on onLand
      const onLandSpy = vi.spyOn(player, 'onLand');

      // Player is falling
      physicsBody.grounded = false;
      physicsBody.velocity.y = 100;

      // This would normally be called by GameScene after collision resolution
      // Simulating landing
      player.onLand();

      expect(onLandSpy).toHaveBeenCalled();
      expect(physicsBody.grounded).toBe(true);
    });
  });
});
