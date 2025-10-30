import { Game } from '@core/Game';
import { Logger } from '@core/Logger';

const logger = Logger.getInstance();

// Initialize game
logger.info('Initializing DeepLight Game...');

try {
  const game = new Game();
  logger.info('Game initialized successfully');

  // Expose game instance for debugging in development
  if (import.meta.env.DEV) {
    (window as any).game = game;
    logger.info('Game instance exposed to window.game for debugging');
  }
} catch (error) {
  logger.error('Failed to initialize game:', error);
}
