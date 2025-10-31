import type { PhysicsBody, CollisionResult } from '../types/physics.types';
import type { Bounds } from '../types/game.types';
import {
  TILE_SIZE,
  PHYSICS_EPSILON,
  GRAVITY,
  MAX_FALL_SPEED,
  MAX_JUMP_SPEED,
} from '@utils/constants';

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
    // Guardar el estado anterior y resetear grounded
    const wasGrounded = body.grounded;
    body.grounded = false;

    // La gravedad ya se aplica en el PhysicsComponent, no la aplicamos aquí

    // Asegurarnos de que la velocidad vertical esté dentro de los límites
    if (body.velocity.y > MAX_FALL_SPEED) {
      body.velocity.y = MAX_FALL_SPEED; // Limitar velocidad de caída (Y+ es abajo)
    } else if (body.velocity.y < MAX_JUMP_SPEED) {
      body.velocity.y = MAX_JUMP_SPEED; // Limitar velocidad de subida (Y- es arriba)
    }

    // Calcular la próxima posición basada en la velocidad
    const nextPosition = {
      x: body.position.x + body.velocity.x * (1 / 60),
      y: body.position.y + body.velocity.y * (1 / 60),
    };

    // Obtener los límites del cuerpo en la próxima posición
    const nextBounds = {
      x: nextPosition.x - body.size.width / 2,
      y: nextPosition.y - body.size.height / 2,
      width: body.size.width,
      height: body.size.height,
    };

    // Calcular el área de búsqueda de tiles
    const tileRange = {
      startX: Math.floor(nextBounds.x / TILE_SIZE) - 1,
      endX: Math.ceil((nextBounds.x + nextBounds.width) / TILE_SIZE) + 1,
      startY: Math.floor(nextBounds.y / TILE_SIZE) - 1,
      endY: Math.ceil((nextBounds.y + nextBounds.height) / TILE_SIZE) + 1,
    };

    // Recolectar tiles colisionables
    const tiles: Phaser.Tilemaps.Tile[] = [];
    for (let y = tileRange.startY; y <= tileRange.endY; y++) {
      for (let x = tileRange.startX; x <= tileRange.endX; x++) {
        const tile = layer.getTileAt(x, y);
        if (tile && tile.collides) {
          tiles.push(tile);
        }
      }
    }

    // Resolver colisiones verticales primero
    let verticalCollision = false;
    for (const tile of tiles) {
      const tileBounds = {
        x: tile.pixelX,
        y: tile.pixelY,
        width: TILE_SIZE,
        height: TILE_SIZE,
      };

      if (this.checkAABBCollision(nextBounds, tileBounds)) {
        const overlapTop = nextBounds.y + nextBounds.height - tileBounds.y;
        const overlapBottom = tileBounds.y + tileBounds.height - nextBounds.y;

        // Detección de colisión vertical basada en la velocidad y el solapamiento
        if (body.velocity.y > 0 && overlapTop > 0 && overlapTop < overlapBottom) {
          // Colisión con el suelo (cuando velocidad.y > 0 estamos cayendo)
          nextPosition.y = tileBounds.y - body.size.height / 2;
          body.velocity.y = 0;
          body.grounded = true;
          verticalCollision = true;
        } else if (body.velocity.y < 0 && overlapBottom > 0 && overlapBottom < overlapTop) {
          // Colisión con el techo (cuando velocidad.y < 0 estamos subiendo)
          nextPosition.y = tileBounds.y + TILE_SIZE + body.size.height / 2;
          body.velocity.y = 50; // Dar un pequeño impulso hacia abajo al golpear el techo
          verticalCollision = true;
        }
      }
    }

    // Si no hubo colisión vertical pero estábamos en el suelo, hacer un ground check
    if (!verticalCollision && wasGrounded) {
      const groundCheckBounds = {
        ...nextBounds,
        height: nextBounds.height + 4, // Extender 4 píxeles hacia abajo
      };

      for (const tile of tiles) {
        const tileBounds = {
          x: tile.pixelX,
          y: tile.pixelY,
          width: TILE_SIZE,
          height: TILE_SIZE,
        };

        if (this.checkAABBCollision(groundCheckBounds, tileBounds)) {
          const tileTop = tileBounds.y;
          const bodyBottom = nextPosition.y + body.size.height / 2;

          if (Math.abs(bodyBottom - tileTop) <= 4) {
            nextPosition.y = tileTop - body.size.height / 2;
            body.velocity.y = 0;
            body.grounded = true;
            break;
          }
        }
      }
    }

    // Si no estamos en el suelo y no hubo colisión vertical, actualizar Y
    if (!body.grounded && !verticalCollision) {
      body.position.y = nextPosition.y;
    } else {
      body.position.y = nextPosition.y;
    }

    // Resolver colisiones horizontales
    const horizontalTestBounds = {
      x: nextPosition.x - body.size.width / 2,
      y: body.position.y - body.size.height / 2,
      width: body.size.width,
      height: body.size.height,
    };

    let hasHorizontalCollision = false;

    for (const tile of tiles) {
      const tileBounds = {
        x: tile.pixelX,
        y: tile.pixelY,
        width: TILE_SIZE,
        height: TILE_SIZE,
      };

      if (this.checkAABBCollision(horizontalTestBounds, tileBounds)) {
        // Guardar la velocidad Y actual
        const currentVelocityY = body.velocity.y;

        if (body.velocity.x > 0) {
          // Colisión con pared derecha
          nextPosition.x = tileBounds.x - body.size.width / 2;
        } else if (body.velocity.x < 0) {
          // Colisión con pared izquierda
          nextPosition.x = tileBounds.x + TILE_SIZE + body.size.width / 2;
        }

        // Solo resetear velocidad X, mantener velocidad Y
        body.velocity.x = 0;
        body.velocity.y = currentVelocityY;

        hasHorizontalCollision = true;
        break;
      }
    }

    // Si no hubo colisión horizontal, actualizar X
    if (!hasHorizontalCollision) {
      body.position.x = nextPosition.x;
    } else {
      body.position.x = nextPosition.x;
    }
  }
}
