import Phaser from 'phaser';
import { InputActions } from '@/config';
import type { InputState, InputBinding, InputConfig } from '../types/input.types';
import { Logger } from './Logger';

/**
 * Unified input manager that abstracts keyboard, gamepad, and touch inputs
 */
export class InputManager {
  private scene: Phaser.Scene;
  private logger: Logger;
  private inputStates: Map<string, InputState>;
  private bindings: InputConfig;
  private keyboard: Map<string, Phaser.Input.Keyboard.Key[]>;
  private gamepad: Phaser.Input.Gamepad.Gamepad | null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.logger = Logger.getInstance();
    this.inputStates = new Map();
    this.keyboard = new Map();
    this.gamepad = null;

    // Default key bindings
    this.bindings = {
      [InputActions.MOVE_LEFT]: {
        keyboard: [
          this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
          this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
        ],
        gamepad: [14], // D-pad left
      },
      [InputActions.MOVE_RIGHT]: {
        keyboard: [
          this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
          this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
        ],
        gamepad: [15], // D-pad right
      },
      [InputActions.JUMP]: {
        keyboard: [
          this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
          this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
          this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
        ],
        gamepad: [0], // A button (Xbox) / X button (PlayStation)
      },
      [InputActions.ATTACK]: {
        keyboard: [
          this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.J),
          this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
        ],
        gamepad: [2], // X button (Xbox) / Square (PlayStation)
      },
      [InputActions.DASH]: {
        keyboard: [
          this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.K),
          this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.X),
        ],
        gamepad: [1], // B button (Xbox) / Circle (PlayStation)
      },
      [InputActions.PAUSE]: {
        keyboard: [this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)],
        gamepad: [9], // Start button
      },
    };

    // Initialize input states
    Object.keys(this.bindings).forEach((action) => {
      this.inputStates.set(action, {
        isPressed: false,
        justPressed: false,
        justReleased: false,
        pressTime: 0,
      });
    });

    // Setup keyboard bindings
    Object.entries(this.bindings).forEach(([action, binding]) => {
      if (binding.keyboard) {
        this.keyboard.set(action, binding.keyboard);
      }
    });

    // Enable gamepad support
    if (this.scene.input.gamepad) {
      this.scene.input.gamepad.once('connected', (pad: Phaser.Input.Gamepad.Gamepad) => {
        this.gamepad = pad;
        this.logger.info('Gamepad connected:', pad.id);
      });
    }

    this.logger.info('InputManager initialized');
  }

  /**
   * Update input states - call this every frame
   */
  update(time: number): void {
    this.inputStates.forEach((state, action) => {
      const wasPressed = state.isPressed;
      const isPressed = this.checkActionPressed(action);

      state.justPressed = !wasPressed && isPressed;
      state.justReleased = wasPressed && !isPressed;
      state.isPressed = isPressed;

      if (state.justPressed) {
        state.pressTime = time;
      }
    });
  }

  /**
   * Check if an action is currently pressed
   */
  isPressed(action: string): boolean {
    return this.inputStates.get(action)?.isPressed ?? false;
  }

  /**
   * Check if an action was just pressed this frame
   */
  justPressed(action: string): boolean {
    return this.inputStates.get(action)?.justPressed ?? false;
  }

  /**
   * Check if an action was just released this frame
   */
  justReleased(action: string): boolean {
    return this.inputStates.get(action)?.justReleased ?? false;
  }

  /**
   * Get how long an action has been held (in milliseconds)
   */
  getPressTime(action: string): number {
    const state = this.inputStates.get(action);
    if (!state || !state.isPressed) return 0;
    return Date.now() - state.pressTime;
  }

  /**
   * Get horizontal axis value (-1 to 1)
   */
  getHorizontalAxis(): number {
    const left = this.isPressed(InputActions.MOVE_LEFT);
    const right = this.isPressed(InputActions.MOVE_RIGHT);

    if (left && !right) return -1;
    if (right && !left) return 1;

    // Check gamepad analog stick
    if (this.gamepad) {
      const axis = this.gamepad.leftStick.x;
      if (Math.abs(axis) > 0.2) {
        // Deadzone
        return axis;
      }
    }

    return 0;
  }

  /**
   * Internal method to check if any bound input is pressed
   */
  private checkActionPressed(action: string): boolean {
    const binding = this.bindings[action];
    if (!binding) return false;

    // Check keyboard
    if (binding.keyboard) {
      const keys = this.keyboard.get(action);
      if (keys && keys.some((key) => key.isDown)) {
        return true;
      }
    }

    // Check gamepad
    if (binding.gamepad && this.gamepad) {
      if (binding.gamepad.some((buttonIndex) => this.gamepad!.buttons[buttonIndex]?.pressed)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Clean up
   */
  destroy(): void {
    this.inputStates.clear();
    this.keyboard.clear();
    this.gamepad = null;
  }
}
