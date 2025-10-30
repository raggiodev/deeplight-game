# DeepLight

Indie 2D metroidvania game built with TypeScript and Phaser 3 made by Raggiodev.

## 🎮 Features (Milestone 1)

- ✅ TypeScript + Phaser 3 game engine
- ✅ Player movement (acceleration-based with friction)
- ✅ Jump mechanics (variable jump height, coyote time, jump buffering)
- ✅ Custom physics system with AABB collision
- ✅ Tilemap support for level design
- ✅ Smooth camera following
- ✅ Unified input system (keyboard, gamepad ready)
- ✅ Debug overlay with FPS counter
- ✅ Professional development tooling (ESLint, Prettier, Vitest)
- ✅ CI/CD pipeline with GitHub Actions

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/raggiodev/deeplight-game.git
cd deeplight-game

# Install dependencies
npm install
```

### Development

```bash
# Start development server with hot reload
npm run dev

# Open browser at http://localhost:3000
```

### Build

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Code Quality

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Type check
npm run type-check
```

## 🎯 Controls

### Keyboard
- **A / Left Arrow**: Move left
- **D / Right Arrow**: Move right
- **Space / W / Up Arrow**: Jump
- **ESC**: Pause (not implemented yet)

### Gamepad
- **D-Pad / Left Stick**: Move
- **A Button (Xbox) / X Button (PS)**: Jump

## 📁 Project Structure

```
src/
├── core/           # Core game systems
│   ├── Game.ts            # Phaser game bootstrap
│   ├── InputManager.ts    # Unified input handling
│   ├── EventBus.ts        # Global event system
│   └── Logger.ts          # Logging utility
├── scenes/         # Game scenes
│   ├── BootScene.ts       # Asset loading
│   ├── MainMenuScene.ts   # Main menu
│   ├── GameScene.ts       # Main gameplay
│   └── UIScene.ts         # HUD overlay
├── entities/       # Game entities
│   ├── Entity.ts          # Base entity class
│   └── Player.ts          # Player controller
├── components/     # Entity components
│   ├── MovementComponent.ts
│   └── PhysicsComponent.ts
├── systems/        # Game systems
│   ├── PhysicsSystem.ts   # Custom physics
│   └── CameraSystem.ts    # Camera control
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── ui/             # UI components
```

## 🏗️ Architecture

This project follows indie 2D metroidvania game development practices:

- **Component-Based Architecture**: Entities are composed of reusable components
- **System-Driven Logic**: Game logic is separated into focused systems
- **Event-Driven Communication**: Decoupled systems communicate via EventBus
- **Type-Safe**: Strict TypeScript for compile-time safety
- **Testable**: Unit tests for critical game logic
- **Scalable**: Clear separation of concerns for easy feature addition

## 🧪 Testing

The project uses Vitest for unit testing with the following coverage requirements:
- Lines: 70%
- Functions: 70%
- Branches: 70%
- Statements: 70%

Run tests with:
```bash
npm test
```

## 🔧 Technology Stack

- **Language**: TypeScript 5.3+
- **Game Engine**: Phaser 3.80+
- **Build Tool**: Vite 5+
- **Testing**: Vitest + JSDOM
- **Linting**: ESLint (Airbnb + TypeScript)
- **Formatting**: Prettier
- **CI/CD**: GitHub Actions

## 📝 Development Roadmap

### Milestone 1: Base Setup ✅ (Current)
- [x] Repository and build system
- [x] Input management
- [x] Player movement and physics
- [x] Camera system
- [x] Basic level with platforms
- [x] CI/CD pipeline

### Milestone 2: Core Mechanics (Next)
- [ ] Advanced movement (wall jump, dash)
- [ ] Collision refinement (slopes, one-way platforms)
- [ ] Checkpoint system
- [ ] Health system
- [ ] HUD implementation

### Milestone 3: Combat & Enemies
- [ ] Player attack system
- [ ] Enemy AI (patrol, chase, attack)
- [ ] Damage calculation
- [ ] Death and respawn

### Milestone 4: World & Progression
- [ ] Room transitions
- [ ] Ability unlocks
- [ ] Interconnected map
- [ ] Backtracking gates

### Milestone 5: Polish & Deployment
- [ ] Audio system
- [ ] Mobile touch controls
- [ ] Animations
- [ ] Production deployment

### Milestone 6: Bosses & Content (Stretch)
- [ ] Boss encounters
- [ ] Save system
- [ ] Map system

## 🤝 Contributing

Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) for development workflow and coding standards.

## 📄 License

This project is licensed under the MIT License.

## 🎨 Assets

Currently using placeholder graphics. Final assets will be added in later milestones.

## 🐛 Known Issues

None at this time. Please report issues on GitHub.

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Current Version**: 0.1.0 (Milestone 1)  
**Last Updated**: 2025
