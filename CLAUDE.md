# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in a chat interface, and Claude AI generates React components with Tailwind CSS styling. Components are rendered in a live preview using a virtual file system (no files written to disk).

## Key Commands

### Setup
```bash
npm run setup          # Install deps, generate Prisma client, run migrations
```

### Development
```bash
npm run dev            # Start Next.js dev server with Turbopack
npm run dev:daemon     # Start dev server in background, logs to logs.txt
```

### Testing
```bash
npm test               # Run all tests with Vitest
```

### Database
```bash
npx prisma generate    # Generate Prisma client after schema changes
npx prisma migrate dev # Create and apply new migration
npm run db:reset       # Reset database (WARNING: deletes all data)
```

### Build & Lint
```bash
npm run build          # Build for production
npm run lint           # Run ESLint
```

## Architecture

### Virtual File System (VFS)

The core of the application is the `VirtualFileSystem` class in `src/lib/file-system.ts`. This implements an in-memory file system that:
- Stores all generated code in memory (Map-based structure)
- Provides POSIX-like file operations (create, read, update, delete, rename)
- Serializes to/from JSON for database persistence
- Is shared between the AI chat context and preview rendering

**Key points:**
- All paths are normalized (start with `/`, no trailing slashes except root)
- Parent directories are auto-created when needed
- The VFS is serialized and sent with each chat request so the AI can view/modify files

### AI Integration Flow

1. **Chat API Route** (`src/app/api/chat/route.ts`):
   - Receives messages + serialized VFS from client
   - Reconstructs VFS from serialized data
   - Provides AI with two tools:
     - `str_replace_editor`: View, create, edit files (str_replace, insert operations)
     - `file_manager`: Rename and delete files/directories
   - Streams responses back to client
   - On completion, saves messages + VFS to database for authenticated users

2. **AI Provider** (`src/lib/provider.ts`):
   - Uses Claude Haiku 4.5 if `ANTHROPIC_API_KEY` is set
   - Falls back to `MockLanguageModel` if no API key (generates static demo components)
   - Mock provider is stateful and progresses through steps based on tool message count

3. **Context Architecture**:
   - `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`): Manages VFS state, triggers UI refreshes
   - `ChatContext` (`src/lib/contexts/chat-context.tsx`): Wraps Vercel AI SDK's `useChat`, handles tool calls
   - Tool calls from AI are intercepted and applied to the VFS, triggering preview updates

### Preview Rendering

The preview system (`src/components/preview/PreviewFrame.tsx` + `src/lib/transform/jsx-transformer.ts`) is sophisticated:

1. **Transform Process**:
   - Transforms all JSX/TSX files using Babel standalone
   - Detects and extracts CSS imports from JS/TS files
   - Creates blob URLs for transformed code
   - Builds an import map with:
     - React/React-DOM from esm.sh CDN
     - Local files as blob URLs
     - `@/` alias support (maps to root `/`)
     - Third-party packages from esm.sh
   - Collects all CSS content into a single style block

2. **Preview Iframe**:
   - Uses `srcdoc` with import maps for module resolution
   - Includes Tailwind CSS via CDN (`https://cdn.tailwindcss.com`)
   - Sandboxed with `allow-scripts allow-same-origin allow-forms`
   - Error boundary for runtime errors
   - Shows syntax errors inline if transform fails

3. **Entry Point**:
   - Looks for `/App.jsx` (or .tsx) as the main entry point
   - Falls back to other common patterns (index.jsx, src/App.jsx, etc.)
   - Entry point must export a React component as default

### Database Schema

**The database schema is defined in `prisma/schema.prisma`. Reference this file anytime you need to understand the structure of data stored in the database.**

Prisma with SQLite:
- **User**: Email/password authentication with bcrypt
- **Project**: Belongs to User (optional - supports anonymous work)
  - `messages`: JSON-serialized chat history
  - `data`: JSON-serialized VFS state
  - Auto-saved after each AI response (authenticated users only)

Prisma client is generated to `src/generated/prisma` (custom output path).

### Authentication

JWT-based auth (`src/lib/auth.ts`):
- Sessions stored in HTTP-only cookies
- 7-day expiration
- JWT secret from `JWT_SECRET` env var (defaults to development key)
- Anonymous work tracking via `src/lib/anon-work-tracker.ts` (localStorage)

### Generation Prompt

The system prompt (`src/lib/prompts/generation.tsx`) instructs the AI to:
- Create React components using Tailwind CSS (no hardcoded styles)
- Always create `/App.jsx` as the entry point (default export)
- Use `@/` import alias for local files (e.g., `import Foo from '@/components/Foo'`)
- Keep responses brief unless asked to summarize

## Important Conventions

### File Paths
- All VFS paths start with `/` (absolute from root)
- Use `@/` alias in imports: `import Foo from '@/components/Foo'`
- Extensions can be omitted in imports (transformer handles resolution)

### Component Structure
- `/App.jsx` is the required entry point
- Components typically live in `/components/`
- Must export components as default exports

### Testing
- Tests use Vitest with jsdom environment
- Located in `__tests__` directories next to source files
- Testing Library (React) for component tests

### Mock Provider Behavior
- Without API key, generates static demo components (Counter, Form, or Card)
- Progresses through 4 steps: create App.jsx → create component → enhance component → finish
- Uses tool message count to track progress
- Keep maxSteps low (4) to prevent repetition

### Code Style
- Use comments sparingly - only comment complex code that isn't self-explanatory
- Prefer clear variable/function names over comments when possible

## Common Gotchas

1. **VFS State Management**: The VFS is reconstructed from scratch on each API request. The serialized state must be kept in sync between client and server.

2. **Import Resolution**: The transformer must handle:
   - Relative imports (`./Foo`, `../Bar`)
   - Absolute imports (`/components/Foo`)
   - Alias imports (`@/components/Foo`)
   - Third-party packages (esm.sh)
   - Missing imports (creates placeholders to prevent errors)

3. **CSS Handling**: CSS imports are extracted from JS/TS files and injected as inline `<style>` tags in the preview HTML. The import statements are removed from transformed code.

4. **Blob URL Lifecycle**: Blob URLs are recreated on every preview update. No cleanup needed as old URLs are garbage collected.

5. **Authentication Edge Cases**: Anonymous users can generate components but won't have persistence. If they sign up/in, they can create a new project and the localStorage work is offered for restoration.

## Environment Variables

Required in `.env`:
```
ANTHROPIC_API_KEY=sk-...  # Optional - uses mock provider if missing
JWT_SECRET=...             # Optional - defaults to dev secret
```
