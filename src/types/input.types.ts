/**
 * Input action state
 */
export interface InputState {
  isPressed: boolean;
  justPressed: boolean;
  justReleased: boolean;
  pressTime: number;
}

/**
 * Input device types
 */
export enum InputDevice {
  KEYBOARD = 'keyboard',
  GAMEPAD = 'gamepad',
  TOUCH = 'touch',
}

/**
 * Input configuration for an action
 */
export interface InputBinding {
  keyboard?: Phaser.Input.Keyboard.Key[];
  gamepad?: number[]; // Button indices
  touch?: string; // Touch control ID
}

/**
 * Input manager configuration
 */
export interface InputConfig {
  [actionKey: string]: InputBinding;
}
