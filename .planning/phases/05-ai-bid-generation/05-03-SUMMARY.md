---
phase: 05-ai-bid-generation
plan: 03
subsystem: ai-generation
tags: [frontend, persistence, e2e-flow, state-initialization, react-client]
requires: [05-02]
provides:
  - Content format detection (pre-generation flat vs post-generation nested)
  - Generated content initialization from persisted database state
  - Automatic view state detection (preview if sections exist, questions otherwise)
  - Complete E2E flow verification (Q&A → generate → preview → persist → refresh → load)
affects: [06-01]
tech-stack:
  added: []
  patterns: [content-format-detection, view-initialization-from-state, position-preservation]
key-files:
  created: []
  modified:
    - src/app/dashboard/tenders/[id]/bid/page.tsx
    - src/app/dashboard/tenders/[id]/bid/components/bid-workspace.tsx
decisions:
  - id: content-format-detection
    choice: Detect post-generation format by checking for top-level `answers` key (object, not array)
    rationale: Distinguishes between flat answers (pre-generation) and nested structure (post-generation) reliably
  - id: view-initialization-from-state
    choice: Initialize view to 'preview' when initialGeneratedSections has keys, otherwise 'questions'
    rationale: Previously generated bids should open in preview view showing the content, not Q&A
  - id: position-preservation
    choice: Preserve currentQuestionIndex when switching between views (no reset to 0)
    rationale: User should resume Q&A at their last position, not restart from question 1
metrics:
  duration: <1min
  completed: 2026-02-07
  tasks: 2/2
---

# Phase 5 Plan 03: Content Persistence & E2E Verification Summary

**One-liner:** Generated bid content persists across page refreshes with automatic view initialization and position preservation for complete E2E workflow.

## What Was Built

### Core Functionality

**1. Content Format Detection (page.tsx)**
- Added logic to detect which format bid.content uses:
  - **Pre-generation (flat):** `{ "company_overview": "...", "proposed_approach": "...", ... }`
  - **Post-generation (nested):** `{ answers: {...}, sections: {...}, generatedAt: "..." }`
- Detection rule: `rawContent?.answers && typeof rawContent.answers === 'object' && !Array.isArray(rawContent.answers)`
- Extracts appropriate data based on format:
  - `initialAnswers`: from `rawContent.answers` if post-generation, else `rawContent` directly
  - `initialGeneratedSections`: from `rawContent.sections` if post-generation, else `undefined`
  - `initialGeneratedAt`: from `rawContent.generatedAt` if post-generation, else `undefined`
- Passes new props to BidWorkspace: `initialGeneratedSections`, `initialGeneratedAt`

**2. Workspace Initialization from Persisted State (bid-workspace.tsx)**
- Added new props to BidWorkspaceProps:
  - `initialGeneratedSections?: Record<string, string>`
  - `initialGeneratedAt?: string`
- State initialization:
  - `generatedSections`: initialized with `initialGeneratedSections ?? {}`
  - `generatedAt`: initialized with `initialGeneratedAt ?? null`
  - `view`: intelligent default based on content existence:
    ```typescript
    const [view, setView] = useState<'questions' | 'generating' | 'preview'>(
      Object.keys(initialGeneratedSections ?? {}).length > 0 ? 'preview' : 'questions'
    )
    ```
- **Key behavior:** If user has already generated content and returns to the bid page, workspace opens in 'preview' view showing their generated sections

**3. Position Preservation**
- "Back to Questions" button sets view to 'questions' without resetting currentQuestionIndex
- Existing state management already handles position tracking correctly
- User resumes Q&A at their last answered question, not question 1
- Critical for edit → regenerate workflow

**4. Complete E2E Flow**
The full user journey now works seamlessly:
1. Start bid → answer questions → generate → preview (Phase 5 Plans 01-02)
2. **NEW:** Close browser, return to tender → click "Continue Bid" → preview loads automatically
3. **NEW:** From preview, click "Back to Questions" → resume at last answered question
4. **NEW:** Edit answers → auto-save preserves both answers and generated sections
5. **NEW:** Click "Regenerate" → overwrites sections with new generation
6. **NEW:** Refresh page at any point → state preserved correctly

## Task Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Wire generated content persistence into page load and workspace initialization | 8ce5c13 | page.tsx, bid-workspace.tsx |
| 2 | E2E verification checkpoint | APPROVED | (checkpoint: user verified complete flow) |

## Technical Architecture

