---
phase: 03-tender-discovery
plan: 01
subsystem: database
tags: [faker, prisma, tanstack-table, seeding, scoring-algorithm, zod]

# Dependency graph
requires:
  - phase: 02-company-profiling
    provides: Company model with sectors, projects, certifications, capabilityTags
provides:
  - 50+ realistic mock tender seed data (30 IT, 20 Construction)
  - Weighted relevance scoring algorithm (sector 40%, value 20%, tags 40%)
  - Query layer with dynamic filtering (sector, value, deadline)
  - Filter validation with Zod schemas
affects: [03-tender-discovery (later plans), tender-list-ui, tender-detail-ui]

# Tech tracking
tech-stack:
  added: [@tanstack/react-table, @faker-js/faker]
  patterns: [Faker-based seed data generation, weighted scoring algorithm, server-only query layer, Zod filter validation]

key-files:
  created:
    - prisma/seeders/tenders.ts
    - src/lib/tenders/filters.ts
    - src/lib/tenders/scoring.ts
    - src/lib/tenders/queries.ts
  modified:
    - prisma/seed.ts
    - package.json

key-decisions:
  - "Pass prisma instance to seedTenders() to avoid multiple connections"
  - "Load .env.local explicitly in seed.ts using dotenv config for DATABASE_URL"
  - "Redistribute scoring weights when company has no projects (sector 50%, tags 50%)"
  - "Case-insensitive tag matching for better relevance scoring"
  - "Always filter to OPEN status tenders in query layer"

patterns-established:
  - "Seeder functions accept PrismaClient as parameter for connection reuse"
  - "Server-only marked query layers prevent client bundle leakage"
  - "parseFilters() pattern for safe URL search param validation with defaults"
  - "TenderWithScore type pattern extends Prisma model with computed field"

# Metrics
duration: 4min
completed: 2026-02-07
---

# Phase 03 Plan 01: Tender Data Foundation Summary

**Faker-based tender seed generator with 50+ realistic tenders, weighted relevance scoring (0-100), and Prisma query layer with dynamic filtering**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-07T01:16:08Z
- **Completed:** 2026-02-07T01:19:50Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Database seeded with 50+ realistic mock tenders across IT and Construction sectors
- Weighted relevance scoring algorithm (sector match 40%, value match 20%, tag match 40%)
- Prisma query layer with dynamic filtering by sector, value range, and deadline
- Zod-based filter validation with safe URL search param parsing

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies and create Faker seed script for tenders** - `9abad8a` (chore)
2. **Task 2: Create filter types, scoring algorithm, and query layer** - `c48e0a8` (feat)

## Files Created/Modified
- `prisma/seeders/tenders.ts` - Faker-based generator for 50 realistic tenders (30 IT, 20 Construction)
- `prisma/seed.ts` - Updated to import and call seedTenders with re-seeding support
- `src/lib/tenders/filters.ts` - Zod schema for tender filtering with parseFilters() helper
- `src/lib/tenders/scoring.ts` - Weighted relevance scoring algorithm (0-100 scale)
- `src/lib/tenders/queries.ts` - getTenders() and getTenderById() with Prisma and scoring
- `package.json` - Added @tanstack/react-table and @faker-js/faker dependencies

## Decisions Made

**1. Pass prisma instance to seedTenders() to avoid multiple connections**
- Seeder functions accept PrismaClient as parameter instead of creating new instance
- Prevents connection pool exhaustion during seeding

**2. Load .env.local explicitly in seed.ts using dotenv config**
- Seed script wasn't loading environment variables by default
- Added `config({ path: '.env.local' })` at top of seed.ts to ensure DATABASE_URL availability

**3. Redistribute scoring weights when company has no projects**
- Original weights: sector 40%, value 20%, tags 40%
- Without projects: sector 50%, tags 50% (skip value component entirely)
- Prevents unfair scoring when value comparison impossible

**4. Case-insensitive tag matching for better relevance**
- Convert both tender tags and company capability tags to lowercase for comparison
- Improves matching accuracy (e.g., "Cloud Services" matches "cloud services")

**5. Always filter to OPEN status tenders in query layer**
- getTenders() hardcodes `status: 'OPEN'` in where clause
- Prevents showing CLOSED or AWARDED tenders to users browsing opportunities

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed dotenv loading in seed script**
- **Found during:** Task 1 (Running npx prisma db seed)
- **Issue:** Seed script threw "Environment variable not found: DATABASE_URL" error because .env.local wasn't being loaded
- **Fix:** Added `import { config } from 'dotenv'` and `config({ path: '.env.local' })` at top of seed.ts
- **Files modified:** prisma/seed.ts
- **Verification:** npx prisma db seed completed successfully, created 50 tenders
- **Committed in:** 9abad8a (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential fix to enable seeding. No scope creep.

## Issues Encountered
None - plan executed smoothly after dotenv fix.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Database populated with 50+ realistic mock tenders ready for UI consumption
- Scoring algorithm tested via TypeScript compilation and build
- Query layer ready for integration with tender list and detail pages
- Filter types exported for use in URL search param handling

**Blockers:** None

**Concerns:**
- Scoring algorithm not yet verified with real queries (will be tested in UI integration)
- Value range parsing handles common formats but may need adjustment based on actual data patterns

## Self-Check: PASSED

All key files verified:
- prisma/seeders/tenders.ts ✓
- src/lib/tenders/filters.ts ✓
- src/lib/tenders/scoring.ts ✓
- src/lib/tenders/queries.ts ✓

All commits verified:
- 9abad8a ✓
- c48e0a8 ✓

---
*Phase: 03-tender-discovery*
*Completed: 2026-02-07*
