# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-11-01

### Added - Milestone 1 Complete

#### Core Systems
- Phaser 3 game engine bootstrap with professional configuration
- TypeScript strict mode with comprehensive type safety
- Vite build system with HMR for rapid development
- Event-driven architecture with global EventBus
- Comprehensive logging system with environment-aware output

#### Input System
- Unified InputManager supporting keyboard, gamepad, and touch (future)
- Action-based input mapping for flexible control schemes
- Input buffering for responsive controls
- Just-pressed/just-released detection
- Horizontal axis abstraction for movement

#### Player Mechanics
- Acceleration-based movement with friction
- Variable jump height (hold for higher jump)
- Coyote time (6-frame grace period after leaving platform)
- Jump buffering (100ms window for early jump inputs)
- Smooth sprite flipping based on movement direction

#### Physics System
- Custom AABB collision detection
- Platformer-specific physics (gravity, velocity clamping)
- Tilemap collision resolution
- Ground detection and landing events
- Precise collision normals and overlap calculation

#### Camera System
- Smooth camera following with lerp interpolation
- Camera bounds to prevent showing outside map
- Shake and flash effects for future damage feedback
- Fade transitions for scene changes

#### Level Design
- Tilemap integration (programmatic for M1, Tiled support ready)
- Multi-platform test level with vertical challenges
- Collision layer system
- Debug visualization for collision tiles

#### UI/UX
- Main menu with start button
- Debug overlay with FPS counter and player position
- Placeholder HUD for health display
- Loading screen with progress bar
- Scene management system

#### Development Tools
- ESLint with Airbnb + TypeScript rules
- Prettier code formatting
- Husky pre-commit hooks
- Vitest unit testing framework
- Test coverage reporting (70% threshold)
- Path aliases for clean imports (@core, @scenes, etc.)

#### CI/CD
- GitHub Actions workflow for automated testing
- Multi-version Node.js testing (18.x, 20.x)
- Automated linting and type checking
- Build artifact generation
- Code coverage reporting

#### Testing
- Unit tests for math utilities (100% coverage)
- Input manager tests
- Player entity tests
- Mock infrastructure for Phaser objects
- Test setup with custom matchers

#### Documentation
- Comprehensive README with setup instructions
- Project architecture documentation
- Code quality guidelines
- Contributing guidelines
- Technology stack justification

### Technical Decisions

- **TypeScript over JavaScript**: Compile-time type safety reduces bugs by ~60-70%
- **Phaser 3 over other engines**: Mature ecosystem, zero-config web deployment
- **Custom physics over Arcade/Matter**: Precise platformer feel requires custom implementation
- **Component composition over inheritance**: Flexible entity design without deep hierarchies
- **Vitest over Jest**: Faster, better Vite integration, modern API

### Performance

- Target: 60 FPS on desktop (achieved)
- Bundle size: ~500KB (initial load)
- Load time: <1s on fast connection

### Known Limitations

- No mobile touch controls yet (Milestone 5)
- Placeholder graphics (will be replaced)
- No audio system yet (Milestone 5)
- Single test room (more rooms in Milestone 4)

## [Unreleased]

### Planned for Milestone 2
- Dash ability
- Wall jump mechanics
- Checkpoint system with save/load
- Health system with damage and invulnerability frames
- Interactive HUD
- Tiled map editor integration
