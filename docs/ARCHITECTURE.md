# Architecture Overview

This document provides a high-level overview of the game's architecture and how different systems interact.

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Game Entry                          │
│                        (main.ts)                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Core Game                              │
│                     (Game.ts)                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Phaser.Game Instance                                │  │
│  │  - Configuration                                      │  │
│  │  - Scene Management                                   │  │
│  │  - Physics Engine                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌────────────┐   ┌────────────┐   ┌────────────┐
│ Boot Scene │──▶│ Menu Scene │──▶│ Game Scene │
└────────────┘   └────────────┘   └──────┬─────┘
                                          │
                                          ▼
                                   ┌──────────────┐
                                   │  UI Scene    │
                                   │  (Parallel)  │
                                   └──────────────┘
```

## Core Systems

### 1. Game Bootstrap (`src/core/Game.ts`)

The main game class that initializes Phaser and configures all systems.

**Responsibilities**:
- Create Phaser.Game instance
- Register scenes
- Configure physics engine
- Set up rendering pipeline

**Key Configuration**:
```typescript
{
  type: Phaser.AUTO,              // WebGL with Canvas fallback
  width: 1280,                    // Game width
  height: 720,                    // Game height
  physics: {
    default: 'arcade',            // Physics engine type
    arcade: {
      gravity: { y: 1200 }        // Gravity constant
    }
  }
}
```

### 2. Scene Management

Phaser's built-in scene system manages game states.

**Scene Flow**:
```
BootScene → MainMenuScene → [GameScene + UIScene]
```

**Scene Types**:
- **BootScene**: Asset loading, texture generation
- **MainMenuScene**: Main menu UI
- **GameScene**: Core gameplay loop
- **UIScene**: Persistent HUD overlay (runs in parallel)

### 3. Input System (`src/core/InputManager.ts`)

Unified input abstraction layer supporting multiple devices.

**Architecture**:
```
InputManager
├── Keyboard Bindings
├── Gamepad Bindings (ready)
└── Touch Bindings (future)
```

**Flow**:
```
Physical Input → Input Manager → Action Mapping → Game Logic
  (SPACE key)   (update cycle)   (JUMP action)   (player.jump())
```

**Features**:
- Action-based mapping
- Just-pressed/just-released detection
- Input buffering
- Horizontal axis abstraction

### 4. Event System (`src/core/EventBus.ts`)

Global event bus for decoupled system communication.

**Pattern**: Publish-Subscribe

**Example Flow**:
```
Player jumps → EventBus.emit('player:jump') → Audio system plays sound
                                             → Particle system spawns dust
```

**Benefits**:
- Loose coupling between systems
- Easy to add/remove listeners
- No circular dependencies

### 5. Physics System (`src/systems/PhysicsSystem.ts`)

Custom AABB collision detection and resolution.

**Why Custom?**:
- Precise platformer physics
- Coyote time support
- Variable jump height
- Pixel-perfect collision

**Algorithm**:
```
1. Calculate AABB overlaps on all sides
2. Find minimum overlap direction
3. Resolve by pushing entity out
4. Zero velocity in collision direction
5. Update grounded state
```

**Tilemap Collision**:
```
1. Get tiles in entity bounds
2. For each solid tile:
   a. Check AABB collision
   b. Resolve if colliding
3. Update entity grounded state
```

### 6. Camera System (`src/systems/CameraSystem.ts`)

Smooth camera following with bounds management.

**Features**:
- Lerp-based smooth following
- Room-based bounds
- Shake/flash effects
- Fade transitions

**Update Loop**:
```
1. Get target position
2. Calculate desired camera position
3. Lerp current → desired (smooth)
4. Clamp to bounds
5. Set camera scroll
```

## Entity-Component System

### Entity Hierarchy

```
Entity (Base Class)
├── sprite: Phaser.GameObjects.Sprite
├── update(time, delta): void
└── destroy(): void

Player extends Entity
├── MovementComponent
├── PhysicsComponent
└── InputManager

