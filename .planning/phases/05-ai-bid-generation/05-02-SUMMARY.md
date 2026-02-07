---
phase: 05-ai-bid-generation
plan: 02
subsystem: ai-generation
tags: [frontend, ui-components, streaming-ui, react-client, state-management]
requires: [05-01]
provides:
  - GenerationTrigger component with completeness validation
  - GeneratedSection component with three visual states (pending/generating/complete)
  - GenerationProgress orchestrator with stream cleanup
  - Three-view bid workspace (questions → generating → preview)
  - Content-aware auto-save preserving generated sections
affects: [06-01]
tech-stack:
  added: []
  patterns: [three-view-state-machine, content-aware-persistence, stream-cleanup-pattern]
key-files:
  created:
    - src/app/dashboard/tenders/[id]/bid/components/generation-trigger.tsx
    - src/app/dashboard/tenders/[id]/bid/components/generated-section.tsx
    - src/app/dashboard/tenders/[id]/bid/components/generation-progress.tsx
  modified:
    - src/app/dashboard/tenders/[id]/bid/components/bid-workspace.tsx
decisions:
  - id: three-view-state-machine
    choice: Use 'questions' | 'generating' | 'preview' view state in workspace
    rationale: Clean separation of concerns, prevents UI conflicts, simple state transitions
  - id: content-aware-auto-save
    choice: Construct { answers, sections, generatedAt } when generatedSections exist
    rationale: Preserves generated content during Q&A edits, prevents data loss, backward compatible
  - id: stream-cleanup-pattern
    choice: Use isMounted ref + reader.cancel() + reader.releaseLock() in useEffect cleanup
    rationale: Prevents memory leaks and browser errors when navigating away during generation
  - id: preview-section-display
    choice: Simple section title transformation (split + capitalize) instead of BID_SECTIONS lookup
    rationale: Reduces coupling, works for all section IDs, sufficient for preview display
metrics:
  duration: 3min
  completed: 2026-02-07
  tasks: 3/3
---

# Phase 5 Plan 02: Generation UI & Preview Summary

**One-liner:** Complete generation UI with trigger validation, streaming progress orchestrator, preview view, and content-aware auto-save.

## What Was Built

### Core Functionality

**1. GenerationTrigger Component (generation-trigger.tsx)**
- Client component with completeness validation before generation
- Props: questions, answers, onGenerate callback, disabled flag
- Imports `validateBidCompleteness` from @/lib/bids/validation
- Visual feedback:
  - Editorial design: border-2 border-black, bg-white container
  - Heading: "Generate Professional Bid" (font-display)
  - Yellow warning box when incomplete (shows count of missing required questions)
  - Button with Sparkles icon (enabled) or Loader2 spinner (disabled/generating)
- Button disabled when completeness.complete === false OR disabled prop === true
- Clean, minimal UI matching editorial design system

**2. GeneratedSection Component (generated-section.tsx)**
- Client component displaying individual bid section with status-based rendering
- Props: section (BidSection type), content (string | undefined), status ('pending' | 'generating' | 'complete')
- Three visual states:
  - **Pending:** Gray Circle icon + "Waiting..." text, minimal placeholder content area
  - **Generating:** Loader2 spinner (animate-spin) + "Generating..." text, partial content with blinking cursor "▋" (animate-pulse)
  - **Complete:** CheckCircle2 icon (text-green-600) + "Complete" text, full content displayed
- Content rendered with whitespace-pre-wrap for markdown-like formatting
- Editorial design: border-2 border-black, sharp corners, monochrome + green check icon
- Header bar with section title and status indicator

**3. GenerationProgress Orchestrator (generation-progress.tsx)**
- Client component orchestrating sequential section generation with streaming
- Props: answers, tenderTitle, bidId, onComplete callback
- State management:
  - currentSectionIndex: tracks which section is being generated
  - generatedContent: accumulates text for each section (Record<string, string>)
  - sectionStatuses: tracks pending/generating/complete per section
  - isGenerating: overall generation state
- **Generation sequence (useEffect on mount):**
  1. Set isGenerating = true
  2. For each section in BID_SECTIONS sequentially:
     - Set section status to 'generating'
     - Extract section answers via getAnswersForSection()
     - Call generateBidSection() to get ReadableStream
     - Get reader via stream.getReader()
     - Store reader in readerRef for cleanup
     - Read stream chunks in while loop
     - Accumulate text and update generatedContent state on each chunk (triggers re-render)
     - On stream complete: set section status to 'complete'
     - In try/finally: call reader.releaseLock()
     - Check isMounted ref before all state updates
  3. After all sections complete: call saveGeneratedBid() to persist
  4. Call onComplete() callback with final generatedContent
