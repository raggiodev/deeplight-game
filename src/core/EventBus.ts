import Phaser from 'phaser';

/**
 * Global event bus for decoupled communication between systems
 * Singleton wrapper around Phaser's EventEmitter
 */
export class EventBus {
  private static instance: EventBus;
  private emitter: Phaser.Events.EventEmitter;

  private constructor() {
    this.emitter = new Phaser.Events.EventEmitter();
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Emit an event with optional data
   */
  emit(event: string, ...args: any[]): void {
    this.emitter.emit(event, ...args);
  }

  /**
   * Listen to an event
   */
  on(event: string, fn: Function, context?: any): void {
    this.emitter.on(event, fn, context);
  }

  /**
   * Listen to an event once
   */
  once(event: string, fn: Function, context?: any): void {
    this.emitter.once(event, fn, context);
  }

  /**
   * Remove event listener
   */
  off(event: string, fn?: Function, context?: any): void {
    this.emitter.off(event, fn, context);
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: string): void {
    this.emitter.removeAllListeners(event);
  }
}
