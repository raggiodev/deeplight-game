# Design Document - DeepLight Game

## Executive Summary

This document outlines the architectural decisions, technical design patterns, and implementation strategies for the "DeepLight Game" built with TypeScript and Phaser 3.

---

## 1. Technology Stack Rationale

### TypeScript + Phaser 3

**Decision**: Use TypeScript with Phaser 3 as the primary technology stack.

**Reasoning**:
1. **Type Safety**: TypeScript's strict mode catches 60-70% of runtime bugs at compile time
2. **IDE Support**: Excellent autocomplete, refactoring, and error detection
3. **Web-First**: Phaser 3 is designed for web deployment with zero configuration
4. **Performance**: WebGL rendering with hardware acceleration
5. **Ecosystem**: Mature community, extensive documentation, proven in production games
6. **Rapid Iteration**: Vite HMR enables instant feedback during development

**Trade-offs**:
- ✅ Pro: Fast web deployment, no WASM complexity
- ✅ Pro: Rich plugin ecosystem for tilemap, particles, audio
- ❌ Con: JavaScript runtime overhead vs native (acceptable for 2D)
- ❌ Con: Memory management requires manual object pooling

---

## 2. Architecture Patterns

### 2.1 Entity-Component System (Lite)

**Pattern**: Composition over inheritance with lightweight components.

**Implementation**:
```
Entity (Base Class)
  ├── sprite: Phaser.GameObjects.Sprite
  └── update(time, delta): void

Player extends Entity
  ├── MovementComponent
  ├── PhysicsComponent
  └── InputManager
```

**Why Not Full ECS?**
- Game scope (~50 entities max) doesn't justify Data-Oriented Design overhead
- Component classes provide cleaner debugging than pure data structures
- Easier onboarding for developers familiar with OOP

**Benefits**:
- Reusable components (MovementComponent used by Player and NPCs)
- Clear separation of concerns
- Testable in isolation

### 2.2 System-Driven Logic

**Pattern**: Game logic separated into focused systems.

**Systems**:
- **PhysicsSystem**: Collision detection, resolution, AABB checks
- **CameraSystem**: Smooth following, bounds management, effects
- **InputManager**: Device abstraction, action mapping

**Communication**: Event-driven via EventBus (pub-sub pattern).

**Example**:
```typescript
// Player emits jump event
eventBus.emit(Events.PLAYER_JUMP);

// Audio system listens
eventBus.on(Events.PLAYER_JUMP, () => playSound('jump.ogg'));
```