- **CRITICAL stream cleanup pattern:**
  - `isMounted` useRef to track component mount state
  - `readerRef` useRef to store current reader for cleanup
  - useEffect cleanup function:
    ```javascript
    return () => {
      isMounted.current = false
      if (readerRef.current) {
        try {
          readerRef.current.cancel()
        } catch {
          // Reader may already be released
        } finally {
          try { readerRef.current.releaseLock() } catch {}
        }
      }
    }
    ```
  - Before every setState: check `if (!isMounted.current) return`
  - Prevents memory leaks and browser errors on unmount during generation
- **UI rendering:**
  - Overall progress: "{completedCount}/{BID_SECTIONS.length} sections generated"
  - Maps over BID_SECTIONS, renders GeneratedSection for each with current content and status
  - Displays all 6 sections simultaneously with visual progress indicators

**4. Bid Workspace Integration (bid-workspace.tsx)**
- Modified existing workspace to support three views: 'questions' | 'generating' | 'preview'
- Added state:
  - `view`: tracks current view (default: 'questions')
  - `generatedSections`: stores generated content (Record<string, string>)
  - `generatedAt`: timestamp (string | null)
- **Content-aware auto-save (critical feature):**
  - Modified debouncedSave callback to check if generation has occurred:
    ```javascript
    const hasGenerated = Object.keys(generatedSections).length > 0
    const saveData = hasGenerated
      ? { answers: newAnswers, sections: generatedSections, generatedAt }
      : newAnswers
    saveBidDraft(bid.id, saveData)
    ```
  - When generatedSections is non-empty: constructs full content object with answers + sections + timestamp
  - When generatedSections is empty: sends flat answers (backward compatible with Phase 4)
  - Prevents overwriting generated sections when user edits Q&A answers after generation
- **Questions View (view === 'questions'):**
  - Shows existing Q&A interface (ProgressIndicator, QuestionCard, navigation)
  - Shows GenerationTrigger component when allRequiredAnswered === true
  - GenerationTrigger disabled when view !== 'questions'
  - onGenerate handler: sets view to 'generating'
  - Keep existing Submit for Review button
- **Generating View (view === 'generating'):**
  - Hides Q&A components
  - Shows GenerationProgress component
  - Passes answers, tender.title, bid.id, onComplete callback
  - onComplete callback: stores generatedSections, sets generatedAt timestamp, sets view to 'preview'
- **Preview View (view === 'preview'):**
  - Displays all generated sections with editorial styling
  - Each section in border-2 border-black container with header and content
  - Section titles transformed from snake_case to Title Case (simple split + capitalize)
  - Three action buttons:
    - "Back to Questions" (variant="outline"): sets view to 'questions'
    - "Regenerate" with RotateCcw icon (variant="outline"): clears generatedSections/generatedAt, sets view to 'generating'
    - "Submit for Review": existing submit handler (now available in preview view)
- Added imports: GenerationTrigger, GenerationProgress, RotateCcw icon

## Task Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create GenerationTrigger and GeneratedSection components | 1a58655 | generation-trigger.tsx, generated-section.tsx |
| 2 | Create GenerationProgress orchestrator with stream cleanup | 3eb277d | generation-progress.tsx |
| 3 | Integrate generation view with content-aware auto-save | a0ffe85 | bid-workspace.tsx (modified) |

## Technical Architecture

### Data Flow

**Generation Flow:**
1. User completes all required Q&A questions in workspace
2. GenerationTrigger appears, user clicks "Generate Bid"
3. Workspace sets view to 'generating', shows GenerationProgress
4. GenerationProgress:
   - For each of 6 sections sequentially:
     - Calls generateBidSection() (from 05-01) → ReadableStream
     - Consumes stream with reader.read() loop
     - Updates generatedContent state on each chunk (UI shows streaming text + cursor)
     - Sets section status to 'complete' when stream closes
     - Releases reader lock in try/finally
   - After all sections: calls saveGeneratedBid() server action
   - Triggers onComplete callback with final content
