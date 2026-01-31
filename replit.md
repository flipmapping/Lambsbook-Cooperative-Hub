# Other Path Travel Immigration Services Website

## Overview

This is a multilingual immigration services website for Other Path Travel (in partnership with Glory International), focusing on EB-3 work visa programs and comprehensive immigration services. The application provides information about visa categories, services, success stories, and contact options across 7 languages (English, Vietnamese, Chinese, Japanese, Spanish, French, Portuguese) serving 8 countries (USA, Canada, UK, Australia, Vietnam, Malaysia, Taiwan, China).

**Features:**
- Complete immigration services website with responsive design
- Admin dashboard for enquiry management
- AI-powered customer service chatbot using OpenAI
- Contact form integrated with database storage
- Team member and partner management
- Integration framework for ClickUp, Apollo.ai, Supabase, and Manus.ai
- Notification system for auto-notifications
- Dark/light mode support

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized production builds
- Single-page application (SPA) architecture with client-side routing (wouter)

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

**Routes**
- `/` - Main immigration services website
- `/dashboard` - Admin dashboard for enquiry management

**Key Components**
- `AIChatWidget` - AI-powered customer support chatbot
- `ContactSection` - Contact form with database integration
- `Dashboard` - Admin panel with tabs for enquiries, members, partners, integrations

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- Node.js HTTP server for handling requests
- Middleware for JSON parsing, URL encoding, and request logging

