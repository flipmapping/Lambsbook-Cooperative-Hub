# Other Path Travel Immigration Services Website

## Overview

This is a multilingual immigration services website for Other Path Travel (in partnership with Glory International), focusing on EB-3 work visa programs and comprehensive immigration services. The application provides information about visa categories, services, success stories, and contact options across 7 languages (English, Vietnamese, Chinese, Japanese, Spanish, French, Portuguese).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized production builds
- Single-page application (SPA) architecture with client-side routing

**UI Component System**
- shadcn/ui component library with Radix UI primitives for accessible, customizable components
- Tailwind CSS for utility-first styling with custom design tokens
- Design system follows "new-york" style variant with neutral base colors
- Custom CSS variables for theming (light/dark mode support)
- Responsive design with mobile-first approach

**State Management**
- React Query (@tanstack/react-query) for server state management and caching
- React Context API for global state (Language, Theme)
- Local component state with React hooks

**Internationalization (i18n)**
- Custom context-based translation system supporting 7 languages
- Language switcher component with native language names
- Translation keys stored in centralized i18n configuration

**Component Structure**
- Modular component architecture with clear separation of concerns
- Section-based components (Hero, EB3Categories, Services, Countries, etc.)
- Reusable UI primitives (Button, Card, Dialog, etc.)
- Example components for development/testing purposes

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- Node.js HTTP server for handling requests
- Middleware for JSON parsing, URL encoding, and request logging

**Development vs Production**
- Development: Vite middleware integration for HMR
- Production: Static file serving from pre-built dist directory
- Environment-aware configuration

**Storage Layer**
- In-memory storage implementation (MemStorage) as default
- Interface-based storage design for easy database integration
- User management with basic CRUD operations

**Session Management**
- Prepared for session handling (connect-pg-simple dependency present)
- Currently minimal user authentication implementation

### Data Storage Solutions

**Database Configuration**
- Drizzle ORM configured for PostgreSQL
- Neon Database serverless driver (@neondatabase/serverless)
- Schema location: `shared/schema.ts`
- Migration output directory: `./migrations`

**Current Schema**
- Basic user table with UUID primary keys, username, and password fields
- Zod validation schemas for type-safe data insertion

**Design Pattern**
- Database connection URL from environment variable (DATABASE_URL)
- Shared schema between client and server for type consistency
- Prepared for Postgres but database may not be provisioned yet

### External Dependencies

**UI & Styling**
- Radix UI component primitives (accordion, dialog, dropdown, select, etc.)
- Tailwind CSS with PostCSS for processing
- class-variance-authority for component variant management
- clsx/tailwind-merge for conditional class composition

**Data & Validation**
- zod for runtime type validation
- drizzle-zod for database schema validation
- react-hook-form with @hookform/resolvers for form management

**Development Tools**
- TypeScript for static type checking
- ESBuild for server bundling (production builds)
- Replit-specific plugins for development experience

**Asset Management**
- Static images stored in `attached_assets` directory
- Separate folders for generated images vs stock images
- Image imports via Vite alias system

**Utilities**
- date-fns for date manipulation
- nanoid for unique ID generation
- lucide-react for icons
- react-icons for brand icons (social media)

**Key Architectural Decisions**

1. **Monorepo Structure**: Client, server, and shared code in single repository with path aliases for clean imports
2. **Type Safety**: End-to-end TypeScript with shared types between frontend and backend
3. **Component Library Choice**: shadcn/ui provides flexibility and customization while maintaining accessibility
4. **Database Strategy**: Drizzle ORM chosen for type-safe queries and migrations; prepared for PostgreSQL but adaptable
5. **Build Strategy**: Separate Vite build for client, ESBuild for server to optimize cold start times
6. **i18n Approach**: Custom lightweight solution rather than heavy library for better control and performance