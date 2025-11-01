# Tank Reader - Educational Tank Battle Game

## Overview

Tank Reader is an educational game that combines reading comprehension challenges with tank battle gameplay. The application is designed for children ages 5-7 to learn letter recognition, letter sounds, and letter combinations through an engaging arcade-style experience. Players answer reading questions, select tanks, and battle enemies across progressive levels, earning points and advancing through increasingly difficult stages.

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
- `useTankGame`: Main game state including phases, levels, score, player/enemy positions, bullets, questions, and answers
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