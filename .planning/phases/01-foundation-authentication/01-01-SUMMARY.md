---
phase: 01-foundation-authentication
plan: 01
subsystem: database
tags: [nextjs, prisma, postgresql, typescript, tailwind, shadcn, bcrypt, auth.js]

# Dependency graph
requires:
  - phase: none
    provides: "Initial project setup"
provides:
  - "Next.js 16 project with TypeScript and Tailwind CSS v4"
  - "Prisma 6 schema with Auth.js and BidFlow domain models"
  - "PostgreSQL database with migrations and seed data"
  - "shadcn/ui component library foundation"
affects: [02-authentication, 03-tender-discovery, 04-bid-generation]

# Tech tracking
tech-stack:
  added: [next@16.1.6, react@19.2.4, prisma@6.19.2, @prisma/client@6.19.2, next-auth@5.0.0-beta.30, bcryptjs, zod, react-hook-form, tailwindcss@4.1.18, @radix-ui/react-*, postgresql@17]
  patterns: ["Prisma client singleton for dev hot-reload", "Idempotent seed scripts with upsert", "Environment variable separation (.env.example vs .env.local)"]

key-files:
  created: [package.json, tsconfig.json, next.config.ts, tailwind.config.ts, src/app/layout.tsx, src/app/page.tsx, src/app/globals.css, src/components/ui/*.tsx, src/lib/utils.ts, src/lib/prisma.ts, prisma/schema.prisma, prisma/seed.ts, prisma/migrations/*, .env.example, .gitignore, components.json]
  modified: []

key-decisions:
  - "Downgraded from Prisma 7 to Prisma 6 due to blocking configuration issues"
  - "Installed PostgreSQL@17 via Homebrew as critical missing dependency"
  - "Used Tailwind CSS v4 with new @import syntax instead of v3"
  - "Removed tailwind.config.ts as Tailwind v4 uses CSS-based configuration"

patterns-established:
  - "Prisma client singleton pattern: globalForPrisma prevents connection exhaustion in dev mode"
  - "Seed script idempotency: deterministic IDs with upsert operations"
  - "Environment config: .env.example committed, .env.local gitignored"

# Metrics
duration: 9min
completed: 2026-02-06
---

# Phase 01 Plan 01: Foundation Bootstrap Summary

**Next.js 16 with Prisma 6, PostgreSQL@17, and complete schema including Auth.js models (User, Account, Session) and BidFlow domain models (Company, Tender, Bid) with idempotent seed data**

## Performance

- **Duration:** 9 min
- **Started:** 2026-02-06T22:50:49Z
- **Completed:** 2026-02-06T23:00:04Z
- **Tasks:** 3
- **Files modified:** 23

## Accomplishments
- Next.js 16.1.6 project with TypeScript strict mode, Tailwind CSS v4, and shadcn/ui components
- Complete Prisma schema with 8 models: User, Account, Session, VerificationToken (Auth.js) + Company, Tender, Bid, and 2 enums (TenderStatus, BidStatus)
- PostgreSQL@17 installed, configured, and migrated with initial schema
- Idempotent seed script creating demo user (demo@bidflow.com), TechBuild Solutions company, 3 sample tenders, and 1 draft bid

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Next.js 15 project with all dependencies and toolchain** - `149a5c7` (feat)
2. **Task 2: Create Prisma schema with all MVP models and configure database** - `9d922c4` (feat)
3. **Task 3: Create idempotent seed script with comprehensive demo data** - `a968b85` (feat)

## Files Created/Modified

### Next.js Project Structure
- `package.json` - Project dependencies and scripts (next, react, prisma, next-auth, bcryptjs, zod, react-hook-form, shadcn deps)
- `tsconfig.json` - TypeScript configuration with strict mode and @/* path aliases
- `next.config.ts` - Next.js configuration (standard settings)
- `postcss.config.mjs` - PostCSS config with @tailwindcss/postcss plugin for v4
- `src/app/globals.css` - Tailwind v4 CSS with @import and @theme custom properties
- `src/app/layout.tsx` - Root layout with Inter font and metadata
- `src/app/page.tsx` - Home page with BidFlow welcome content
- `components.json` - shadcn/ui configuration

### shadcn/ui Components
- `src/components/ui/button.tsx` - Button component with variants (default, destructive, outline, secondary, ghost, link)
- `src/components/ui/input.tsx` - Input field component
- `src/components/ui/label.tsx` - Label component
- `src/components/ui/card.tsx` - Card component with Header, Title, Description, Content, Footer
- `src/components/ui/form.tsx` - Form components with react-hook-form integration
- `src/lib/utils.ts` - cn() utility for class merging

### Database
- `prisma/schema.prisma` - Complete schema with 8 models and 2 enums
- `prisma/migrations/20260206225823_init/migration.sql` - Initial migration creating all tables
- `prisma/seed.ts` - Idempotent seed script with upsert operations
- `src/lib/prisma.ts` - Prisma client singleton

### Configuration
- `.env.example` - Environment variable template (committed)
- `.env.local` - Actual environment variables (gitignored)
- `.gitignore` - Node, Next.js, and environment file exclusions

## Decisions Made

**1. Downgraded Prisma 7 to Prisma 6**
- **Reason:** Prisma 7.3.0 introduced breaking changes to datasource URL configuration requiring prisma.config.ts, but the migration commands couldn't read the config file regardless of format attempted (default export, named export, CommonJS). This was a blocking issue (Rule 3).
- **Impact:** Using Prisma 6.19.2 which has stable, traditional schema.prisma format with `url = env("DATABASE_URL")` that works reliably.
- **Future:** Will need to migrate to Prisma 7+ when configuration issues are resolved.

**2. Installed PostgreSQL@17 via Homebrew**
- **Reason:** Database is a critical missing dependency (Rule 2) required for completing the task. Cannot run migrations or seed without PostgreSQL.
- **Action:** Installed via `brew install postgresql@17`, started service, created bidflow database.
- **Result:** Database fully operational at localhost:5432.

**3. Used Tailwind CSS v4 instead of v3**
- **Reason:** npm installed tailwindcss@4.1.18 by default. v4 has different configuration approach (CSS-based via @theme instead of tailwind.config.js).
- **Changes:** Removed tailwind.config.ts, updated globals.css to use @import "tailwindcss" and @theme directive, installed @tailwindcss/postcss plugin.
- **Result:** Build passes, Tailwind works correctly.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Downgraded Prisma 7 to Prisma 6**
- **Found during:** Task 2 (Database migration)
- **Issue:** Prisma 7.3.0 migration commands require datasource.url in prisma.config.ts, but cannot read the config regardless of format (tried TypeScript default export, named export, CommonJS module.exports, with/without dotenv). Error persisted: "The datasource.url property is required in your Prisma config file when using prisma migrate dev."
- **Fix:** Ran `npm install prisma@6 @prisma/client@6` to downgrade to Prisma 6.19.2 which uses traditional schema.prisma format
- **Files modified:** package.json, package-lock.json, node_modules
- **Verification:** `npx prisma validate` passes, `npx prisma migrate dev` successfully applies migration
- **Committed in:** 9d922c4 (Task 2 commit)

**2. [Rule 2 - Missing Critical] Installed PostgreSQL@17**
- **Found during:** Task 2 (Database migration)
- **Issue:** PostgreSQL not installed on system. Cannot complete database setup task without it.
- **Fix:** Installed via Homebrew (`brew install postgresql@17`), started service (`brew services start postgresql@17`), created database (`createdb bidflow`)
- **Files modified:** System-level (Homebrew Cellar, LaunchAgents)
- **Verification:** `brew services list` shows postgresql@17 running, migration applies successfully
- **Committed in:** 9d922c4 (Task 2 commit)

**3. [Rule 3 - Blocking] Adapted to Tailwind CSS v4**
- **Found during:** Task 1 (Build verification)
- **Issue:** npm installed Tailwind v4.1.18 which has breaking changes: no longer supports `tailwindcss: {}` in postcss.config, requires `@tailwindcss/postcss` plugin instead. Build failed with "The PostCSS plugin has moved to a separate package".
- **Fix:** Installed @tailwindcss/postcss, updated postcss.config.mjs, converted globals.css to v4 syntax (@import "tailwindcss", @theme directive), removed tailwind.config.ts
- **Files modified:** postcss.config.mjs, src/app/globals.css, removed tailwind.config.ts
- **Verification:** `npm run build` passes with zero errors
- **Committed in:** 149a5c7 (Task 1 commit)

---

**Total deviations:** 3 auto-fixed (2 blocking, 1 missing critical)
**Impact on plan:** All auto-fixes were necessary to complete planned tasks. Prisma 6 downgrade is a workaround for Prisma 7 configuration bugs. PostgreSQL installation is a required dependency. Tailwind v4 adaptation is version compatibility fix. No scope creep.

## Issues Encountered

**PostgreSQL not installed initially**
- Detected when migration command failed with "Can't reach database server at localhost:5432"
- Resolved by installing PostgreSQL@17 via Homebrew (auto-fix under Rule 2)

**Tailwind CSS v4 breaking changes**
- Build failed due to PostCSS plugin changes in v4
- Resolved by adapting configuration to v4 format (auto-fix under Rule 3)

**Prisma 7 configuration issues**
- Migration command couldn't read datasource URL from prisma.config.ts
- Resolved by downgrading to stable Prisma 6 (auto-fix under Rule 3)

## User Setup Required

None - no external service configuration required for this phase. Database is local PostgreSQL.

## Next Phase Readiness

**Ready:**
- Next.js 16 development environment fully operational
- PostgreSQL database running with complete schema
- Demo data available for testing authentication flows
- All Auth.js required models (User, Account, Session, VerificationToken) created
- shadcn/ui components available for building auth UI

**Blockers:**
None

**Concerns:**
- Prisma 6 is deprecated; will need to migrate to Prisma 7+ once configuration issues are resolved
- .env.local contains real secrets; ensure it stays gitignored

---
*Phase: 01-foundation-authentication*
*Completed: 2026-02-06*

## Self-Check: PASSED

All key files verified to exist.
All commit hashes verified in git history.