**Benefits**:
- Decoupled systems (audio doesn't know about player internals)
- Easy to add/remove features
- Testable without full game setup

### 2.3 Scene Management

**Pattern**: Phaser's native Scene system with persistent UI overlay.

**Scene Hierarchy**:
```
BootScene → MainMenuScene → [GameScene + UIScene (parallel)]
```

**Why Parallel UI Scene?**
- HUD persists across scene transitions
- Separates game logic from UI rendering
- Independent update loops for performance

---

## 3. Physics Implementation

### 3.1 Custom AABB Physics

**Decision**: Implement custom AABB (Axis-Aligned Bounding Box) collision instead of using Phaser Arcade or Matter.js.

**Reasoning**:
1. **Precise Control**: Platformers require pixel-perfect collision response
2. **Coyote Time**: Arcade Physics doesn't support post-ground grace periods
3. **Variable Jump**: Need fine control over gravity/velocity curves
4. **Performance**: AABB is faster than full rigid-body physics

**Algorithm**:
```typescript
1. Calculate overlaps on all four sides
2. Find minimum overlap direction
3. Push entity out by overlap + epsilon
4. Zero velocity in collision direction
5. Set grounded flag if bottom collision
```

**Epsilon Value**: 0.001 prevents floating-point precision issues causing clipping.

### 3.2 Tilemap Collision

**Strategy**: Iterate nearby tiles, resolve collisions sequentially.

**Optimization**: Only check tiles within entity bounds + 1 tile buffer.

**Formula**:
```typescript
startX = floor(entityX / TILE_SIZE) - 1
endX = ceil((entityX + width) / TILE_SIZE) + 1
```

**Collision Order**: Horizontal first, then vertical (prevents corner clipping).

---

## 4. Movement Mechanics

### 4.1 Acceleration-Based Movement

**Decision**: Use acceleration + friction instead of instant velocity.

**Formula**:
```typescript
velocity.x += direction * acceleration * deltaTime
velocity.x = clamp(velocity.x, -maxSpeed, maxSpeed)
velocity.x = applyFriction(velocity.x, friction, deltaTime)
```

**Benefits**:
- Smoother, more responsive feel
- Gradual acceleration mimics Hollow Knight's momentum
- Friction prevents instant stop (feels floaty otherwise)

**Tuning Values** (GameConfig):
- Acceleration: 800 px/s²
- Max Speed: 200 px/s
- Friction: 800 px/s²

### 4.2 Jump Implementation

**Features**:
1. **Variable Jump Height**: Hold button longer = higher jump
2. **Coyote Time**: 100ms grace period after leaving platform
3. **Jump Buffering**: 100ms early input window

**Variable Jump Logic**:
```typescript
if (justReleasedJump && velocityY < 0 && !grounded) {
  velocityY *= 0.5; // Cut velocity in half
}
```

**Coyote Time**:
```typescript
if (grounded && !wasGrounded) {
  coyoteTimeRemaining = 100ms;
}
canJump = grounded || coyoteTimeRemaining > 0;
```

**Jump Buffer**:
```typescript
if (pressedJump) {
  jumpBufferTime = 100ms;
}
if (jumpBufferTime > 0 && canJump) {
  performJump();
}
```

---

## 5. Input Architecture

### 5.1 Unified Input Manager

**Design**: Single API for keyboard, gamepad, and touch.

**Action Mapping**:
```typescript
InputActions.JUMP → [SPACE, W, UP, Gamepad.A]
InputActions.MOVE_LEFT → [A, LEFT, Gamepad.DPadLeft]
```

**State Tracking**:
```typescript
interface InputState {
  isPressed: boolean;      // Current frame
  justPressed: boolean;    // Transition: false → true
  justReleased: boolean;   // Transition: true → false
  pressTime: number;       // Duration held (ms)
}
```

**Benefits**:
- Change controls without touching game logic
- Easy to add gamepad/touch later
- Input buffering handled at manager level

### 5.2 Horizontal Axis Abstraction

**Method**: `getHorizontalAxis()` returns -1, 0, or 1.

**Logic**:
1. Check digital inputs (keyboard/D-pad)
2. If none pressed, check analog stick
3. Apply deadzone (0.2) to analog input

**Why**: Allows smooth transition between digital/analog controls.

---

## 6. Camera System

### 6.1 Smooth Following

**Algorithm**: Linear interpolation (lerp) toward target.

```typescript
newX = lerp(currentX, targetX, lerpFactor)
```

**Lerp Factor**: 0.1 (10% per frame at 60fps = ~6 frame delay)

**Why Lerp?**
- Prevents jarring camera snaps
- Smooths out sudden player movements
- Mimics camera lag in film

### 6.2 Bounds Clamping

**Implementation**: Phaser's built-in `camera.setBounds()`.

**Prevents**: Showing black void outside tilemap.

**Dynamic Bounds**: Updated on room transitions (Milestone 4).

---

## 7. Performance Optimizations

### 7.1 Object Pooling (Future)

**Strategy**: Reuse enemy/projectile objects instead of create/destroy.

**Impact**: Eliminates garbage collection pauses (5-10ms spikes).

**Implementation** (M3):
```typescript
class ProjectilePool {
  private pool: Projectile[] = [];
  
  get(): Projectile {
    return this.pool.pop() || new Projectile();
  }
  
  release(obj: Projectile): void {
    obj.reset();
    this.pool.push(obj);
  }
}
```

### 7.2 Culling (Future)

**Strategy**: Don't update entities outside camera view + buffer.

**Formula**:
```typescript
const buffer = 200; // pixels
const inView = entity.x > camera.x - buffer &&
               entity.x < camera.x + camera.width + buffer;
```

**Impact**: 50% CPU savings with 100+ entities.

---

## 8. Testing Strategy

### 8.1 Unit Test Coverage

**Target**: 70% minimum across lines/functions/branches.

**Critical Paths**:
- Math utilities (lerp, clamp, distance) → 100% coverage
- Input state transitions → 90% coverage
- Collision detection → 85% coverage

**Tools**: Vitest (faster than Jest, native ESM support).

### 8.2 Integration Tests (M2)

**Scenarios**:
- Player walks into wall → stops moving
- Player jumps → leaves ground, lands correctly
- Scene transition → player positioned at entry point

**Approach**: Headless Phaser instance with mocked time.

---

## 9. Code Organization

### 9.1 Path Aliases

**Configuration**: TypeScript + Vite path resolution.

```typescript
import { Player } from '@entities/Player';
import { lerp } from '@utils/math.utils';
```

**Benefits**:
- No relative path hell (`../../../utils`)
- Easy refactoring (move files without breaking imports)
- IDE autocomplete works perfectly

### 9.2 Naming Conventions

**Files**: PascalCase for classes, camelCase for utilities.
```
Player.ts         # Class
math.utils.ts     # Utilities
game.types.ts     # Type definitions
```

**Variables**: camelCase for locals, SCREAMING_SNAKE_CASE for constants.

---

## 10. Future Architecture (M2-M6)

### 10.1 Save System (M4)

**Format**: JSON in localStorage.

**Schema Versioning**:
```typescript
interface SaveData {
  version: string;           // "1.0.0"
  player: PlayerState;
  world: WorldState;
}
```

**Migration**: Detect old version, transform to new schema.

### 10.2 Audio System (M5)

**Architecture**:
```typescript
AudioManager
  ├── SFX Channel (20 max concurrent)
  ├── BGM Channel (crossfade)
  └── Master Volume Control
```

**Format**: OGG (smaller than MP3, better quality).

**Optimization**: Audio sprites (single file, multiple sounds).

### 10.3 Ability System (M4)

**Data-Driven**: Abilities defined in JSON.

```json
{
  "id": "dash",
  "unlocked": false,
  "cooldown": 1500,
  "energyCost": 0
}
```

**Gate Check**:
```typescript
if (!abilitySystem.hasAbility('dash')) {
  showTooltip("Need dash to proceed");
}
```

---

## 11. Deployment Strategy

### 11.1 Build Optimization

**Steps**:
1. Vite build (terser minification)
2. Code splitting (phaser.js as separate chunk)
3. Asset optimization (texture atlases, audio compression)
4. Gzip compression (80% size reduction)

**Target Bundle Size**:
- Initial: <5MB
- Total (all assets): <10MB

### 11.2 Hosting

**Platform**: Netlify (recommended) or Vercel/GitHub Pages

**Configuration**:
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**CDN**: Automatic with Netlify Edge Network (global <100ms latency).

---

## 12. Architectural Decision Records (ADRs)

### ADR-001: TypeScript Strict Mode

**Status**: Accepted

**Context**: Need type safety without sacrificing developer experience.

**Decision**: Enable all strict TypeScript flags.

**Consequences**:
- ✅ Catches null/undefined bugs at compile time
- ✅ Forces explicit typing (self-documenting code)
- ❌ More verbose (but worth it for large codebase)

### ADR-002: Custom Physics Over Arcade

**Status**: Accepted

**Context**: Arcade Physics lacks platformer-specific features.

**Decision**: Implement custom AABB collision system.

**Consequences**:
- ✅ Full control over coyote time, jump buffering
- ✅ Precise collision response
- ❌ More code to maintain
- ❌ Reinventing some wheels

**Alternatives Rejected**:
- Matter.js: Too heavy, unnecessary features (rotation, joints)
- Arcade Physics: Missing features, imprecise collision

### ADR-003: Event-Driven Architecture

**Status**: Accepted

**Context**: Need decoupled communication between systems.

**Decision**: Use EventBus (pub-sub pattern).

**Consequences**:
- ✅ Systems don't need references to each other
- ✅ Easy to add new listeners
- ❌ Harder to trace event flow (use Logger)
- ❌ No compile-time type safety for events (use const enums)

### ADR-004: Component Composition

**Status**: Accepted

**Context**: Entity behavior needs to be flexible and reusable.

**Decision**: Lightweight component pattern (not full ECS).

**Consequences**:
- ✅ Reusable components across entities
- ✅ Easier testing (mock individual components)
- ❌ Not as performant as Data-Oriented ECS
- ❌ Still some inheritance (Entity base class)

### ADR-005: Vitest Over Jest

**Status**: Accepted

**Context**: Need fast, modern testing framework.

**Decision**: Use Vitest for unit/integration tests.

**Consequences**:
- ✅ 10x faster than Jest in watch mode
- ✅ Native ESM support (no babel)
- ✅ Same API as Jest (easy migration)
- ❌ Smaller community than Jest

---

## 13. Performance Budgets

### 13.1 Frame Time Budget (60 FPS = 16.67ms)

| System     | Budget | Measurement           |
| ---------- | ------ | --------------------- |
| Physics    | 3ms    | 10 collision checks   |
| Rendering  | 8ms    | 50 sprites, 1 tilemap |
| Input      | 0.5ms  | Poll 10 actions       |
| Game Logic | 3ms    | Update 20 entities    |
| Audio      | 1ms    | Mix 5 channels        |
| **Buffer** | 1.17ms | Safety margin         |

### 13.2 Memory Budget

| Category  | Budget | Notes             |
| --------- | ------ | ----------------- |
| Textures  | 50MB   | Atlases, tiles    |
| Audio     | 20MB   | Compressed OGG    |
| Code      | 2MB    | Minified JS       |
| Runtime   | 30MB   | Entities, state   |
| **Total** | 102MB  | Target for mobile |

### 13.3 Load Time Budget

| Phase       | Budget | Strategy           |
| ----------- | ------ | ------------------ |
| HTML/JS     | 1s     | Code splitting     |
| Boot Assets | 1s     | Preload screen     |
| Room Assets | 0.3s   | Per-room lazy load |
| **Total**   | 2.3s   | First playable     |

---

## 14. Code Quality Metrics

### 14.1 Complexity Limits

- **Cyclomatic Complexity**: Max 10 per function
- **File Length**: Max 300 lines
- **Function Length**: Max 50 lines
- **Function Parameters**: Max 4

**Enforcement**: ESLint rules + code review.

### 14.2 Test Coverage Requirements

- **Unit Tests**: 70% minimum
- **Critical Paths**: 90% (player movement, combat)
- **Integration Tests**: 50% (scene transitions, save/load)

### 14.3 Documentation Standards

**Required**:
- JSDoc comments for public APIs
- README for each major system
- Inline comments for complex algorithms

**Example**:
```typescript
/**
 * Apply friction to velocity, stopping at zero
 * @param velocity - Current velocity (px/s)
 * @param friction - Friction coefficient (px/s²)
 * @param delta - Time delta (seconds)
 * @returns New velocity with friction applied
 */
export function applyFriction(
  velocity: number,
  friction: number,
  delta: number
): number {
  // Implementation...
}
```

---

## 15. Risk Management

### 15.1 Technical Risks

| Risk                         | Likelihood | Impact | Mitigation                             |
| ---------------------------- | ---------- | ------ | -------------------------------------- |
| Physics bugs (clipping)      | High       | High   | Extensive testing, debug visualization |
| Mobile performance <30fps    | Medium     | High   | Early profiling, aggressive culling    |
| Save corruption              | Low        | High   | Schema versioning, backup system       |
| Input lag on low-end devices | Medium     | Medium | Input buffering, frame skip logic      |

### 15.2 Scope Risks

| Risk                        | Likelihood | Impact | Mitigation                   |
| --------------------------- | ---------- | ------ | ---------------------------- |
| Feature creep               | High       | Medium | Strict milestone gates       |
| Asset pipeline delays       | Medium     | Low    | Placeholders first, art last |
| Content creation bottleneck | Medium     | Medium | Tools for level designers    |

---

## 16. Accessibility Considerations

### 16.1 Input Accessibility

- **Rebindable Controls**: All actions configurable (M5)
- **Multiple Input Devices**: Keyboard, gamepad, touch
- **Input Buffering**: 100ms window reduces precision requirements

### 16.2 Visual Accessibility

- **High Contrast Mode**: Toggle in settings (M5)
- **Colorblind Modes**: Adjust palette (M6)
- **Screen Reader**: Menu navigation (M5)

### 16.3 Difficulty Accessibility

- **Assist Mode**: Increased invulnerability frames (M6)
- **Checkpoint Frequency**: Reduce backtracking punishment
- **Enemy Scaling**: Optional difficulty slider (M6)

---

## 17. Localization Strategy (Future)

### 17.1 Text Management

**Format**: JSON per locale.

```json
{
  "en": {
    "menu.start": "Start Game",
    "menu.settings": "Settings"
  },
  "es": {
    "menu.start": "Iniciar Juego",
    "menu.settings": "Configuración"
  }
}
```

### 17.2 Font Support

- **Primary**: English (Latin)
- **Future**: Spanish, French, German, Japanese
- **Technical**: Use web fonts with full Unicode coverage

---

## 18. Analytics & Telemetry (M6)

### 18.1 Metrics to Track

- **Player Progression**: Checkpoints reached, abilities unlocked
- **Death Heatmap**: Where players die most frequently
- **Session Length**: Average playtime
- **Performance**: Average FPS, load times

### 18.2 Privacy-First

- **No Personal Data**: Only aggregate game metrics
- **Opt-Out**: Setting to disable telemetry
- **Local Storage**: No server communication

---

## 19. Development Workflow

### 19.1 Git Branch Strategy

```
main          # Production-ready code
  └── develop # Integration branch
      ├── feature/player-dash
      ├── feature/enemy-ai
      └── bugfix/collision-clip
```

### 19.2 Commit Convention

**Format**: `type(scope): description`

**Types**: feat, fix, docs, style, refactor, test, chore

**Example**: `feat(player): add dash ability with cooldown`

### 19.3 Code Review Checklist

- [ ] Tests pass (`npm test`)
- [ ] Linter passes (`npm run lint`)
- [ ] No console.log (use Logger)
- [ ] Type safety (no `any`)
- [ ] Documentation updated
- [ ] Performance impact assessed

---

## 20. Technical Debt Management

### 20.1 Known Debt

1. **Placeholder Graphics**: Replace with final art (M5)
2. **Hardcoded Level**: Move to Tiled JSON (M2)
3. **No Audio System**: Implement AudioManager (M5)
4. **Manual Collision Iteration**: Consider spatial partitioning if >100 entities (M4)

### 20.2 Debt Paydown Strategy

- **Rule**: No more than 3 TODOs per milestone
- **Tracking**: GitHub issues tagged `tech-debt`
- **Schedule**: 20% of each milestone for refactoring

---

## Conclusion

This design document serves as the architectural foundation for the "DeepLight Game" project. All technical decisions are justified with clear trade-offs and alternatives considered. The architecture prioritizes:

1. **Maintainability**: Clean separation of concerns, testable code
2. **Performance**: 60 FPS target, optimization strategies defined
3. **Scalability**: Patterns that support 6+ milestone feature additions
4. **Developer Experience**: Fast iteration, excellent tooling, clear documentation

As the project evolves, this document will be updated to reflect new architectural decisions and lessons learned.

---

**Document Version**: 1.0
**Last Updated**: 2025-11-01
**Next Review**: After Milestone 2
