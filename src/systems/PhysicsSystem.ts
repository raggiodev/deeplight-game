import type { PhysicsBody, CollisionResult } from '../types/physics.types';
import type { Bounds } from '../types/game.types';
import { TILE_SIZE, PHYSICS_EPSILON } from '@utils/constants';

/**
 * Custom physics system for precise platformer physics
 * FINAL FIX: Preserve grounded state during horizontal collisions
 */
export class PhysicsSystem {
  /**
   * Check AABB collision between two bounds
   */
  static checkAABBCollision(a: Bounds, b: Bounds): boolean {
    return (
      a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
    );
  }

  /**
   * Resolve collision between body and static bounds
   */
  static resolveCollision(body: PhysicsBody, bounds: Bounds): CollisionResult {
    const bodyBounds = {
      x: body.position.x - body.size.width / 2,
      y: body.position.y - body.size.height / 2,
      width: body.size.width,
      height: body.size.height,
    };

    if (!this.checkAABBCollision(bodyBounds, bounds)) {
      return { collided: false, normal: { x: 0, y: 0 }, overlap: 0, side: null };
    }

    // Calculate overlaps on each side
    const overlapLeft = bodyBounds.x + bodyBounds.width - bounds.x;
    const overlapRight = bounds.x + bounds.width - bodyBounds.x;
    const overlapTop = bodyBounds.y + bodyBounds.height - bounds.y;
    const overlapBottom = bounds.y + bounds.height - bodyBounds.y;

    // Find minimum overlap
    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

    let normal = { x: 0, y: 0 };
    let side: 'top' | 'bottom' | 'left' | 'right' | null = null;

    if (minOverlap === overlapLeft) {
      normal = { x: -1, y: 0 };
      body.position.x -= overlapLeft + PHYSICS_EPSILON;
      body.velocity.x = Math.min(0, body.velocity.x);
      side = 'right';
    } else if (minOverlap === overlapRight) {
      normal = { x: 1, y: 0 };
      body.position.x += overlapRight + PHYSICS_EPSILON;
      body.velocity.x = Math.max(0, body.velocity.x);
      side = 'left';
    } else if (minOverlap === overlapTop) {
      normal = { x: 0, y: -1 };
      body.position.y -= overlapTop + PHYSICS_EPSILON;
      body.velocity.y = 0;
      body.grounded = true;
      side = 'bottom';
    } else if (minOverlap === overlapBottom) {
      normal = { x: 0, y: 1 };
      body.position.y += overlapBottom + PHYSICS_EPSILON;
      body.velocity.y = Math.max(0, body.velocity.y);
      side = 'top';
    }

    return { collided: true, normal, overlap: minOverlap, side };
  }

