import type { PhysicsBody, CollisionResult } from '@types/physics.types';
import type { Bounds } from '@types/game.types';
import { TILE_SIZE, PHYSICS_EPSILON } from '@utils/constants';

/**
 * Custom physics system for precise platformer physics
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
      body.velocity.y = Math.min(0, body.velocity.y);
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
   */
  static resolveTilemapCollision(
    body: PhysicsBody,
    tilemap: Phaser.Tilemaps.Tilemap,
    layer: Phaser.Tilemaps.TilemapLayer
  ): void {
    // Get tiles around the body
    const bounds = {
      x: body.position.x - body.size.width / 2,
      y: body.position.y - body.size.height / 2,
      width: body.size.width,
      height: body.size.height,
    };

    const startX = Math.floor(bounds.x / TILE_SIZE);
    const endX = Math.ceil((bounds.x + bounds.width) / TILE_SIZE);
    const startY = Math.floor(bounds.y / TILE_SIZE);
    const endY = Math.ceil((bounds.y + bounds.height) / TILE_SIZE);

    body.grounded = false;

    // Check each nearby tile
    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const tile = layer.getTileAt(x, y);
        if (tile && tile.collides) {
          const tileBounds = {
            x: tile.pixelX,
            y: tile.pixelY,
            width: TILE_SIZE,
            height: TILE_SIZE,
          };

          this.resolveCollision(body, tileBounds);
        }
      }
    }
  }
}
