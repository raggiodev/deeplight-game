# Contributing Guide

Thank you for your interest in contributing to this project! This guide will help you get started.

## Table of Contents

1. [Development Setup](#development-setup)
2. [Project Structure](#project-structure)
3. [Coding Standards](#coding-standards)
4. [Git Workflow](#git-workflow)
5. [Testing Guidelines](#testing-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Common Tasks](#common-tasks)

---

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- VS Code (recommended) with extensions:
  - ESLint
  - Prettier
  - TypeScript

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/raggiodev/deeplight-game.git
cd deeplight-game

# Install dependencies
npm install

# Start development server
npm run dev
```

### Recommended VS Code Extensions

Install these for the best development experience:

```bash
# In VS Code Command Palette (Cmd/Ctrl+Shift+P)
# Type: Extensions: Show Recommended Extensions
```

Or manually install:
- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- TypeScript (`ms-vscode.vscode-typescript-next`)
- Vitest Explorer (`vitest.explorer`)

---

## Project Structure

```
src/
├── core/           # Core game systems (Game, InputManager, EventBus)
├── scenes/         # Phaser scenes (Boot, MainMenu, Game, UI)
├── entities/       # Game entities (Player, Enemy, NPC)
├── components/     # Reusable components (Movement, Physics, Health)
├── systems/        # Game systems (Physics, Camera, Audio)
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── ui/             # UI components (HUD, menus)
```

### Import Path Aliases

Use aliases for clean imports:

```typescript
import { Player } from '@entities/Player';       // Instead of '../../../entities/Player'
import { lerp } from '@utils/math.utils';        // Instead of '../../utils/math.utils'
import { GameConfig } from '@/config';           // Instead of '../../../config'
```

---

## Coding Standards

### TypeScript

- **Always use strict mode** (already configured)
- **No `any` type** unless absolutely necessary (document why in comments)
- **Explicit return types** for public functions
- **Interfaces over types** for object shapes

```typescript
// ✅ Good
function calculateDistance(a: Vector2, b: Vector2): number {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

// ❌ Bad
function calculateDistance(a, b) {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}
```

### Naming Conventions

- **Files**: PascalCase for classes, camelCase for utilities
  - `Player.ts` (class)
  - `math.utils.ts` (utilities)
  - `game.types.ts` (types)

- **Variables**: camelCase
  - `playerVelocity`, `jumpHeight`

- **Constants**: SCREAMING_SNAKE_CASE
  - `TILE_SIZE`, `MAX_VELOCITY`

- **Interfaces**: PascalCase with `I` prefix
  - `IEntity`, `IPhysicsBody`

- **Enums**: PascalCase
  - `InputDevice`, `SceneKeys`

### Code Organization

- **Max function length**: 50 lines
- **Max file length**: 300 lines
- **Max cyclomatic complexity**: 10

If you exceed these limits, refactor into smaller functions/files.

### Comments

- **JSDoc** for all public APIs
- **Inline comments** for complex logic
- **TODO comments** with GitHub issue reference

```typescript
/**
 * Apply friction to velocity, stopping at zero
 * @param velocity - Current velocity (px/s)
 * @param friction - Friction coefficient (px/s²)
 * @param delta - Time delta (seconds)
 * @returns New velocity with friction applied
 */
export function applyFriction(velocity: number, friction: number, delta: number): number {
  // TODO(#42): Optimize friction calculation for mobile
  if (velocity === 0) return 0;
  
  const frictionAmount = friction * delta;
  if (Math.abs(velocity) <= frictionAmount) {
    return 0;
  }
  
  return velocity > 0 ? velocity - frictionAmount : velocity + frictionAmount;
}
```

---

## Git Workflow

### Branch Naming

```
feature/player-dash      # New features
bugfix/collision-clip    # Bug fixes
hotfix/critical-crash    # Critical production fixes
refactor/physics-system  # Code refactoring
docs/api-documentation   # Documentation updates
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Build process, dependencies

**Examples**:
```bash
feat(player): add dash ability with cooldown

fix(physics): prevent player clipping through walls

docs(readme): update installation instructions

test(input): add tests for gamepad input
```

### Development Workflow

1. **Create a branch from `develop`**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-feature
   ```

2. **Make changes and commit regularly**:
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

3. **Keep branch updated**:
   ```bash
   git fetch origin
   git rebase origin/develop
   ```

4. **Push and create PR**:
   ```bash
   git push origin feature/my-feature
   # Create PR on GitHub
   ```

---

## Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Writing Tests

- **Test critical paths**: Player movement, collision, save/load
- **Test edge cases**: Null inputs, boundary conditions
- **Mock dependencies**: Use Vitest mocks for Phaser objects

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { Player } from '@entities/Player';

describe('Player', () => {
  let player: Player;

  beforeEach(() => {
    // Setup before each test
    player = new Player(mockScene, 100, 100, mockInput);
  });

  it('should initialize at correct position', () => {
    const pos = player.getPosition();
    expect(pos.x).toBe(100);
    expect(pos.y).toBe(100);
  });

  it('should apply gravity over time', () => {
    const initialY = player.getPosition().y;
    player.update(0, 16.67); // One frame at 60fps
    expect(player.getPosition().y).toBeGreaterThan(initialY);
  });
});
```

### Coverage Requirements

- **Minimum**: 70% across lines, functions, branches
- **Critical systems**: 90% (Player, PhysicsSystem, InputManager)

---

## Pull Request Process

### Before Submitting

1. **Run checks locally**:
   ```bash
   npm run lint
   npm run type-check
   npm test
   npm run build
   ```

2. **Update documentation** if adding features

3. **Add tests** for new functionality

4. **Update CHANGELOG.md** with your changes

### PR Template

When creating a PR, fill out the template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots or GIFs]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex logic
- [ ] Documentation updated
- [ ] Tests added
```

### Code Review

- PRs require **1 approval** before merging
- Address all review comments
- Keep PRs small (<500 lines changed)
- One PR per feature/fix

---

## Common Tasks

### Adding a New Entity

1. **Create entity class**:
   ```typescript
   // src/entities/NewEntity.ts
   import { Entity } from './Entity';

   export class NewEntity extends Entity {
     constructor(scene: Phaser.Scene, x: number, y: number) {
       super(scene, x, y, 'texture-key');
     }

     update(time: number, delta: number): void {
       // Entity logic
     }
   }
   ```

2. **Add to scene**:
   ```typescript
   // src/scenes/GameScene.ts
   import { NewEntity } from '@entities/NewEntity';

   create(): void {
     this.newEntity = new NewEntity(this, 100, 100);
   }

   update(time: number, delta: number): void {
     this.newEntity.update(time, delta);
   }
   ```

3. **Write tests**:
   ```typescript
   // tests/unit/NewEntity.test.ts
   describe('NewEntity', () => {
     // Tests here
   });
   ```

### Adding a New Component

1. **Create component**:
   ```typescript
   // src/components/NewComponent.ts
   export class NewComponent {
     constructor() {
       // Initialize
     }

     update(delta: number): void {
       // Component logic
     }
   }
   ```

2. **Integrate into entity**:
   ```typescript
   // In Entity class
   private component: NewComponent;

   constructor() {
     this.component = new NewComponent();
   }

   update(time: number, delta: number): void {
     this.component.update(delta);
   }
   ```

### Adding a New Scene

1. **Create scene class**:
   ```typescript
   // src/scenes/NewScene.ts
   import Phaser from 'phaser';
   import { SceneKeys } from '@/config';

   export class NewScene extends Phaser.Scene {
     constructor() {
       super({ key: SceneKeys.NEW_SCENE });
     }

     create(): void {
       // Scene setup
     }

     update(time: number, delta: number): void {
       // Scene logic
     }
   }
   ```

2. **Register in Game.ts**:
   ```typescript
   // src/core/Game.ts
   import { NewScene } from '@scenes/NewScene';

   scene: [BootScene, MainMenuScene, NewScene, GameScene, UIScene]
   ```

3. **Add scene key**:
   ```typescript
   // src/config.ts
   export const SceneKeys = {
     // ...existing keys
     NEW_SCENE: 'NewScene',
   } as const;
   ```

### Debugging Tips

1. **Use Logger instead of console.log**:
   ```typescript
   import { Logger } from '@core/Logger';
   const logger = Logger.getInstance();
   logger.debug('Debug info', { data });
   ```

2. **Enable physics debug**:
   ```typescript
   // src/config.ts
   DEBUG: {
     SHOW_PHYSICS: true,
   }
   ```

3. **Access game instance in browser console**:
   ```javascript
   // In development, game is exposed to window
   window.game.scene.scenes // Access all scenes
   ```

---

## Questions?

If you have questions or need help:

1. Check existing documentation
2. Search closed issues on GitHub
3. Open a new issue with `question` label
4. Contact maintainers

---

**Happy coding!** 🎮