  /**
   * Check and resolve tilemap collisions
   * FINAL FIX: Only reset grounded if player is moving upward or falling
   */
  static resolveTilemapCollision(
    body: PhysicsBody,
    tilemap: Phaser.Tilemaps.Tilemap,
    layer: Phaser.Tilemaps.TilemapLayer
  ): void {
    // CRITICAL FIX: Only reset grounded if player has upward velocity
    // This prevents losing grounded state when just touching walls
    const wasGrounded = body.grounded;

    if (body.velocity.y < -1) {
      // Player is jumping/moving upward - they should lose grounded
      body.grounded = false;
    }
    // If velocity.y >= -1, keep current grounded state
    // This allows walking along ground while touching walls

    // Get tiles around the body
    const bounds = {
      x: body.position.x - body.size.width / 2,
      y: body.position.y - body.size.height / 2,
      width: body.size.width,
      height: body.size.height,
    };

    const startX = Math.floor(bounds.x / TILE_SIZE) - 1;
    const endX = Math.ceil((bounds.x + bounds.width) / TILE_SIZE) + 1;
    const startY = Math.floor(bounds.y / TILE_SIZE) - 1;
    const endY = Math.ceil((bounds.y + bounds.height) / TILE_SIZE) + 1;

    // Collect all colliding tiles
    const collidingTiles: Phaser.Tilemaps.Tile[] = [];

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const tile = layer.getTileAt(x, y);
        if (tile && tile.collides) {
          collidingTiles.push(tile);
        }
      }
    }

    // Pass 1: Resolve vertical collisions (ground/ceiling)
    let hasVerticalCollision = false;

    for (const tile of collidingTiles) {
      const tileBounds = {
        x: tile.pixelX,
        y: tile.pixelY,
        width: TILE_SIZE,
        height: TILE_SIZE,
      };

      const bodyBounds = {
        x: body.position.x - body.size.width / 2,
        y: body.position.y - body.size.height / 2,
        width: body.size.width,
        height: body.size.height,
      };

      if (this.checkAABBCollision(bodyBounds, tileBounds)) {
        const overlapTop = bodyBounds.y + bodyBounds.height - tileBounds.y;
        const overlapBottom = tileBounds.y + tileBounds.height - bodyBounds.y;

        // Check if this is primarily a vertical collision
        const overlapLeft = bodyBounds.x + bodyBounds.width - tileBounds.x;
        const overlapRight = tileBounds.x + tileBounds.width - bodyBounds.x;
        const minHorizontal = Math.min(overlapLeft, overlapRight);
        const minVertical = Math.min(overlapTop, overlapBottom);

        // Only resolve vertical if it's the primary collision direction
        if (minVertical < minHorizontal) {
          hasVerticalCollision = true;

          if (overlapTop < overlapBottom && overlapTop > 0) {
            // Landing on platform
            body.position.y -= overlapTop + PHYSICS_EPSILON;
            body.velocity.y = 0;
            body.grounded = true;
          } else if (overlapBottom < overlapTop && overlapBottom > 0) {
            // Hit ceiling
            body.position.y += overlapBottom + PHYSICS_EPSILON;
            body.velocity.y = Math.max(0, body.velocity.y);
            body.grounded = false; // Definitely not grounded if hitting ceiling
          }
        }
      }
    }

    // CRITICAL FIX: If no vertical collision found and was grounded,
    // check if player is still near ground (small tolerance)
    if (!hasVerticalCollision && wasGrounded && body.velocity.y >= -1) {
      // Player might be walking on perfectly flat ground
      // Do a small ground check (2 pixels down)
      const groundCheckBounds = {
        x: body.position.x - body.size.width / 2,
        y: body.position.y - body.size.height / 2,
        width: body.size.width,
        height: body.size.height + 2, // Extra 2 pixels for ground detection
      };

      for (const tile of collidingTiles) {
        const tileBounds = {
          x: tile.pixelX,
          y: tile.pixelY,
          width: TILE_SIZE,
          height: TILE_SIZE,
        };

        if (this.checkAABBCollision(groundCheckBounds, tileBounds)) {
          const tileTop = tileBounds.y;
          const bodyBottom = body.position.y + body.size.height / 2;

          // If player's bottom is very close to tile top, keep grounded
          if (Math.abs(bodyBottom - tileTop) < 2) {
            body.grounded = true;
            body.velocity.y = 0;
            body.position.y = tileTop - body.size.height / 2;
            break;
          }
        }
      }
    }

    // Pass 2: Resolve horizontal collisions (walls)
    for (const tile of collidingTiles) {
      const tileBounds = {
        x: tile.pixelX,
        y: tile.pixelY,
        width: TILE_SIZE,
        height: TILE_SIZE,
      };

      const bodyBounds = {
        x: body.position.x - body.size.width / 2,
        y: body.position.y - body.size.height / 2,
        width: body.size.width,
        height: body.size.height,
      };

      if (this.checkAABBCollision(bodyBounds, tileBounds)) {
        const overlapLeft = bodyBounds.x + bodyBounds.width - tileBounds.x;
        const overlapRight = tileBounds.x + tileBounds.width - bodyBounds.x;
        const overlapTop = bodyBounds.y + bodyBounds.height - tileBounds.y;
        const overlapBottom = tileBounds.y + tileBounds.height - bodyBounds.y;

        const minHorizontal = Math.min(overlapLeft, overlapRight);
        const minVertical = Math.min(overlapTop, overlapBottom);

        // Only resolve horizontal if it's the primary collision direction
        if (minHorizontal < minVertical) {
          if (overlapLeft < overlapRight && overlapLeft > 0) {
            // Hit right wall
            body.position.x -= overlapLeft + PHYSICS_EPSILON;
            body.velocity.x = Math.min(0, body.velocity.x);
          } else if (overlapRight < overlapLeft && overlapRight > 0) {
            // Hit left wall
            body.position.x += overlapRight + PHYSICS_EPSILON;
            body.velocity.x = Math.max(0, body.velocity.x);
          }
          // CRITICAL: Do NOT reset grounded here!
          // Horizontal collisions should not affect grounded state
        }
      }
    }
  }
}
