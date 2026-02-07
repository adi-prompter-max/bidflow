---
phase: 02-company-profiling
plan: 03
subsystem: profile-wizard
tags: [wizard-ui, tag-input, certifications-crud, projects-crud, modal-dialog, table-component]

# Dependency graph
requires:
  - phase: 02-company-profiling
    plan: 02
    provides: Wizard container, Steps 1-2, server actions, auto-save pattern
provides:
  - Custom tag input component with keyboard support
  - Step 3 (Capabilities & Tags) with auto-save
  - Step 4 (Certifications) with inline CRUD
  - Step 5 (Projects) with table display and modal dialog CRUD
  - Reusable ProjectDialog component
  - Complete 5-step wizard flow from Company Info to Finish
affects: [02-04-profile-view, dashboard-navigation, profile-editing]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Custom tag input with Enter/comma to add, x/Backspace to remove
    - Inline form CRUD pattern for certifications (not modal)
    - Modal dialog pattern for complex forms (projects)
    - Table display with action buttons for list management
    - Optimistic UI updates with local state management

key-files:
  created:
    - src/components/profile/tag-input.tsx
    - src/components/profile/wizard/step-capabilities.tsx
    - src/components/profile/wizard/step-certifications.tsx
    - src/components/profile/wizard/step-projects.tsx
    - src/components/profile/project-dialog.tsx
  modified:
    - src/components/profile/wizard/wizard-container.tsx
    - src/lib/validations/profile.ts

key-decisions:
  - "Tag input normalizes tags (trim, lowercase) for consistency"
  - "Certifications use inline forms, projects use modal dialog"
  - "z.number() instead of z.coerce.number() for yearCompleted to avoid type issues"
  - "Finish button navigates to /dashboard (profile view page built in Plan 04)"

patterns-established:
  - "Tag input shows count (X / 20) with color change near limit"
  - "CRUD lists show 'At least 1 required' status indicators when empty"
  - "Delete actions require confirmation dialog"
  - "Optimistic UI updates: update local state immediately after server action"
  - "Empty states provide CTA button to add first item"

# Metrics
duration: 4min
completed: 2026-02-07
---

# Phase 02 Plan 03: Wizard Steps 3-5 Summary

**Complete wizard with tag input, inline certification CRUD, and modal project management for full profile creation**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-07T00:30:34Z
- **Completed:** 2026-02-07T00:34:30Z
- **Tasks:** 2
- **Files created/modified:** 7 files (5 created, 2 modified)

## Accomplishments

- Custom tag input component with keyboard shortcuts and tag count display
- Step 3 (Capabilities & Tags) with textarea and tag input, both with auto-save
- Step 4 (Certifications) with inline add/edit/delete forms and date inputs
- Step 5 (Projects) with table display and reusable modal dialog for CRUD operations
- Complete wizard flow navigable from Step 1 to Finish with all data persistence
- All TypeScript compilation passes, build succeeds

## Task Commits

Each task was committed atomically:

1. **Task 1: Build tag input component and Step 3** - `03468d7` (feat)
   - Created TagInput component with keyboard support
     - Enter or comma to add tags
     - Backspace on empty input removes last tag
     - x button to remove individual tags
     - Shows tag count (X / 20)
     - Normalizes tags (trim, lowercase) and prevents duplicates
   - Created Step 3 (Capabilities & Tags)
     - Capability description textarea with 500 char limit
     - Character counter that changes color near limit (>450 chars)
     - Tag input integrated with auto-save on change
     - Both fields save via saveCapabilities action (500ms debounce)
     - Pre-populates from existing profile data
   - Updated wizard-container to render Step 3

2. **Task 2: Build Steps 4-5 for certifications and projects** - `b9ae6db` (feat)
   - Created Step 4 (Certifications) with inline CRUD
     - Add/edit/delete certifications with inline forms
     - Shows certification name, issuing body, issue/expiry dates
     - Inline form (not modal) with 4 fields
     - "At least 1 certification required" status indicator
     - Pre-populates from existing certifications
     - Save/delete via saveCertification/deleteCertification actions
   - Created reusable ProjectDialog component
     - Modal dialog for add/edit project forms
     - 6 fields: name, client, description, sector, value range, year
     - Sector dropdown (IT, Construction)
     - Value range dropdown (6 ranges from Under 50k to Over 1M)
     - Year completed input (2000 to current year)
     - Pre-populates when editing existing project
   - Created Step 5 (Past Projects) with table and modal
     - Table displays projects with Name, Client, Sector, Value, Year columns
     - Edit and Delete buttons per row
     - "Add Project" button opens modal dialog
     - Empty state with "Add Your First Project" CTA
     - "At least 1 project required" status indicator
     - Save/delete via saveProject/deleteProject actions
   - Updated wizard-container to render steps 4-5
     - Finish button navigates to /dashboard
   - Fixed projectSchema to use z.number() instead of z.coerce.number()