### Data Flow

**Page Load → Workspace Initialization:**
1. Page component loads bid from database (existing Prisma query)
2. bid.content JSON read from database
3. Content format detection logic determines structure:
   - If `answers` key exists → post-generation format
   - Otherwise → pre-generation format (flat answers)
4. Extract initialAnswers, initialGeneratedSections, initialGeneratedAt
5. Pass to BidWorkspace as props
6. Workspace initializes state from props
7. If initialGeneratedSections has keys → view defaults to 'preview'
8. Otherwise → view defaults to 'questions'

**View State Management:**
- questions → generating: User clicks "Generate Bid"
- generating → preview: Generation completes, onComplete callback fires
- preview → questions: User clicks "Back to Questions"
- preview → generating: User clicks "Regenerate"

**Position Preservation:**
- currentQuestionIndex state managed by ProgressIndicator component
- Not modified when switching views
- Persists throughout session lifecycle
- User always resumes at correct position

### Key Design Decisions

**Content Format Detection Rule**
- **Decision:** Check for `rawContent?.answers && typeof rawContent.answers === 'object' && !Array.isArray(rawContent.answers)`
- **Rationale:**
  - Reliable differentiation between flat (pre-gen) and nested (post-gen) formats
  - Array check prevents false positive if answers somehow became an array
  - Type check ensures it's a proper object (not null, not primitive)
  - Simple boolean flag drives all downstream logic

**View Initialization from State**
- **Decision:** Default view based on `Object.keys(initialGeneratedSections ?? {}).length > 0`
- **Rationale:**
  - Previously generated bids should show preview immediately (user wants to see their work)
  - New bids should show questions (no content to preview)
  - Single source of truth: presence of sections determines default view
  - No additional state needed

**No Position Reset on View Transition**
- **Decision:** Keep currentQuestionIndex state unchanged when switching views
- **Rationale:**
  - User mental model: "I was at question 5, went to preview, came back → I'm still at question 5"
  - Edit → regenerate workflow requires resuming at correct position
  - Less confusing UX (no unexpected jumps to question 1)
  - Existing state management already correct, just needed to NOT interfere

## Integration Points

**Upstream Dependencies**
- `05-01` - GeneratedBidContent type structure (answers, sections, generatedAt)
- `05-02` - Content-aware auto-save (constructs nested format when sections exist)
- `05-02` - Three-view state machine in workspace

**Downstream Consumers**
- `06-01` (Export & Review) - Will read generated sections knowing they persist correctly
- Future regeneration features rely on this dual-format persistence

## Deviations from Plan

None - plan executed exactly as written.

## User Verification

**Checkpoint Type:** human-verify

**What was verified:**
Complete AI bid generation flow end-to-end:
1. ✅ Navigate to tender, start bid
2. ✅ Answer all required questions
3. ✅ "Generate Professional Bid" section appears
4. ✅ Click "Generate Bid" button
5. ✅ Watch 6 sections generate with streaming text (800ms initial delay, 80ms chunks)
6. ✅ Each section transitions: pending → generating (with cursor) → complete (green check)
7. ✅ After completion, preview mode shows all generated content
8. ✅ "Back to Questions" returns to Q&A view at correct position
9. ✅ "Regenerate" works and overwrites previous content
10. ✅ **Refresh page (F5) preserves generated content and loads preview view**
11. ✅ Editorial design style maintained (black borders, sharp corners, monochrome + yellow)

**Verification result:** APPROVED by user

## Next Phase Readiness

**Ready for Phase 06 (Export & Review)**
- ✅ Generated content persistence fully functional
- ✅ Preview view loads automatically for previously generated bids
- ✅ Complete E2E flow verified (Q&A → generate → preview → persist → reload)
- ✅ Regeneration workflow supported (edit → regenerate)
- ✅ Content-aware auto-save prevents data loss
- ✅ Position preservation ensures good UX during editing

**No blockers.** Phase 06 can now implement document export (PDF, DOCX) and formal review workflows knowing the generated content is reliably persisted and accessible.

## Self-Check: PASSED

All modified files exist:
- ✅ src/app/dashboard/tenders/[id]/bid/page.tsx (modified: 2026-02-07 13:50)
- ✅ src/app/dashboard/tenders/[id]/bid/components/bid-workspace.tsx (modified: 2026-02-07 13:50)

All commits exist:
- ✅ 8ce5c13 (Task 1: wire generated content persistence into page load)
