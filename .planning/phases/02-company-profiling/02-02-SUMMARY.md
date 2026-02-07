---
phase: 02-company-profiling
plan: 02
subsystem: profile-wizard
tags: [server-actions, wizard-ui, react-hook-form, auto-save, zod-validation]

# Dependency graph
requires:
  - phase: 02-company-profiling
    plan: 01
    provides: Company schema, Zod schemas, shadcn/ui components
provides:
  - Complete server action layer for profile CRUD (9 actions)
  - Multi-step wizard container with navigation and progress
  - Step 1 (Company Info) with auto-save on blur
  - Step 2 (Industry Sectors) with auto-save on change
  - Profile completeness calculation
affects: [02-03-wizard-steps-3-5, profile-editing, dashboard-navigation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server actions with Zod validation and structured error handling
    - Auto-save pattern with debounced saves (500ms)
    - Upsert pattern for partial data saves (enables wizard auto-save)
    - React Hook Form with zodResolver for form validation
    - URL-synced wizard navigation without page reloads

key-files:
  created:
    - src/actions/profile.ts
    - src/app/dashboard/profile/wizard/page.tsx
    - src/components/profile/wizard/wizard-container.tsx
    - src/components/profile/wizard/wizard-progress.tsx
    - src/components/profile/wizard/step-company-info.tsx
    - src/components/profile/wizard/step-sectors.tsx
  modified:
    - prisma/schema.prisma

key-decisions:
  - "Added @unique constraint to Company.ownerId for upsert pattern"
  - "Auto-save on blur for text inputs (500ms debounce)"
  - "Auto-save on change for selections (500ms debounce)"
  - "URL sync with window.history.replaceState to avoid page reloads"
  - "Visual 'Saved' indicator appears for 2 seconds after successful save"

patterns-established:
  - "Server actions return ActionResult type: { success: true, data? } | { success: false, errors?, message? }"
  - "All server actions verify session first using verifySession() from DAL"
  - "Company upsert keyed on ownerId enables creating/updating in one operation"
  - "Wizard steps are client components with auto-save, page is server component with data fetching"
  - "Character counters change color when near limit (270+ of 300 chars)"

# Metrics
duration: 4min
completed: 2026-02-07
---

# Phase 02 Plan 02: Profile Wizard UI & Server Actions Summary

**Built complete server action layer for profile management and multi-step wizard with auto-save for Steps 1-2**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-07T00:22:03Z
- **Completed:** 2026-02-07T00:26:19Z
- **Tasks:** 2
- **Files created/modified:** 7 files (6 created, 1 modified)

## Accomplishments

- 9 server actions handle all profile CRUD operations with session verification and Zod validation
- Wizard page at /dashboard/profile/wizard loads existing profile and determines initial step
- WizardContainer manages 5-step navigation with URL synchronization
- Step 1 (Company Info) features auto-save on blur with debouncing and character counter
- Step 2 (Industry Sectors) features checkbox list with expandable subcategories and auto-save
- Profile completeness calculation returns step-by-step status and percentage
- All TypeScript compilation passes, build succeeds

## Task Commits

Each task was committed atomically:

1. **Task 1: Create profile server actions** - `6507414` (feat)
   - Created src/actions/profile.ts with 9 server actions
   - saveCompanyInfo, saveSectors, saveCapabilities for wizard steps 1-3
   - saveCertification/deleteCertification, saveProject/deleteProject for steps 4-5
   - getCompanyProfile fetches full profile with certifications and projects
   - getProfileCompleteness calculates 0-100% completion and step status
   - Added @unique constraint to Company.ownerId in schema for upsert pattern
   - All actions verify session and validate with Zod schemas
   - Structured error handling with ActionResult type

2. **Task 2: Build wizard UI with Steps 1-2** - `518a2e4` (feat)
   - Created wizard page with session verification and profile pre-loading
   - WizardContainer manages step state and URL synchronization
   - WizardProgress shows "Step X of 5" and percentage-based progress bar
   - Step 1: Company Info form with 5 fields (name, country, size, website, description)
     - Auto-save on blur with 500ms debounce
     - Character counter for description (300 max)
     - Visual "Saved" indicator
   - Step 2: Industry Sectors checkbox list with IT and Construction sectors
     - Expandable subcategories (5 for IT, 5 for Construction)
     - Auto-save on change with 500ms debounce
   - Navigation: Back/Next/Skip buttons
   - Steps 3-5 placeholders for future implementation

## Files Created/Modified

- `src/actions/profile.ts` - Complete server action layer for profile CRUD
- `src/app/dashboard/profile/wizard/page.tsx` - Server component wizard page
- `src/components/profile/wizard/wizard-container.tsx` - Client component for wizard shell
- `src/components/profile/wizard/wizard-progress.tsx` - Progress bar component
- `src/components/profile/wizard/step-company-info.tsx` - Step 1 form with auto-save
- `src/components/profile/wizard/step-sectors.tsx` - Step 2 sector selection with auto-save
- `prisma/schema.prisma` - Added @unique to Company.ownerId

## Decisions Made

**1. Upsert pattern for auto-save**
- Added @unique constraint to Company.ownerId field
- Enables upsert operations keyed on ownerId (one-to-one with User)
- Rationale: Auto-save requires creating/updating partial data seamlessly
- Impact: All server actions can upsert, enabling save before all fields filled

**2. Auto-save with debouncing**
- Text inputs: auto-save on blur with 500ms debounce
- Selections: auto-save on change with 500ms debounce
- Rationale: Balance between data safety and server load
- Impact: Users never lose data, wizard feels seamless

**3. URL synchronization pattern**
- Used window.history.replaceState instead of useRouter
- Updates URL search param without triggering page reload
- Rationale: Faster, maintains client state, allows direct linking to steps
- Impact: Users can bookmark specific wizard steps

**4. Character counter UX**
- Shows "X / 300" below textarea
- Changes color to yellow when >270 chars (near limit)
- Rationale: Progressive disclosure - warn only when approaching limit
- Impact: Users aware of limit without constant visual noise

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added @unique constraint to Company.ownerId**
- **Found during:** Task 1 (TypeScript compilation)
- **Issue:** Prisma upsert requires unique constraint on where clause field
- **Fix:** Added @unique to Company.ownerId in schema, ran prisma db push
- **Files modified:** prisma/schema.prisma
- **Verification:** TypeScript compilation passes, build succeeds
- **Committed in:** 6507414 (Task 1 commit)
- **Rationale:** Critical for upsert pattern to work; one-to-one relationship with User makes this semantically correct

---

**Total deviations:** 1 auto-fixed (1 missing critical feature)
**Impact on plan:** No scope creep. Schema change required for planned upsert functionality.

## Issues Encountered

None - plan executed smoothly after schema fix.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for next plan (02-03: Steps 3-5):**
- Server actions for all 5 wizard steps already exist
- Wizard container and navigation logic complete
- Steps 1-2 demonstrate auto-save pattern for Steps 3-5 to follow
- UI components (dialog, table, badge) already installed for certifications/projects

**No blockers or concerns.**

## Self-Check: PASSED

All created files verified:
- ✓ src/actions/profile.ts
- ✓ src/app/dashboard/profile/wizard/page.tsx
- ✓ src/components/profile/wizard/wizard-container.tsx
- ✓ src/components/profile/wizard/wizard-progress.tsx
- ✓ src/components/profile/wizard/step-company-info.tsx
- ✓ src/components/profile/wizard/step-sectors.tsx

All commits verified:
- ✓ 6507414 (Task 1)
- ✓ 518a2e4 (Task 2)

---
*Phase: 02-company-profiling*
*Completed: 2026-02-07*
