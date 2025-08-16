# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `pnpm install` - Install dependencies
- `pnpm dev` - Start development server on port 3000
- `pnpm start` - Alias for dev command
- `pnpm build` - Build for production (runs vite build && tsc)
- `pnpm serve` - Preview production build

### Code Quality
- `pnpm lint` - Run Biome linter
- `pnpm format` - Format code with Biome
- `pnpm check` - Run comprehensive Biome checks
- `pnpm test` - Run Vitest test suite

### Testing
- `pnpm test` - Run all tests with Vitest

## Project Architecture

### Tech Stack
- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **Routing**: TanStack Router with file-based routing
- **State Management**: Zustand for global state
- **Data Fetching**: TanStack Query for server state
- **Forms**: TanStack Forms with Zod validation
- **Styling**: Tailwind CSS 4.0 with shadcn/ui components
- **Testing**: Vitest with jsdom environment
- **Code Quality**: Biome for linting and formatting

### Key Directories
- `src/routes/` - File-based routing with TanStack Router
- `src/components/` - Reusable React components
- `src/components/ui/` - shadcn/ui base components
- `src/lib/` - Utility libraries and services
- `src/store/` - Zustand state stores
- `src/hooks/` - Custom React hooks

### Authentication System
The project implements dual authentication for both Moodle and UMIS systems:

#### Moodle Authentication (`src/lib/auth.ts`)
- Uses Moodle web service API with mobile app service
- Stores JWT tokens in localStorage
- Integrates with Zustand store (`src/store/authStore.ts`)
- Proxy configured in vite.config.ts for `/moodle-api/*`

#### UMIS Authentication (`src/lib/umisAuth.ts`)
- RSA encryption for password security using node-forge
- Token management with auto-refresh capabilities
- Multiple credential support via token store (`src/store/tokenStore.ts`)
- Proxy configured in vite.config.ts for `/umis-api/*`

### API Proxies
The Vite development server is configured with proxies:
- `/moodle-api/*` → `https://lms.snuchennai.edu.in`
- `/umis-api/*` → `https://umisapi.tnega.org`

### State Management Pattern
- **AuthStore**: Handles Moodle authentication state with persistence
- **TokenStore**: Manages UMIS tokens with auto-refresh and multiple credentials
- Both stores use Zustand with persistence middleware

### Component Architecture
- **Protected Routes**: `ProtectedRoute.tsx` and `UMISProtectedRoute.tsx` for auth guards
- **Form Components**: Use TanStack Forms with Zod validation
- **UI Components**: shadcn/ui components with Tailwind CSS styling
- **Dashboard Components**: Token management and credential handling

### Configuration Files
- `biome.json` - Biome configuration with tab indentation and double quotes
- `vite.config.ts` - Vite configuration with TanStack Router plugin and API proxies
- `vitest.config.ts` - Testing configuration with jsdom environment
- `components.json` - shadcn/ui component configuration
- `tsconfig.json` - TypeScript configuration with path aliases

### Development Notes
- The project uses file-based routing - add new routes in `src/routes/`
- Auto-generated route tree at `src/routeTree.gen.ts` (excluded from Biome linting)
- All components follow TypeScript strict mode
- Authentication tokens are stored in localStorage with auto-refresh logic
- The application supports both individual and batch UMIS token generation

### Important Files
- `AUTH_IMPLEMENTATION.md` - Detailed authentication implementation guide
- `Public.pem` - RSA public key for UMIS password encryption
- `src/main.tsx` - Application entry point with providers setup
- `UMIS_FORM_ANALYSIS.md` - Complete UMIS dashboard form analysis and implementation gap

### UMIS Dashboard Integration Status
Current implementation covers **only 17%** of UMIS dashboard functionality:

**✅ Implemented:**
- EMIS verification API integration
- Basic General Information fields (11/17 fields)
- Token-based authentication
- Community/Caste dropdown APIs

**❌ Critical Missing Components (83%):**
- 6-tab wizard form structure (currently single page)
- Contact Information tab (addresses, mobile, email)
- Family Information tab (parents, income, occupation)
- Bank Information tab (account details, IFSC)
- Academic Information tab (course, admission details)
- Completion workflow and form submission
- Missing General Info fields: State Name, First Graduate status, Special Quota, Differently Abled, Aadhaar OTP

**Next Implementation Priority:**
1. Restructure forms.tsx to 6-tab wizard layout
2. Add missing General Information fields
3. Implement Contact Information tab with address components
4. Complete form validation and state management across tabs