Enemy extends Entity
├── MovementComponent
├── PhysicsComponent
├── AIComponent
└── HealthComponent
```

### Components

Components are reusable behavior modules attached to entities.

**MovementComponent**:
- Velocity tracking
- Acceleration/friction
- Coyote time
- Jump buffering

**PhysicsComponent**:
- Position, size
- Velocity, acceleration
- Grounded state
- Gravity application

**HealthComponent** (future):
- Current/max health
- Damage calculation
- Invulnerability frames

### Data Flow

```
Input → Player → Components → Physics → Collision → Render
  ↓                                                    ↑
  └──────────── Event Bus ───────────────────────────┘
```

## Update Loop

### Frame Cycle (60 FPS = 16.67ms)

```
1. Phaser.Game.update()
   ├── Scene.update(time, delta)
   │   ├── InputManager.update(time)
   │   ├── Player.update(time, delta)
   │   │   ├── Handle input
   │   │   ├── Update components
   │   │   ├── Apply physics
   │   │   └── Update sprite
   │   ├── PhysicsSystem.resolveCollisions()
   │   └── CameraSystem.update()
   └── Scene.render()
       └── Phaser.Renderer.render()
```

### Time Management

- **time**: Total elapsed time since game start (ms)
- **delta**: Time since last frame (ms)

**Usage**:
```typescript
update(time: number, delta: number): void {
  const deltaSeconds = delta / 1000;
  velocity.x += acceleration * deltaSeconds; // Frame-rate independent
}
```

## Data Flow Patterns

### 1. Input → Action

```
Keyboard         Gamepad          Touch
   │                │               │
   └────────────────┼───────────────┘
                    │
            InputManager
                    │
         ┌──────────┼──────────┐
         │          │          │
   MOVE_LEFT    JUMP     MOVE_RIGHT
         │          │          │
         └──────────┼──────────┘
                    │
              Game Logic
```

### 2. Event Flow

```
Entity Action
     │
     ▼
EventBus.emit('event:name', data)
     │
     ├──▶ System A listens
     ├──▶ System B listens
     └──▶ System C listens
```

### 3. Collision Resolution

```
Player Position
     │
     ▼
PhysicsComponent.updatePosition()
     │
     ▼
PhysicsSystem.resolveTilemapCollision()
     │
     ├─▶ Get nearby tiles
     ├─▶ Check AABB collision
     ├─▶ Resolve overlaps
     └─▶ Update grounded state
     │
     ▼
Player.sprite.setPosition()
```

## File Organization

```
src/
├── core/              # Singleton systems
│   ├── Game.ts        # Phaser bootstrap
│   ├── InputManager.ts
│   ├── EventBus.ts
│   └── Logger.ts
│
├── scenes/            # Phaser scenes
│   ├── BootScene.ts
│   ├── MainMenuScene.ts
│   ├── GameScene.ts
│   └── UIScene.ts
│
├── entities/          # Game objects
│   ├── Entity.ts      # Base class
│   ├── Player.ts
│   └── Enemy.ts (future)
│
├── components/        # Reusable behaviors
│   ├── MovementComponent.ts
│   ├── PhysicsComponent.ts
│   └── HealthComponent.ts (future)
│
├── systems/           # Game systems
│   ├── PhysicsSystem.ts
│   ├── CameraSystem.ts
│   └── AudioManager.ts (future)
│
├── types/             # TypeScript definitions
│   ├── game.types.ts
│   ├── input.types.ts
│   └── physics.types.ts
│
├── utils/             # Helper functions
│   ├── math.utils.ts
│   └── constants.ts
│
└── ui/                # UI components
    └── DebugOverlay.ts
```

## Module Dependencies

```
┌─────────────┐
│   main.ts   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Game.ts   │◀──────────┐
└──────┬──────┘           │
       │              Registers
       │                  │
       ▼                  │
