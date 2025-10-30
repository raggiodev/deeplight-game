import { describe, it, expect, beforeEach } from 'vitest';
import { PhysicsSystem } from '../../src/systems/PhysicsSystem';
import { PhysicsComponent } from '../../src/components/PhysicsComponent';

describe('PhysicsSystem - Collision Resolution', () => {
  describe('AABB Collision Detection', () => {
    it('should detect collision between overlapping bounds', () => {
      const boundsA = { x: 0, y: 0, width: 32, height: 32 };
      const boundsB = { x: 16, y: 16, width: 32, height: 32 };

      const collides = PhysicsSystem.checkAABBCollision(boundsA, boundsB);
      expect(collides).toBe(true);
    });

    it('should not detect collision between separate bounds', () => {
      const boundsA = { x: 0, y: 0, width: 32, height: 32 };
      const boundsB = { x: 64, y: 64, width: 32, height: 32 };

      const collides = PhysicsSystem.checkAABBCollision(boundsA, boundsB);
      expect(collides).toBe(false);
    });
  });

  describe('Collision Resolution', () => {
    let playerBody: PhysicsComponent;

    beforeEach(() => {
      // Create player body at position (100, 100)
      playerBody = new PhysicsComponent(100, 100, 32, 48);
    });

    it('should resolve top collision and set grounded flag', () => {
      // Player falling onto platform
      playerBody.position.y = 200;
      playerBody.velocity.y = 100; // Falling

      // Platform at y=180 (player should land on top)
      const platformBounds = { x: 80, y: 180, width: 64, height: 32 };

      const result = PhysicsSystem.resolveCollision(playerBody, platformBounds);

      expect(result.collided).toBe(true);
      expect(result.side).toBe('bottom'); // Player's bottom hit platform's top
      expect(playerBody.grounded).toBe(true); // CRITICAL: Must be grounded
      expect(playerBody.velocity.y).toBeLessThanOrEqual(0); // Downward velocity stopped
    });

    it('should resolve left collision without setting grounded', () => {
      // Player moving right into wall
      playerBody.position.x = 100;
      playerBody.velocity.x = 50;

      // Wall to the right
      const wallBounds = { x: 116, y: 76, width: 32, height: 64 };

      const result = PhysicsSystem.resolveCollision(playerBody, wallBounds);

      expect(result.collided).toBe(true);
      expect(result.side).toBe('left'); // Player hit wall on left side
      expect(playerBody.grounded).toBe(false); // Wall collision doesn't ground player
      expect(playerBody.velocity.x).toBeLessThanOrEqual(0); // Rightward velocity stopped
    });

    it('should resolve bottom collision (head bonk)', () => {
      // Player jumping into ceiling
      playerBody.position.y = 100;
      playerBody.velocity.y = -100; // Jumping up

      // Ceiling above
      const ceilingBounds = { x: 80, y: 40, width: 64, height: 32 };

      const result = PhysicsSystem.resolveCollision(playerBody, ceilingBounds);

      expect(result.collided).toBe(true);
      expect(result.side).toBe('top'); // Player's top hit ceiling
      expect(playerBody.grounded).toBe(false); // Ceiling doesn't ground player
      expect(playerBody.velocity.y).toBeGreaterThanOrEqual(0); // Upward velocity stopped
    });
  });

  describe('Platform Landing Test', () => {
    it('should allow player to land on platform after falling', () => {
      // Simulate player falling onto platform
      const playerBody = new PhysicsComponent(200, 100, 32, 48);
      playerBody.velocity.y = 200; // Falling fast

      // Simulate several physics frames
      for (let i = 0; i < 10; i++) {
        // Apply gravity (16.67ms per frame at 60fps)
        playerBody.applyGravity(16.67);
        playerBody.updatePosition(16.67);

        // Check collision with platform at y=300
        const platformBounds = { x: 150, y: 300, width: 128, height: 32 };

        PhysicsSystem.resolveCollision(playerBody, platformBounds);

        // Once grounded, should stay grounded
        if (playerBody.grounded) {
          expect(playerBody.position.y).toBeLessThanOrEqual(300 - 48 / 2 + 1); // Within 1px of platform top
          expect(playerBody.velocity.y).toBe(0); // Velocity stopped
          break;
        }
      }

      // Must have grounded within 10 frames
      expect(playerBody.grounded).toBe(true);
    });
  });
});
