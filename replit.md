# Tank Reader - Educational Tank Battle Game

## Overview

Tank Reader is an educational game that combines reading comprehension challenges with tank battle gameplay. The application is designed for children ages 5-7 to learn letter recognition, letter sounds, letter combinations, CVC words, sight words, and blend sounds through an engaging arcade-style experience. Players answer reading questions, select tanks, and battle enemies across progressive levels, earning points, unlocking achievements, and advancing through increasingly difficult stages.

## Recent Changes (November 1, 2025)

- **Name Entry & Personalization System**: Added player identification and personalized experience
  - New name_entry phase as first screen when starting the game
  - NameEntry component with form validation (max 20 characters)
  - Player name persists throughout game session and appears in:
    - MenuScreen: "Welcome back, [Name]!"
    - QuizScreen: "[Name], listen carefully!"
    - GameHUD: Player name displayed during gameplay
    - LevelComplete: "EXCELLENT WORK, [NAME]!"
    - GameOver: Personalized win/lose messages
  - Name resets only on full game reset
- **Lesson Points Reset Per Level**: Children must earn 10 new lesson points for each level
  - Lesson points reset to 0 when advancing to next level
  - Ensures educational engagement at every stage
  - Maintains learning focus throughout progression
- **Enhanced Quiz UI for Accessibility**:
  - Audio button enlarged to 80×80px for easier clicking
  - Question text removed above answer options (just show audio button)
  - Cleaner, more focused interface for young learners
  - "[Name], listen carefully!" prompt for personalization
- **Increased Level Difficulty**: Significantly harder progression
  - Enemy count: 5→7→9→10→10 (was 3→4→5→6→6)
  - Enemy health: 55→70→85→100→115 (was 40→50→60→70→80)
  - Enemy speed: 1.0→1.3→1.6→1.9→2.2 (was 0.7→0.9→1.1→1.3→1.5)
  - More challenging gameplay requiring strategic thinking
- **Word-Based Quiz System**: Complete redesign of educational content
  - Replaced all letter recognition questions with 38 word-based questions (2-6 letters)
  - Format: "Which word is CAT?" with similar-looking options (BAT, RAT, HAT)
  - Covers all 26 letters across 5 difficulty levels
  - Text-to-speech now reads just the word (e.g., "cat") instead of the full question
- **Negative Scoring**: Incorrect answers now subtract 1 lesson point (can go negative)
  - Encourages careful reading and listening
  - Maintains 10-point requirement for gameplay access
- **Explosion Effects**: Visual feedback when bullets hit enemies
  - Expanding orange/yellow circles that fade over 500ms
  - Enhances game feel and feedback
- **Lesson Points System**: Implemented educational gate requiring 10 correct quiz answers before gameplay access
  - Added lessonPoints tracking in useTankGame store
  - Quiz screen loops continuously until 10 points earned
  - Visual progress bar and counter displayed at bottom of quiz screen
- **Text-to-Speech Accessibility**: Added Web Speech API integration for non-readers
  - Purple speaker button (🔊) on quiz questions reads words aloud
  - Slowed speech rate (0.8x) optimized for children
  - Auto-cleanup prevents audio overlap and lingering playback
- **Bug Fixes**:
  - Fixed spacebar cannon firing with refactored bullet creation logic
  - Fixed quiz progression to properly advance after reaching 10 points
  - Fixed health bar display with explicit green indicator styling using div-based progress meter
- **High Score System**: Added localStorage-based high score persistence displayed prominently on the menu screen
- **Expanded Educational Content**: Added 16 new questions covering CVC words (cat, dog, pig), sight words (the, and, you, see, play), and blend sounds (bl, cr, st, tr, fl, gr)
- **Achievement System**: Implemented 10 achievements tracking learning milestones:
  - First Steps: Answer first question
  - Quiz Master: Get 100% on a single quiz
  - Getting Started: Reach level 3
  - Almost There: Reach level 5
  - Victory!: Beat all 5 levels
  - Learning Leader: 10 correct answers
  - Point Collector: Score 1000 points
  - High Scorer: Score 5000 points
  - Tank Commander: Defeat 10 enemies
  - Power Player: Collect 5 power-ups