┌─────────────┐     ┌──────────┐
│   Scenes    │────▶│ Entities │
└──────┬──────┘     └────┬─────┘
       │                 │
       │ Uses       Uses │
       │                 │
       ▼                 ▼
┌─────────────┐     ┌────────────┐
│   Systems   │     │ Components │
└──────┬──────┘     └────────────┘
       │
       │ Uses
       │
       ▼
┌─────────────┐
│   Utils     │
└─────────────┘
```

### Dependency Rules

1. **No circular dependencies**
2. **Core systems are singletons**
3. **Components don't reference entities**
4. **Scenes orchestrate, don't contain logic**
5. **Utils have no dependencies (pure functions)**

## State Management

### Game State

```typescript
interface GameState {
  playerHealth: number;
  playerMaxHealth: number;
  checkpoints: string[];
  unlockedAbilities: string[];
  currentRoom: string;
}
```

**Stored in**: LocalStorage (JSON serialized)

**Access Pattern**:
```
SaveManager.save(state)
  │
  ▼
LocalStorage.setItem('gameState', JSON.stringify(state))

SaveManager.load()
  │
  ▼
JSON.parse(LocalStorage.getItem('gameState'))
```

### Scene Data

**Passing data between scenes**:
```typescript
// From Scene A
this.scene.start(SceneKeys.GAME, { 
  playerPosition: { x: 100, y: 200 },
  fromRoom: 'forest_01' 
});

// In Scene B
create(data: SceneData): void {
  const pos = data.playerPosition;
  this.player.setPosition(pos.x, pos.y);
}
```

## Performance Considerations

### 1. Object Pooling (Future)

**Problem**: Creating/destroying objects causes GC pauses.

**Solution**: Pool reusable objects.

```typescript
class ProjectilePool {
  private pool: Projectile[] = [];
  
  get(): Projectile {
    return this.pool.pop() || new Projectile();
  }
  
  release(projectile: Projectile): void {
    projectile.reset();
    this.pool.push(projectile);
  }
}
```

### 2. Spatial Partitioning (Future)

**Problem**: Checking collisions against all entities is O(n²).

**Solution**: Quadtree for spatial queries.

```
┌─────────┬─────────┐
│    A    │    B    │
│  (2)    │  (15)   │
├─────────┼─────────┤
│    C    │    D    │
│  (3)    │  (1)    │
└─────────┴─────────┘

Query: Check collisions in quadrant B only (15 entities)
Instead of: Checking all 21 entities
```

### 3. Culling

**Problem**: Updating off-screen entities wastes CPU.

**Solution**: Only update entities within camera bounds + buffer.

```typescript
const inView = entity.x > camera.x - buffer &&
               entity.x < camera.x + camera.width + buffer;