## Files Created/Modified

- `src/components/profile/tag-input.tsx` - Custom tag input with keyboard support and normalization
- `src/components/profile/wizard/step-capabilities.tsx` - Step 3 with description and tags, auto-save
- `src/components/profile/wizard/step-certifications.tsx` - Step 4 with inline certification CRUD
- `src/components/profile/wizard/step-projects.tsx` - Step 5 with projects table and CRUD
- `src/components/profile/project-dialog.tsx` - Reusable modal dialog for project add/edit
- `src/components/profile/wizard/wizard-container.tsx` - Updated to render all 5 steps, Finish button
- `src/lib/validations/profile.ts` - Fixed projectSchema yearCompleted type

## Decisions Made

**1. Tag input normalization**
- Normalize tags to lowercase and trim whitespace
- Rationale: Ensures consistency, prevents duplicate tags with different casing
- Impact: Users can't create "Cloud" and "cloud" as separate tags

**2. Inline forms for certifications, modal for projects**
- Certifications: inline add/edit forms (simpler, 4 fields)
- Projects: modal dialog (more complex, 6 fields with long description)
- Rationale: UX complexity should match form complexity
- Impact: Certifications feel lightweight, projects feel focused

**3. Fix yearCompleted type issue**
- Changed from z.coerce.number() to z.number()
- Rationale: z.coerce.number() creates type 'unknown' initially, causes TypeScript errors
- Impact: Form typing works correctly, no type assertions needed

**4. Finish button navigation**
- Navigate to /dashboard instead of /dashboard/profile
- Rationale: Profile view page will be built in Plan 04
- Impact: Users return to dashboard after completing wizard

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed projectSchema type issue**
- **Found during:** Task 2 (TypeScript compilation)
- **Issue:** z.coerce.number() creates type 'unknown' initially, incompatible with useForm<ProjectFormValues>
- **Fix:** Changed projectSchema yearCompleted to z.number() instead of z.coerce.number()
- **Files modified:** src/lib/validations/profile.ts
- **Verification:** TypeScript compilation passes, build succeeds
- **Committed in:** b9ae6db (Task 2 commit)
- **Rationale:** Bug in type definition blocking compilation

**2. [Rule 1 - Bug] Removed updatedAt field from Prisma models**
- **Found during:** Task 2 (TypeScript compilation)
- **Issue:** Certification and Project models only have createdAt, not updatedAt in schema
- **Fix:** Removed updatedAt from optimistic UI updates in step-certifications and step-projects
- **Files modified:** src/components/profile/wizard/step-certifications.tsx, src/components/profile/wizard/step-projects.tsx
- **Verification:** TypeScript compilation passes, types match Prisma schema
- **Committed in:** b9ae6db (Task 2 commit)
- **Rationale:** Type mismatch with Prisma schema

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both auto-fixes necessary for TypeScript compilation. No scope creep.

## Issues Encountered

None - plan executed smoothly after schema type fixes.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for next plan (02-04: Profile View & Navigation):**
- Complete wizard flow operational with all 5 steps
- All data persists via server actions
- Profile completeness calculation available via getProfileCompleteness
- Wizard can be revisited and data pre-populates correctly
- Tag input, inline forms, and modal patterns established for reuse
- Build passes, no TypeScript errors

**No blockers or concerns.**

## Self-Check: PASSED

All created files verified:
- ✓ src/components/profile/tag-input.tsx
- ✓ src/components/profile/wizard/step-capabilities.tsx
- ✓ src/components/profile/wizard/step-certifications.tsx
- ✓ src/components/profile/wizard/step-projects.tsx
- ✓ src/components/profile/project-dialog.tsx

All commits verified:
- ✓ 03468d7 (Task 1)
- ✓ b9ae6db (Task 2)

---
*Phase: 02-company-profiling*
*Completed: 2026-02-07*
