import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Player } from '@entities/Player';
import { InputManager } from '@core/InputManager';

// Mock Phaser Scene and InputManager
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

describe('Player', () => {
  let player: Player;
  let mockScene: any;
  let mockInputManager: any;

  beforeEach(() => {
    mockScene = createMockScene();
    mockInputManager = {
      update: vi.fn(),
      getHorizontalAxis: vi.fn(() => 0),
      justPressed: vi.fn(() => false),
      justReleased: vi.fn(() => false),
      isPressed: vi.fn(() => false),
    } as any;

    player = new Player(mockScene, 100, 100, mockInputManager);
  });

  describe('initialization', () => {
    it('should create player at specified position', () => {
      const pos = player.getPosition();
      expect(pos.x).toBe(100);
      expect(pos.y).toBe(100);
    });

    it('should have physics body', () => {
      const body = player.getPhysicsBody();
      expect(body).toBeDefined();
      expect(body.position.x).toBe(100);
      expect(body.position.y).toBe(100);
    });
  });

  describe('update', () => {
    it('should update without errors', () => {
      expect(() => player.update(0, 16.67)).not.toThrow();
    });

    it('should call input manager update', () => {
      player.update(0, 16.67);
      expect(mockInputManager.update).toHaveBeenCalled();
    });
  });

  describe('position management', () => {
    it('should set position correctly', () => {
      player.setPosition(200, 300);
      const pos = player.getPosition();
      expect(pos.x).toBe(200);
      expect(pos.y).toBe(300);
    });
  });

  describe('landing', () => {
    it('should handle landing event', () => {
      expect(() => player.onLand()).not.toThrow();
    });
  });
});
