# Tank Reader - Educational Tank Battle Game

## Overview
Tank Reader is an educational game combining reading comprehension challenges with tank battle gameplay, designed for children aged 4-7 across two difficulty levels. "Learning Letters" mode (age 4) focuses on letter recognition with audio-based letter identification. "Word Recognition" mode (ages 5-7) teaches CVC words, sight words, and blend sounds through typing and multiple-choice quizzes. The game features engaging arcade-style battles across progressive levels, where players earn points, unlock achievements, and advance through increasing difficulty. The project aims to provide an interactive and fun learning experience with a personalized touch.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The game features a personalized experience, welcoming players by name and displaying it in various game screens. The quiz UI is designed for accessibility with enlarged audio buttons and clear prompts. Visuals are 2D-style pixel art rendered in 3D space, including custom tank sprites, desert backgrounds, and terrain with 12-segment cosine curves for hills. Camera zoom is set to 70 for an intimate gameplay view, with adjusted dampening and horizontal lead for smooth tracking. Explosion effects provide visual feedback during battles.

### Technical Implementations
*   **Frontend**: React 18 with TypeScript and Vite, utilizing React Three Fiber for WebGL-based 3D rendering with an orthographic camera. Radix UI primitives and custom shadcn/ui components ensure a consistent and accessible interface. Styling is managed with Tailwind CSS, supporting dark mode and CSS variables. Input handling uses `@react-three/drei`'s KeyboardControls.
*   **State Management**: Zustand is used for reactive game state, managing game phases, levels, score, player/enemy positions, questions, answers, and various stats. A separate store handles achievements with localStorage persistence.
*   **Backend**: Express.js with TypeScript, designed for scalability with an abstract `IStorage` interface for easy database swapping (currently using in-memory storage, configured for Drizzle ORM). Routing is modular, and server-side bundling is handled by esbuild.
*   **Game Mechanics**:
    *   **Difficulty Levels**: Two distinct learning paths - "Learning Letters" (age 4) and "Word Recognition" (ages 5-7), selected at the name entry screen and persisting across all levels.
    *   **Three Quiz Modes**: 
        *   Letter Sounds (for "Learning Letters"): Displays 9 letters in a 3x3 grid, speaks a letter name, and asks the player to click the matching letter. Requires 3 correct answers to advance.
        *   Multiple-Choice (for "Word Recognition"): Shows 3-9 word options with audio playback.
        *   Typing (for "Word Recognition"): Players type the word they hear.
    *   **Progressive Difficulty**: Enemy counts, health, and speed increase across five levels. Lesson points required to advance also increase per level (5 to 9) for word recognition mode.
    *   **Horizontal Tank Battles**: Player on the left, enemies on the right, shooting horizontally.
    *   **Word-Based Quiz System**: Dynamic question generation from an expanded word bank of 250 words for word recognition, and A-Z letter pool for letter learning, with randomized answer options.
    *   **Adaptive Scoring**: Letter mode requires 3 correct answers with no negative scoring. Word recognition uses lesson points with negative scoring for incorrect answers.
    *   **Text-to-Speech**: Web Speech API integration reads quiz content aloud - letter names for letter mode, words for word recognition mode - with optimized speed and natural pitch, personalized with player's name.
    *   **Achievements & High Score**: A system tracks 10 learning milestones and persists high scores locally.
    *   **Power-Up System**: Health packs, rapid fire, and speed boosts randomly spawn during gameplay.

### System Design Choices
*   **Monorepo Structure**: Organizes frontend and backend code within `client/` and `server/` directories, with shared code and path aliases for clean imports.
*   **Educational Gates**: Players must earn a certain number of lesson points by answering quiz questions correctly before proceeding to tank battles, ensuring educational engagement.
*   **Accessibility**: Enhanced UI elements, text-to-speech, and personalized prompts cater to young learners.
*   **Scalability**: Backend design with an abstract storage interface allows for future integration with various databases.

## External Dependencies

*   **Database**: Drizzle ORM configured for PostgreSQL (via `@neondatabase/serverless` driver) for schema definition, but currently uses in-memory storage.
*   **Font Assets**: Inter font family via `@fontsource/inter`.
*   **Audio System**: HTML5 Audio API for background music and sound effects, with assets expected in `/public/sounds/`.
*   **Key Libraries**:
    *   **React Three Ecosystem**: `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`.
    *   **UI Components**: Radix UI.
    *   **Form/Data Validation**: Zod with React Hook Form.
    *   **Query Management**: `@tanstack/react-query` (configured for potential future API usage).
    *   **Styling Utilities**: `clsx`, `tailwind-merge`.
    *   **Date Handling**: `date-fns`.
*   **Build & Development Tools**: Vite, esbuild, TypeScript, PostCSS, Drizzle Kit.