- **Power-Up System**: Health packs, rapid fire, and speed boosts spawn randomly during gameplay (20% chance per level)
- **Progress Tracking**: Enhanced stat tracking including enemies defeated, power-ups collected, per-quiz accuracy, and lifetime accuracy

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript running on Vite
- **UI Components**: Radix UI primitives with custom shadcn/ui components for consistent, accessible interface elements
- **3D Graphics**: React Three Fiber (@react-three/fiber) for WebGL-based 3D rendering with orthographic camera for 2D-style gameplay
- **State Management**: Zustand with subscribeWithSelector middleware for reactive game state management
- **Styling**: Tailwind CSS with custom theme configuration supporting dark mode and CSS variables
- **Input Handling**: @react-three/drei KeyboardControls for game controls (WASD/Arrow keys + Space)

**Key Design Decisions**:
- Monorepo structure with separate `client/` and `server/` directories
- Path aliases (@/ and @shared/) for clean imports across frontend and shared code
- GLSL shader support via vite-plugin-glsl for potential visual effects
- Asset support for 3D models (.gltf, .glb) and audio files (.mp3, .ogg, .wav)

### Game State Management

**Primary Stores** (Zustand):
- `useTankGame`: Main game state including phases, levels, score, high score, player/enemy positions, bullets, questions, answers, power-ups, and stat tracking (enemies defeated, power-ups collected, per-quiz/lifetime accuracy)
- `useAchievements`: Achievement system with 10 milestones, localStorage persistence, and progress tracking
- `useAudio`: Audio state management for background music, sound effects, and mute toggle
- `useGame`: Generic game phase controller (appears to be legacy, tank-specific store is primary)

**Game Flow**:
1. Menu → Quiz (reading challenge) → Tank Selection → Playing → Level Complete/Game Over
2. Progressive difficulty with enemy count and speed increasing per level
3. Real-time physics updates via useFrame hook from React Three Fiber

### Backend Architecture

**Server Framework**: Express.js with TypeScript (ESM modules)
- **Development**: tsx for TypeScript execution in development
- **Production**: esbuild bundling with ESM output format
- **Middleware**: JSON body parsing, URL-encoded form data, custom request logging

**Routing Strategy**:
- Routes registered through `registerRoutes` function
- API routes prefixed with `/api`
- Request/response logging with duration tracking and JSON response capture (truncated at 80 characters)

**Storage Interface**:
- Abstract `IStorage` interface defining CRUD operations
- `MemStorage` class implementing in-memory storage for users
- Designed for easy swap to database implementation (Drizzle ORM configuration present)

**Development Setup**:
- Vite dev server running in middleware mode with HMR over HTTP server
- Custom error overlay via @replit/vite-plugin-runtime-error-modal
- Static file serving in production from `dist/public`

### External Dependencies

**Database**: 
- **Drizzle ORM** configured for PostgreSQL dialect with @neondatabase/serverless driver
- Schema defined in `shared/schema.ts` with users table (id, username, password)
- Migrations output to `./migrations` directory
- Zod integration for type-safe insert schemas
- **Note**: Database connection configured via `DATABASE_URL` environment variable but actual implementation uses in-memory storage currently

**Third-Party Services**:
- **Neon Database**: Serverless PostgreSQL hosting (configured but not actively used)
- **Font Assets**: Inter font family via @fontsource/inter

**Key Libraries**:
- **React Three Ecosystem**: @react-three/fiber, @react-three/drei, @react-three/postprocessing for 3D rendering
- **UI Components**: Full Radix UI component suite for accessible, unstyled primitives
- **Form/Data Validation**: Zod with react-hook-form integration
- **Query Management**: @tanstack/react-query for server state (configured but minimal API usage currently)
- **Styling Utilities**: clsx, tailwind-merge for conditional class composition
- **Date Handling**: date-fns for date manipulation

**Audio System**:
- HTML5 Audio API with manual sound management
- Three audio assets expected: background.mp3, hit.mp3, success.mp3 in `/public/sounds/`
- Muted by default with user toggle control

**Build & Development Tools**:
- Vite for frontend bundling with React plugin
- esbuild for server bundling
- TypeScript with strict mode enabled
- PostCSS with Tailwind CSS and Autoprefixer
- Drizzle Kit for database migrations and schema management