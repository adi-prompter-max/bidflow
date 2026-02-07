# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-06)

**Core value:** SMEs can go from "here's a relevant tender" to "here's a ready-to-submit bid document" without needing procurement expertise or consultants.
**Current focus:** Phase 2 - Company Profiling

## Current Position

Phase: 3 of 6 (Tender Discovery)
Plan: 1 of 4 (in progress)
Status: In progress
Last activity: 2026-02-07 — Completed 03-01-PLAN.md (Tender Data Foundation)

Progress: [█████░░░░░] ~42%

## Performance Metrics

**Velocity:**
- Total plans completed: 8
- Average duration: 4.0 min
- Total execution time: 0.53 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 3 | 15min | 5min |
| 2 | 4 | 14min | 3.5min |
| 3 | 1 | 4min | 4min |

**Recent Trend:**
- Last 5 plans: 4min, 4min, 3min, 4min (current)
- Trend: Excellent velocity, consistent 4min average

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Mock all external APIs for MVP (TED API, AI models)
- Export-only for MVP (no direct tender submission)
- Content validation over structural formatting
- Target IT & Construction sectors first
- **[01-01]** Downgraded Prisma 7 to Prisma 6 due to blocking configuration issues with datasource URL
- **[01-01]** Installed PostgreSQL@17 via Homebrew as critical missing dependency
- **[01-01]** Using Tailwind CSS v4 with CSS-based configuration instead of v3 config file
- **[01-02]** Using JWT session strategy instead of database sessions (Auth.js v5 credentials provider limitation)
- **[01-02]** Split config pattern: auth.config.ts (edge-compatible) for middleware, auth.ts (full) for app
- **[01-02]** Defense-in-depth: middleware for UX redirects, DAL for actual security verification
- **[01-03]** Dashboard uses DAL verifySession() for security (not relying on middleware)
- **[01-03]** Landing page conditionally renders based on auth state (dashboard link if logged in, CTAs if not)
- **[01-03]** Header logout uses form-based server action submission for progressive enhancement
- **[02-01]** Stored sectorSubcategories as Json field for flexible hierarchical data
- **[02-01]** Used prisma db push --accept-data-loss for development (avoiding migration conflicts)
- **[02-01]** Wizard validation granularity: separate Zod schema for each wizard step
- **[02-02]** Added @unique constraint to Company.ownerId for upsert pattern (enables auto-save)
- **[02-02]** Auto-save on blur for text inputs, auto-save on change for selections (500ms debounce)
- **[02-02]** URL synchronization with window.history.replaceState to avoid page reloads
- **[02-03]** Tag input normalizes tags (trim, lowercase) for consistency
- **[02-03]** Certifications use inline forms, projects use modal dialog based on form complexity
- **[02-03]** z.number() instead of z.coerce.number() for yearCompleted to avoid TypeScript type issues
- **[02-04]** Completeness card visible even at 100% completion (serves as quick profile overview)
- **[02-04]** Wizard Finish redirects to /dashboard/profile for immediate profile review
- **[02-04]** Profile page edit links use query params (?step=N) for direct wizard navigation
- **[02-04]** Used date-fns for certification date formatting
- **[03-01]** Pass prisma instance to seedTenders() to avoid multiple connections
- **[03-01]** Load .env.local explicitly in seed.ts using dotenv config for DATABASE_URL
- **[03-01]** Redistribute scoring weights when company has no projects (sector 50%, tags 50%)
- **[03-01]** Case-insensitive tag matching for better relevance scoring
- **[03-01]** Always filter to OPEN status tenders in query layer

### Pending Todos

None yet.

### Blockers/Concerns

- **[01-01]** Prisma 6 is deprecated; will need to migrate to Prisma 7+ once configuration issues are resolved
- **[01-01]** .env.local contains real secrets; must remain gitignored

## Session Continuity

Last session: 2026-02-07 01:19 (plan 03-01 execution)
Stopped at: Completed 03-01-PLAN.md (Tender Data Foundation)
Resume file: None
Next: Continue Phase 3 plans

---
*State initialized: 2026-02-06*
*Next step: /gsd:plan-phase 1*