5. Workspace receives generatedContent, stores in state, sets view to 'preview'
6. Preview view displays all sections with action buttons
7. User can navigate back to questions or regenerate
8. Any Q&A edits trigger auto-save with content-aware structure (preserves sections)

### Key Design Decisions

**Three-View State Machine**
- Clean separation: questions view (Q&A UI) → generating view (progress) → preview view (output)
- Simple state transitions: setView('questions' | 'generating' | 'preview')
- No UI conflicts: only one view active at a time
- Easy to reason about: linear flow matching user mental model

**Content-Aware Auto-Save**
- **Problem:** After generation, user edits Q&A answer → auto-save might overwrite generated sections
- **Solution:** Check if generatedSections exists before constructing save payload
- **Implementation:** `hasGenerated` flag based on Object.keys(generatedSections).length
- **Benefits:**
  - Generated sections preserved during Q&A edits
  - No data loss
  - Backward compatible (flat answers when no generation)
  - Enables edit → regenerate workflow

**Stream Cleanup Pattern**
- **Problem:** User navigates away during generation → active stream reader → memory leak + errors
- **Solution:** isMounted ref + readerRef + cleanup in useEffect return
- **Pattern:**
  1. Track mount state: `const isMounted = useRef(true)`
  2. Store reader: `readerRef.current = reader`
  3. Guard state updates: `if (!isMounted.current) return` before setState
  4. Cleanup on unmount: cancel() then releaseLock() in try/catch
- **Benefits:**
  - No memory leaks
  - No browser console errors
  - Safe navigation during generation
  - Follows React best practices

**Preview Section Display**
- **Decision:** Transform section IDs client-side (split + capitalize) instead of importing BID_SECTIONS
- **Rationale:**
  - Reduces coupling between components
  - Works for all section IDs (future-proof)
  - Sufficient for preview display (user doesn't need exact BID_SECTIONS.title)
  - Simpler code (no lookup needed)

## Integration Points

**Upstream Dependencies**
- `validation.ts` (05-01 prereq) - validateBidCompleteness for trigger button
- `sections.ts` (05-01) - BID_SECTIONS array, getAnswersForSection helper, BidSection type
- `mock-generator.ts` (05-01) - generateBidSection streaming function
- `bids.ts` (05-01 modified) - saveGeneratedBid server action

**Downstream Consumers (Phase 06)**
- Phase 06 (Export & Review) will read generated sections from bid.content.sections
- Preview view provides early review before formal review phase
- Content structure { answers, sections, generatedAt } ready for export

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Ready for Phase 06 (Export & Review)**
- ✅ Complete generation UI flow implemented
- ✅ User can generate professional bid from Q&A answers
- ✅ Streaming text display with realistic timing (800ms initial, 80ms chunks)
- ✅ Preview view shows all generated sections
- ✅ Content persisted to database with dual format (answers + sections)
- ✅ Stream cleanup prevents memory leaks
- ✅ Content-aware auto-save prevents data loss

**No blockers.** Phase 06 can now build export functionality (PDF, DOCX) from generated sections and implement formal review workflows.

## Testing Notes

**TypeScript Compilation:** ✅ Zero errors with `npx tsc --noEmit`

**Manual Verification:**
- ✅ All 3 new component files created
- ✅ bid-workspace.tsx modified with three-view state machine
- ✅ GenerationTrigger imports validateBidCompleteness correctly
- ✅ GenerationProgress imports generateBidSection and saveGeneratedBid correctly
- ✅ bid-workspace.tsx imports GenerationTrigger and GenerationProgress correctly
- ✅ Content-aware auto-save constructs { answers, sections, generatedAt } when hasGenerated
- ✅ Stream cleanup uses reader.cancel() and reader.releaseLock() in useEffect cleanup
- ✅ isMounted ref guards all state updates in generation loop

**Self-Check:** PASSED (see below)

## Self-Check: PASSED

All created files exist:
- ✅ src/app/dashboard/tenders/[id]/bid/components/generation-trigger.tsx
- ✅ src/app/dashboard/tenders/[id]/bid/components/generated-section.tsx
- ✅ src/app/dashboard/tenders/[id]/bid/components/generation-progress.tsx

All commits exist:
- ✅ 1a58655 (Task 1: GenerationTrigger and GeneratedSection)
- ✅ 3eb277d (Task 2: GenerationProgress with stream cleanup)
- ✅ a0ffe85 (Task 3: Workspace integration with content-aware auto-save)
