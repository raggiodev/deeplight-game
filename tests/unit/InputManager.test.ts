import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InputManager } from '@core/InputManager';
import { InputActions } from '@/config';

// Mock Phaser Scene
const createMockScene = () => ({
  input: {
    keyboard: {
      addKey: vi.fn((keyCode) => ({
        isDown: false,
        keyCode,
      })),
    },
    gamepad: null,
  },
});

describe('InputManager', () => {
  let inputManager: InputManager;
  let mockScene: any;

  beforeEach(() => {
    mockScene = createMockScene();
    inputManager = new InputManager(mockScene);
  });

  describe('initialization', () => {
    it('should create input manager with default bindings', () => {
      expect(inputManager).toBeDefined();
    });

    it('should initialize all action states', () => {
      expect(inputManager.isPressed(InputActions.JUMP)).toBe(false);
      expect(inputManager.isPressed(InputActions.MOVE_LEFT)).toBe(false);
      expect(inputManager.isPressed(InputActions.MOVE_RIGHT)).toBe(false);
    });
  });

  describe('input state tracking', () => {
    it('should track justPressed state', () => {
      // Simulate key press
      const time = Date.now();
      inputManager.update(time);

      expect(inputManager.justPressed(InputActions.JUMP)).toBe(false);
    });

    it('should track justReleased state', () => {
      const time = Date.now();
      inputManager.update(time);

      expect(inputManager.justReleased(InputActions.JUMP)).toBe(false);
    });
  });

  describe('getHorizontalAxis', () => {
    it('should return 0 when no input', () => {
      expect(inputManager.getHorizontalAxis()).toBe(0);
    });

    it('should handle cleanup', () => {
      expect(() => inputManager.destroy()).not.toThrow();
    });
  });
});
