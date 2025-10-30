import type { PhysicsBody, CollisionResult } from '../types/physics.types';
import type { Bounds } from '../types/game.types';
import { TILE_SIZE, PHYSICS_EPSILON, GRAVITY } from '@utils/constants';

export class PhysicsSystem {
  static checkAABBCollision(a: Bounds, b: Bounds): boolean {
    return (
      a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
    );
  }

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

    const overlapLeft = bodyBounds.x + bodyBounds.width - bounds.x;
    const overlapRight = bounds.x + bounds.width - bodyBounds.x;
    const overlapTop = bodyBounds.y + bodyBounds.height - bounds.y;
    const overlapBottom = bounds.y + bounds.height - bodyBounds.y;

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

  static resolveTilemapCollision(
    body: PhysicsBody,
    tilemap: Phaser.Tilemaps.Tilemap,
    layer: Phaser.Tilemaps.TilemapLayer
  ): void {
    // 1. Aplicar gravedad y actualizar velocidad
    body.velocity.y += GRAVITY * (1 / 60);

    // 2. Calcular la próxima posición
    const nextX = body.position.x + body.velocity.x * (1 / 60);
    const nextY = body.position.y + body.velocity.y * (1 / 60);

    // 3. Preparar los bounds para las colisiones
    const currentBounds = {
      x: Math.floor(body.position.x - body.size.width / 2),
      y: Math.floor(body.position.y - body.size.height / 2),
      width: Math.ceil(body.size.width),
      height: Math.ceil(body.size.height),
    };

    const nextBounds = {
      x: Math.floor(nextX - body.size.width / 2),
      y: Math.floor(nextY - body.size.height / 2),
      width: Math.ceil(body.size.width),
      height: Math.ceil(body.size.height),
    };

    // 4. Obtener tiles potencialmente colisionables
    const tileRange = {
      startX: Math.floor(Math.min(currentBounds.x, nextBounds.x) / TILE_SIZE) - 1,
      endX:
        Math.ceil(
          Math.max(currentBounds.x + currentBounds.width, nextBounds.x + nextBounds.width) /
            TILE_SIZE
        ) + 1,
      startY: Math.floor(Math.min(currentBounds.y, nextBounds.y) / TILE_SIZE) - 1,
      endY:
        Math.ceil(
          Math.max(currentBounds.y + currentBounds.height, nextBounds.y + nextBounds.height) /
            TILE_SIZE
        ) + 1,
    };

    const collidingTiles: Phaser.Tilemaps.Tile[] = [];
    for (let y = tileRange.startY; y <= tileRange.endY; y++) {
      for (let x = tileRange.startX; x <= tileRange.endX; x++) {
        const tile = layer.getTileAt(x, y);
        if (tile && tile.collides) {
          collidingTiles.push(tile);
        }
      }
    }

    // 5. Resolver colisiones verticales primero
    let hasVerticalCollision = false;
    const wasGrounded = body.grounded;
    body.grounded = false;

    for (const tile of collidingTiles) {
      const tileBounds = {
        x: tile.pixelX,
        y: tile.pixelY,
        width: TILE_SIZE,
        height: TILE_SIZE,
      };

      // Probar la posición siguiente para colisiones verticales
      const verticalTestBounds = {
        ...currentBounds,
        y: nextBounds.y,
      };

      if (this.checkAABBCollision(verticalTestBounds, tileBounds)) {
        if (body.velocity.y > 0) {
          // Cayendo
          // Aterrizar en la plataforma
          body.position.y = tileBounds.y - body.size.height / 2;
          body.velocity.y = 0;
          body.grounded = true;
          hasVerticalCollision = true;
          break;
        } else if (body.velocity.y < 0) {
          // Saltando
          // Golpear el techo
          body.position.y = tileBounds.y + TILE_SIZE + body.size.height / 2;
          body.velocity.y = 0;
          hasVerticalCollision = true;
          break;
        }
      }
    }

    // 6. Verificar si seguimos en el suelo cuando no hay colisión vertical
    if (!hasVerticalCollision && wasGrounded) {
      const groundCheckBounds = {
        ...currentBounds,
        height: currentBounds.height + 4, // Aumentar tolerancia a 4 píxeles
      };

      for (const tile of collidingTiles) {
        const tileBounds = {
          x: tile.pixelX,
          y: tile.pixelY,
          width: TILE_SIZE,
          height: TILE_SIZE,
        };

        if (this.checkAABBCollision(groundCheckBounds, tileBounds)) {
          // Si hay un tile justo debajo, mantener grounded
          const tileTop = tileBounds.y;
          const bodyBottom = body.position.y + body.size.height / 2;

          if (Math.abs(bodyBottom - tileTop) <= 4) {
            body.position.y = tileTop - body.size.height / 2;
            body.velocity.y = 0;
            body.grounded = true;
            break;
          }
        }
      }
    }

    // Si no estamos en el suelo y no hubo colisión vertical, actualizar Y
    if (!body.grounded && !hasVerticalCollision) {
      body.position.y = nextY;
    }

    // 7. Resolver colisiones horizontales
    const horizontalTestBounds = {
      x: nextX - body.size.width / 2,
      y: body.position.y - body.size.height / 2,
      width: body.size.width,
      height: body.size.height,
    };

    let hasHorizontalCollision = false;

    for (const tile of collidingTiles) {
      const tileBounds = {
        x: tile.pixelX,
        y: tile.pixelY,
        width: TILE_SIZE,
        height: TILE_SIZE,
      };

      if (this.checkAABBCollision(horizontalTestBounds, tileBounds)) {
        if (body.velocity.x > 0) {
          // Colisión con pared derecha
          body.position.x = tileBounds.x - body.size.width / 2;
        } else if (body.velocity.x < 0) {
          // Colisión con pared izquierda
          body.position.x = tileBounds.x + TILE_SIZE + body.size.width / 2;
        }
        body.velocity.x = 0;
        hasHorizontalCollision = true;
        break;
      }
    }

    // Si no hubo colisión horizontal, actualizar X
    if (!hasHorizontalCollision) {
      body.position.x = nextX;
    }
  }
}