**API Endpoints**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dashboard/stats` | GET | Dashboard statistics |
| `/api/enquiries` | GET/POST | List/Create enquiries |
| `/api/enquiries/:id` | GET/PATCH | Get/Update single enquiry |
| `/api/members` | GET/POST | List/Create team members |
| `/api/members/:id` | GET/PATCH | Get/Update single member |
| `/api/partners` | GET/POST | List/Create partners |
| `/api/partners/:id` | GET/PATCH | Get/Update single partner |
| `/api/countries` | GET/POST | List/Create countries |
| `/api/services` | GET/POST | List/Create services |
| `/api/follow-ups` | GET/POST | List/Create follow-ups |
| `/api/ai/chat` | POST | AI chat endpoint |
| `/api/ai/chat-logs` | GET | Get AI chat logs |
| `/api/integrations` | GET/PUT | Integration configurations |
| `/api/integration-guides` | GET | Get integration setup guides |
| `/api/seed-data` | POST | Seed default data |

**Services**
- `server/services/ai.ts` - OpenAI integration for chatbot and lead scoring
- `server/services/notifications.ts` - Email/SMS notification system
- `server/services/integrations.ts` - ClickUp, Apollo, Supabase, Manus integrations

### Data Storage Solutions

**Database Configuration**
- Drizzle ORM configured for PostgreSQL
- Neon Database serverless driver with WebSocket support
- Schema location: `shared/schema.ts`

**Database Tables**
- `users` - User authentication
- `countries` - Countries served (8 default)
- `services` - Services offered (8 types)
- `members` - Team members with country/service assignments
- `partners` - Partner organizations with unique codes
- `enquiries` - Customer enquiries with status tracking
- `follow_ups` - Enquiry follow-up records
- `notifications` - Email/SMS notification logs
- `ai_conversations` - AI chat session logs
- `site_content` - Dynamic site content
- `integration_configs` - Third-party integration settings
- `activity_logs` - Audit trail for all actions

**Enquiry Statuses**
- `new` - Just received
- `contacted` - Initial contact made
- `in_progress` - Being processed
- `qualified` - Qualified lead
- `converted` - Became a client
- `closed` - Case closed

### External Integrations

**Configured Integrations**
- OpenAI (via Replit AI Integrations) - Customer chatbot and content suggestions
- ClickUp - Task management for enquiry follow-ups (API ready)
- Apollo.io - Lead enrichment and sales intelligence (API ready)
- Supabase - External database sync for members/partners (API ready)
- Manus.ai - AI agent automation (API ready)

**Pending Integrations**
- SendGrid - Email notifications
- Twilio - SMS notifications

### Environment Variables

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `AI_INTEGRATIONS_OPENAI_API_KEY` - OpenAI API key (auto-configured via Replit)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - OpenAI base URL (auto-configured)

**Email Notifications (via SMTP - cPanel compatible):**
- `SMTP_HOST` - SMTP server hostname (e.g., `mail.example.com`)
- `SMTP_PORT` - SMTP port (typically `587` for TLS or `465` for SSL)
- `SMTP_USER` - SMTP username/email address
- `SMTP_PASSWORD` - SMTP password
- `SMTP_FROM_EMAIL` - From email address for notifications
- `SMTP_FROM_NAME` - From name for notifications (default: "Other Path Travel")

**Optional (for integrations):**
- `CLICKUP_API_KEY` - ClickUp integration
- `SUPABASE_URL` - Supabase project URL (for member/partner sync)
- `SUPABASE_KEY` - Supabase API key

**Setup cPanel SMTP:**
1. Log in to cPanel
2. Go to Email Accounts > Mail
3. Find your email account and note the SMTP details
4. Use these in environment variables:
   - Host: mail.yourdomain.com
   - Port: 587 (for STARTTLS) or 465 (for SSL)
   - Username: your full email address
   - Password: your email password

### Key Architectural Decisions

1. **Monorepo Structure**: Client, server, and shared code in single repository with path aliases for clean imports
2. **Type Safety**: End-to-end TypeScript with shared types between frontend and backend
3. **Component Library Choice**: shadcn/ui provides flexibility and customization while maintaining accessibility
4. **Database Strategy**: Drizzle ORM with Neon PostgreSQL serverless for type-safe queries
5. **AI Integration**: OpenAI via Replit integration for customer chatbot and lead scoring
6. **Notification Framework**: Prepared for SendGrid/Twilio with abstracted notification service
7. **Integration Pattern**: Modular integration services for third-party tools

## Lambsbook Agentic Hub (Supabase)

The platform uses Supabase for member management, referral tracking, and earnings distribution.

### Supabase Schema (Canonical - January 2026)

**Enum Types:**
- `membership_status`: free, paid
- `activity_status`: active, inactive
- `collaboration_status`: active, paused
- `linked_by_type`: invitee, invitor, admin
- `revenue_base`: fee, sales, gross_margin
- `trigger_condition`: payment, attendance, completion, conversion
- `tutor_type`: school, freelance, volunteer
- `tutor_status`: unverified, verified, partner_educator
- `earning_status`: pending, paid, paused

**Tables:**

| Table | Purpose |
|-------|---------|
| `members` | Core users with membership status, referral tracking (invitor_id), activity status |
| `collaborations` | Referral relationships (invitee → invitor) with status |
| `programs` | SBU programs with revenue_base and trigger_condition |
| `program_eligibility` | Links members to eligible programs |
| `subscriptions` | Member subscription pricing and renewal tracking |
| `tutors` | Tutor profiles (school/freelance/volunteer) linked to members |
| `earnings` | Commission records with earning_status (pending/paid/paused) |
| `activity_logs` | Member activity tracking |

**Key Constraints:**
- `members.invitor_id` is immutable once set (trigger enforced)
- `collaborations.invitee_id` is unique (one collaboration per member)
- RLS enabled on `members` and `earnings` tables

### SBUs (Strategic Business Units)

1. **SBU 1**: Coffee Shop and Community House (Coming Soon)
2. **SBU 2**: Education Project - Lambsbook.net (Primary Focus)
3. **SBU 4**: Agricultural Products - Gac Puree, Deligac (Active)
4. **SBU 5**: Farmstay Community (Coming Soon)

### Authentication

- Magic Link via Supabase Auth
- Email: support@lambsbook.net (SMTP configured)
- Callback URL: `/auth/callback`

## Recent Changes

**January 2026:**
- **Education Hub is now the primary landing page** - Route "/" shows Lambsbook Hub with Education focus
- Legacy immigration website accessible at /immigration route
- Removed Migration/HR (SBU3) from landing page (4 active SBUs now: Education, Coffee, Agri, Farmstay)
- Coffee Shop and Farmstay SBUs display "Coming Soon" badges and are non-clickable
- Added **Free Trial Usage Limits** for Education Feedback Engine:
  - Anonymous visitors: 3 free uses tracked in localStorage
  - Authenticated members: Unlimited access
  - Uses `useFeedbackUsage` hook with auth detection via localStorage tokens
  - Sign-up prompt displayed when limit reached
- Added AI Feedback Tool promotion section on Education SBU page with link to /hub/education/submit
- YouTube transcript extraction with automatic caption fetching
- Timestamp removal for cleaner AI analysis
- Built partner onboarding prototype with in-memory storage for rapid iteration
- Created PartnerOnboarding page for SBU 2 (Education) and SBU 4 (Agri Products)
- Created AdminRevenueConsole page for managing partner share allocations
- Added API routes: /api/hub/partners, /api/hub/products, /api/hub/value-chain/:sbuId
- Implemented 100% allocation validation for revenue sharing
- Added value chain roles: supplier, processor, packager, distributor, retailer, tutor, school, platform, collaborator, referrer
- Default products seeded: Online Classes ($5/month), Vocational Training, Overseas Study ($1000), Deligac Noodles, Gac Powder
- Added Education Feedback Agent module with Google Drive integration
- Created EducationFeedback page (/hub/education/feedback) for AI-powered student feedback
- Added API routes: /api/education/documents, /api/education/documents/:id/feedback, /api/education/process-all
- Integrated OpenAI for generating structured feedback based on IELTS, Business, Presentation frameworks

**December 2025:**
- Implemented Supabase master schema for Lambsbook Agentic Hub
- Added 5 SBU structure from Grok design document
- Created unified member system with multi-role support
- Built program-specific commission rules with remainder logic
- Added multi-partner product arrangements (supplier, processor, packager)
- Implemented contract-based payment stages for products
- Magic link authentication via Supabase Auth

**November 2025:**
- Added AI-powered customer chatbot widget
- Implemented contact form with database storage
- Created comprehensive admin dashboard with enquiry management
- Set up notification service framework
- Added integration framework for ClickUp, Apollo, Supabase, Manus
- Fixed Neon database WebSocket connection
- Added lead scoring for enquiries
- Implemented activity logging for audit trail
