---
phase: 04-bid-workspace
plan: 01
subsystem: api
tags: [sonner, toast, server-actions, prisma, validation, bid-engine]

# Dependency graph
requires:
  - phase: 03-tender-discovery
    provides: Tender model with requirements JSON, database schema with Bid model
provides:
  - Question generation engine (5-8 questions from tender requirements)
  - Bid CRUD server actions with ownership verification
  - Bid query layer with tender relations
  - Bid validation logic (completeness, status transitions)
  - Toast notification infrastructure (sonner)
affects: [04-02-bid-ui, 04-03-tender-integration]

# Tech tracking
tech-stack:
  added: [sonner, use-debounce]
  patterns: [Question generation from JSON, Status transition validation, Auto-save pattern (no revalidation)]

key-files:
  created: [src/lib/bids/questions.ts, src/lib/bids/queries.ts, src/lib/bids/validation.ts, src/actions/bids.ts, src/components/ui/sonner.tsx]
  modified: [package.json, src/app/layout.tsx]

key-decisions:
  - "Question generation produces 4 standard + N dynamic questions (target 5-8 total) based on tender requirements"
  - "saveBidDraft does NOT revalidate (auto-save should not trigger revalidation - too frequent)"
  - "Status transitions: DRAFT→IN_REVIEW, IN_REVIEW→FINALIZED|DRAFT, FINALIZED→SUBMITTED"
  - "Completeness validation required for FINALIZED and SUBMITTED status transitions"
  - "Using Prisma.JsonObject type for bid content to satisfy Prisma type constraints"

patterns-established:
  - "Question engine: Parse requirements JSON → generate contextual questions with helpText"
  - "Server action pattern: verifySession → get company → verify ownership → validate → mutate → revalidate"
  - "Validation pattern: Separate validation logic from actions for reusability"

# Metrics
duration: 3min
completed: 2026-02-07
---

# Phase 04 Plan 01: Bid Data Layer Summary

**Toast notifications with sonner, question generation from tender requirements, bid CRUD actions with ownership verification, and status transition validation**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-07T02:15:31Z
- **Completed:** 2026-02-07T02:18:26Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Installed sonner (via shadcn) and use-debounce, added Toaster to root layout for app-wide toast notifications
- Created question generation engine that produces 5-8 contextual questions from tender requirements JSON
- Built complete bid data layer: server actions (createBid, saveBidDraft, updateBidStatus), query functions (getBidByTenderAndUser, getBidsByUser), validation logic (completeness, status transitions)
- All TypeScript compilation passes, exports working correctly

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies and set up toast notifications** - `9b2a5a1` (chore)
2. **Task 2: Create bid data layer** - `7076b1d` (feat)

## Files Created/Modified

**Created:**
- `src/components/ui/sonner.tsx` - Toaster component with custom icons and styling (shadcn)
- `src/lib/bids/questions.ts` - Question generation engine: generates 5-8 questions from tender requirements (tags, certifications, experience, technical, deliverables)
- `src/lib/bids/queries.ts` - Bid data fetching: getBidByTenderAndUser, getBidsByUser with tender relations
- `src/lib/bids/validation.ts` - Validation logic: validateBidCompleteness (checks all required questions answered), isValidStatusTransition (enforces workflow)
- `src/actions/bids.ts` - Server actions: createBid (idempotent), saveBidDraft (no revalidation for auto-save), updateBidStatus (validates completeness for FINALIZED/SUBMITTED)

**Modified:**
- `package.json` - Added sonner and use-debounce dependencies
- `src/app/layout.tsx` - Added Toaster component import and render (bottom-right position)
- `src/app/globals.css` - Updated by shadcn CLI for toast styling
- `components.json` - Updated by shadcn CLI

## Decisions Made

1. **Question generation strategy**: 4 standard questions (company_overview, proposed_approach, timeline, budget_notes) + up to 5 dynamic questions based on tender requirements. Target 5-8 questions per tender.

2. **saveBidDraft does NOT revalidate**: Auto-save pattern should not trigger revalidation as it's too frequent. Only createBid and updateBidStatus revalidate their respective pages.

3. **Status transition rules**: Enforced workflow: DRAFT → IN_REVIEW, IN_REVIEW → FINALIZED or back to DRAFT, FINALIZED → SUBMITTED. No transitions from SUBMITTED.

4. **Completeness validation for status transitions**: Transitioning to FINALIZED or SUBMITTED requires all required questions to be answered. Returns error with missing question count if incomplete.

5. **Prisma.JsonObject type casting**: Used `content as Prisma.JsonObject` in saveBidDraft to satisfy Prisma's type constraints for JSON fields.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**TypeScript type error with Prisma JSON field**: Initial implementation had type mismatch when updating bid content. Fixed by importing `Prisma` from `@prisma/client` and casting content as `Prisma.JsonObject`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Complete bid data layer ready for UI consumption (Plan 02)
- Question engine tested with TypeScript compilation
- Server actions follow established ActionResult pattern from profile.ts
- Toast infrastructure ready for user feedback
- Ready to build bid workspace UI that consumes these foundations

**Blockers:** None

## Self-Check: PASSED

All created files verified:
- src/components/ui/sonner.tsx
- src/lib/bids/questions.ts
- src/lib/bids/queries.ts
- src/lib/bids/validation.ts
- src/actions/bids.ts

All commits verified:
- 9b2a5a1
- 7076b1d

---
*Phase: 04-bid-workspace*
*Completed: 2026-02-07*
