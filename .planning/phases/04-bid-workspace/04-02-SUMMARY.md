---
phase: 04-bid-workspace
plan: 02
subsystem: ui
tags: [react, nextjs, auto-save, debounce, real-time, client-components, server-components]

# Dependency graph
requires:
  - phase: 04-bid-workspace
    plan: 01
    provides: Question generation engine, bid CRUD actions, toast infrastructure
provides:
  - Complete bid workspace Q&A interface at /dashboard/tenders/[id]/bid
  - Auto-save with 500ms debounce and toast feedback
  - Real-time deadline countdown timer
  - Progress tracking with visual indicators
  - Question navigation (next/previous)
  - Resume from last answered question
affects: [04-03-tender-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: [Auto-save with debounce, beforeunload warning, Ctrl+S handler, Real-time timer with cleanup, Server/Client component split]

key-files:
  created: [src/app/dashboard/tenders/[id]/bid/page.tsx, src/app/dashboard/tenders/[id]/bid/components/bid-workspace.tsx, src/app/dashboard/tenders/[id]/bid/components/question-card.tsx, src/app/dashboard/tenders/[id]/bid/components/deadline-timer.tsx, src/app/dashboard/tenders/[id]/bid/components/progress-indicator.tsx, src/app/dashboard/tenders/[id]/bid/components/bid-status-badge.tsx]
  modified: []

key-decisions:
  - "Simple useState for form state instead of react-hook-form (avoids complexity with dynamic questions)"
  - "Auto-save on every answer change with 500ms debounce, 2000ms maxWait"
  - "beforeunload warning when hasUnsavedChanges is true"
  - "Ctrl+S / Cmd+S triggers debouncedSave.flush() for manual save"
  - "DeadlineTimer uses setInterval with 1000ms tick and proper cleanup"
  - "Resume from last answered question (finds last non-empty answer in array)"
  - "Submit for Review button only visible on last question when all required answered"

patterns-established:
  - "Server page component: fetch data → generate questions → pass to client workspace"
  - "Client workspace: manage state → handle auto-save → render child components"
  - "QuestionCard: render appropriate input based on question.type (text/textarea/number/select)"
  - "Real-time countdown: calculateTimeRemaining helper + useEffect with setInterval + cleanup"
  - "Progress calculation: filter answers array for non-empty values matching question IDs"

# Metrics
duration: 2min
completed: 2026-02-07
---

# Phase 04 Plan 02: Bid Workspace UI Summary

**Complete bid workspace Q&A interface with auto-save, real-time countdown, progress tracking, and question navigation**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-07T02:22:43Z
- **Completed:** 2026-02-07T02:25:15Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Created server component bid workspace page that fetches bid/tender data, generates questions from requirements, and auto-creates bid if none exists
- Built BidWorkspace client component with useState form management, auto-save with 500ms debounce, toast feedback, beforeunload warning, and Ctrl+S handler
- Implemented QuestionCard supporting all four input types (text, textarea, number, select) with navigation buttons
- Created real-time DeadlineTimer ticking every second with proper cleanup, urgent state (<24h), and expired state
- Built ProgressIndicator showing visual progress bar with answered/total count and completion status
- Added BidStatusBadge with color-coded mapping for all four BidStatus values
- Resume functionality: page determines last answered question index and starts from there
- Submit for Review button appears on last question when all required questions answered

## Task Commits

Each task was committed atomically:

1. **Task 1: Create bid workspace page and main workspace component** - `5ba6ea0` (feat)
2. **Task 2: Create supporting components** - `3c21c2c` (feat)

## Files Created/Modified

**Created:**
- `src/app/dashboard/tenders/[id]/bid/page.tsx` - Server component fetching bid/tender data, generating questions, auto-creating bid if needed, determining resume point
- `src/app/dashboard/tenders/[id]/bid/components/bid-workspace.tsx` - Client component managing form state, auto-save with debounce, navigation, progress tracking
- `src/app/dashboard/tenders/[id]/bid/components/question-card.tsx` - Question rendering with type-specific inputs (text/textarea/number/select) and navigation
- `src/app/dashboard/tenders/[id]/bid/components/deadline-timer.tsx` - Real-time countdown with setInterval, cleanup, urgent/expired states
- `src/app/dashboard/tenders/[id]/bid/components/progress-indicator.tsx` - Visual progress bar with answered/total count and completion indicator
- `src/app/dashboard/tenders/[id]/bid/components/bid-status-badge.tsx` - Color-coded status badges for DRAFT/IN_REVIEW/FINALIZED/SUBMITTED

**Modified:**
None

## Decisions Made

1. **Simple state management pattern**: Used useState instead of react-hook-form to avoid complexity with dynamic question arrays. Pass onChange handlers directly to QuestionCard.

2. **Auto-save configuration**: 500ms debounce with 2000ms maxWait ensures balance between responsiveness and server load.

3. **Unsaved changes protection**: Added beforeunload event listener that warns user when hasUnsavedChanges is true. Ctrl+S / Cmd+S handler allows manual save via debouncedSave.flush().

4. **Real-time timer pattern**: DeadlineTimer uses setInterval(1000ms) with proper cleanup in useEffect return. Calculates time remaining and determines urgent/expired states on each tick.

5. **Resume from last answered**: Server component iterates through questions array in reverse to find last non-empty answer, passes that index as startIndex to client component.

6. **Submit for Review visibility**: Button only appears when on last question AND all required questions answered. Flushes pending saves before status update.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**TypeScript error in bid-actions.tsx**: Existing file had type error with `'bidId' in result.data` where result.data is type `unknown`. TypeScript doesn't permit `in` operator on potentially primitive values. Fixed automatically by adding `typeof result.data === 'object'` type guard (Deviation Rule 1 - blocking issue).

## User Setup Required

None - all functionality works out of the box.

## Next Phase Readiness

- Complete bid workspace UI ready for user interaction
- Auto-save working with toast feedback
- Real-time countdown visible to users
- Progress tracking showing completion status
- Ready for integration with tender detail page (Plan 03)
- Submit for Review workflow functional

**Blockers:** None

## Self-Check: PASSED

All created files verified:
- src/app/dashboard/tenders/[id]/bid/page.tsx
- src/app/dashboard/tenders/[id]/bid/components/bid-workspace.tsx
- src/app/dashboard/tenders/[id]/bid/components/question-card.tsx
- src/app/dashboard/tenders/[id]/bid/components/deadline-timer.tsx
- src/app/dashboard/tenders/[id]/bid/components/progress-indicator.tsx
- src/app/dashboard/tenders/[id]/bid/components/bid-status-badge.tsx

All commits verified:
- 5ba6ea0
- 3c21c2c

---
*Phase: 04-bid-workspace*
*Completed: 2026-02-07*