if (inView) {
  entity.update(time, delta);
}
```

## Extension Points

### Adding a New Entity Type

1. Extend `Entity` base class
2. Add required components
3. Implement `update()` logic
4. Register in scene

### Adding a New Component

1. Create component class
2. Define public interface
3. Add to entity constructor
4. Call in entity's `update()`

### Adding a New System

1. Create system class
2. Initialize in scene
3. Call in scene's `update()`
4. Emit events if needed

### Adding a New Scene

1. Extend `Phaser.Scene`
2. Add scene key to `SceneKeys`
3. Register in `Game.ts`
4. Implement `create()` and `update()`

## Testing Strategy

### Unit Tests

**Target**: Individual functions and components

```typescript
// Test pure functions
describe('math.utils', () => {
  it('should clamp value', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

// Test components
describe('MovementComponent', () => {
  it('should apply friction', () => {
    const movement = new MovementComponent();
    movement.velocity.x = 100;
    movement.move(0, 16.67); // No input
    expect(movement.velocity.x).toBeLessThan(100);
  });
});
```

### Integration Tests

**Target**: System interactions

```typescript
describe('Player collision with tilemap', () => {
  it('should stop player at wall', () => {
    const player = new Player(scene, 100, 100, input);
    const tile = createSolidTile(150, 100);
    
    player.velocity.x = 100;
    player.update(0, 16.67);
    
    PhysicsSystem.resolveCollision(player, tile);
    
    expect(player.velocity.x).toBe(0);
  });
});
```

## Debug Tools

### 1. FPS Counter

Located in `UIScene`, shows real-time FPS.

### 2. Physics Debug

Visualizes collision boxes:
```typescript
// In GameConfig
DEBUG: {
  SHOW_PHYSICS: true
}
```

### 3. Logger

Structured logging with levels:
```typescript
logger.info('Player spawned at', { x: 100, y: 200 });
logger.debug('Velocity', { vx: 10, vy: -50 });
logger.error('Failed to load asset', error);
```

### 4. Browser Console Access

In development, game instance exposed:
```javascript
window.game                  // Game instance
window.game.scene.scenes     // All scenes
window.game.scene.getScene('GameScene').player  // Access player
```

## Security Considerations

### 1. Input Validation

All external data (save files) is validated:
```typescript
function validateSaveData(data: any): GameState | null {
  if (!data.version || typeof data.playerHealth !== 'number') {
    return null;
  }
  return data as GameState;
}
```

### 2. XSS Prevention

No `innerHTML` usage, only Phaser's text objects.

### 3. Save Data Corruption

Schema versioning with migration:
```typescript
if (data.version === '1.0.0') {
  // Migrate to 2.0.0
  data = migrateV1ToV2(data);
}
```

## Future Architecture Changes

### Milestone 2+

1. **Ability System**
   - Data-driven abilities (JSON config)
   - State machine for ability execution
   - Cooldown management

2. **AI System**
   - Behavior trees for enemy AI
   - Pathfinding (A* algorithm)
   - Perception system

3. **Audio System**
   - Audio manager with channels
   - Audio sprites for SFX
   - Music crossfading

4. **Save System**
   - Versioned schema
   - Cloud backup (optional)
   - Autosave on checkpoints

5. **Room System**
   - Room metadata (connections, enemies)
   - Dynamic loading/unloading
   - Transition effects

## Performance Targets

| Metric        | Target | Current |
| ------------- | ------ | ------- |
| FPS (Desktop) | 60     | ✅ 60    |
| FPS (Mobile)  | 30+    | TBD     |
| Load Time     | <3s    | ✅ <1s   |
| Bundle Size   | <5MB   | ✅ 500KB |
| Memory Usage  | <100MB | ✅ ~50MB |

## Monitoring

### Development Metrics

- **Build Time**: <10s (Vite optimized)
- **Test Execution**: <5s (Vitest fast)
- **Hot Reload**: <100ms (Vite HMR)

### Runtime Metrics

- **Frame Time**: <16.67ms (60 FPS)
- **GC Pauses**: <5ms (object pooling)
- **Asset Load**: <500ms per room

## Deployment Architecture

```
GitHub Repository
       │
       ▼
GitHub Actions CI
       │
   ┌───┴───┐
   │ Build │
   └───┬───┘
       │
       ▼
   Artifacts
       │
       ├─▶ Netlify CDN
       ├─▶ Vercel Edge
       └─▶ GitHub Pages
```

### Build Output

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js       # Main bundle
│   ├── phaser-[hash].js      # Phaser chunk
│   └── assets/               # Game assets
└── _redirects                # SPA routing
```

## Troubleshooting

### Common Issues

1. **Physics clipping**: Check PHYSICS_EPSILON value
2. **Input lag**: Verify delta time calculations
3. **Memory leak**: Check entity cleanup in destroy()
4. **Frame drops**: Profile with Chrome DevTools

### Debug Commands

```javascript
// In browser console
window.game.scene.pause('GameScene');   // Pause game
window.game.scene.resume('GameScene');  // Resume game
window.game.scene.restart('GameScene'); // Restart scene
```

---

**Document Version**: 1.0
**Last Updated**: 2025-11-01
**Maintained By**: Raggiodev
**License**: MIT
