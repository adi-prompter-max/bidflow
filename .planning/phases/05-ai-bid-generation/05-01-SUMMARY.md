---
phase: 05-ai-bid-generation
plan: 01
subsystem: ai-generation
tags: [backend, data-layer, templates, streaming, mock-ai]
requires: [04-01, 04-02, 04-03]
provides:
  - Bid section mapping from Q&A questions to professional bid structure
  - Professional narrative templates for 6 standard bid sections
  - Mock streaming text generator with realistic timing
  - Server action for persisting generated content
affects: [05-02]
tech-stack:
  added: []
  patterns: [streaming-api, template-functions, mock-generator]
key-files:
  created:
    - src/lib/bids/sections.ts
    - src/lib/bids/bid-templates.ts
    - src/lib/bids/mock-generator.ts
  modified:
    - src/actions/bids.ts
decisions:
  - id: section-mapping-static
    choice: Static mapping of all question IDs to 6 bid sections
    rationale: Complete coverage eliminates need for catch-all section
  - id: template-string-interpolation
    choice: Use template literal functions instead of external template library
    rationale: Simple, testable, no dependencies, matches real AI prompt patterns for v2
  - id: mock-streaming-native
    choice: Use ReadableStream and setTimeout (no AI SDK for MVP)
    rationale: Native APIs sufficient for realistic UX, defer AI SDK to v2 when integrating real models
  - id: preserve-both-formats
    choice: Store both original Q&A answers and generated sections in content JSON
    rationale: Enables edit/regenerate workflows without data loss
metrics:
  duration: 2min
  completed: 2026-02-07
  tasks: 2/2
---

# Phase 5 Plan 01: AI Bid Generation Backend Summary

**One-liner:** Complete backend data layer with section mapping, professional templates, mock streaming generator, and persistence action.

## What Was Built

### Core Functionality

**1. Bid Section Mapping (sections.ts)**
- Defined `BidSection` type with id, title, order, sourceQuestions, required fields
- Created `BID_SECTIONS` array with 6 standard sections covering all question IDs:
  - executive_summary (company_overview, proposed_approach) - required
  - technical_approach (technical_approach, capability_match) - required
  - methodology (proposed_approach, deliverables_plan) - required
  - timeline (timeline) - required
  - experience (relevant_experience, certifications) - not required
  - budget (budget_notes) - not required
- Implemented `getAnswersForSection()` helper that extracts section-specific answers from all answers, skipping missing dynamic questions

**2. Professional Narrative Templates (bid-templates.ts)**
- Defined `TemplateContext` type (tenderTitle, companyName, sector)
- Created `BID_TEMPLATES` with 6 template functions (answers + context → markdown narrative)
- Each template produces 5-15 lines of professional bid content
- Templates gracefully handle missing answers with fallback text
- Implemented `expandTemplate()` helper for template expansion
- All templates use string interpolation (no external dependencies)

**3. Mock Streaming Generator (mock-generator.ts)**
- Defined `GeneratorConfig` type (chunkDelayMs: 80ms, initialDelayMs: 800ms, wordsPerChunk: 5)
- Created `createMockStream()` that returns ReadableStream<string> with realistic timing:
  - 800ms initial delay (simulates AI "thinking")
  - 80ms delay between chunks (realistic streaming feel)
  - 5 words per chunk (smooth progressive rendering)
- Implemented `generateBidSection()` that combines template expansion with streaming:
  - Looks up template by section ID
  - Expands template with answers and tender context
  - Returns ReadableStream for progressive UI consumption

**4. Server Action for Persistence (bids.ts)**
- Added `GeneratedBidContent` type (answers, sections, generatedAt)
- Created `saveGeneratedBid()` server action:
  - Verifies session and bid ownership (same pattern as saveBidDraft)
  - Restricts to DRAFT or IN_REVIEW status bids
  - Updates bid.content with Prisma.JsonObject type
  - Preserves both original Q&A answers and generated sections
  - Revalidates bid workspace path
- Maintained all existing bid actions (createBid, saveBidDraft, updateBidStatus) unchanged

## Task Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create bid section mapping and professional narrative templates | 4ae8c67 | sections.ts, bid-templates.ts |
| 2 | Create mock streaming generator and saveGeneratedBid server action | 16c4576 | mock-generator.ts, bids.ts (extended) |

## Technical Architecture

### Data Flow
1. User completes Q&A questions in bid workspace (Phase 4)
2. UI calls `generateBidSection(sectionId, answers, tenderTitle)` for each section
3. Mock generator:
   - Looks up template from BID_TEMPLATES
   - Expands template with answers using expandTemplate()
   - Returns ReadableStream<string> with realistic chunk timing
4. UI consumes stream progressively, displaying text as it "generates"
5. After all sections complete, UI calls `saveGeneratedBid(bidId, { answers, sections, generatedAt })`
6. Server action persists content to database preserving both formats

### Key Design Decisions

**Static Section Mapping (No Catch-All)**
- All 9 question IDs (4 standard + 5 dynamic) explicitly mapped to section sourceQuestions arrays
- Dynamic questions that weren't generated for a tender are simply skipped by getAnswersForSection()
- No need for "Other" or catch-all section because mapping is exhaustive

**Template Functions over External Libraries**
- Each template is a pure function: `(answers, context) => string`
- No Handlebars, EJS, or other template engines needed
- Directly testable with unit tests
- Matches prompt engineering patterns for v2 when swapping to real AI

**Native Streaming APIs over AI SDK**
- ReadableStream is browser-native, zero dependencies
- setTimeout provides sufficient timing control for MVP mocks
- AI SDK (300KB+ bundle) deferred to v2 when integrating real LLM APIs
- Same stream interface will work with Vercel AI SDK's useCompletion() in v2

**Dual-Format Persistence**
- Storing both answers and generated sections enables:
  - Edit original answers and regenerate
  - Manually edit generated text
  - Display either format based on UI state
  - No data loss during regeneration

## Integration Points

**Upstream Dependencies**
- `questions.ts` - Question IDs referenced in section.sourceQuestions arrays
- `validation.ts` - Completeness checking (used in UI before generation)
- `bids.ts` - Existing bid ownership patterns reused in saveGeneratedBid

**Downstream Consumers (Phase 05 Plan 02)**
- Generation UI will call generateBidSection() per section
- Progressive rendering components will consume ReadableStream
- Completion handler will call saveGeneratedBid()
- Preview page will display generatedContent.sections

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Ready for Phase 05 Plan 02 (Generation UI & Preview)**
- ✅ All backend generation logic complete and tested
- ✅ Templates produce realistic professional narratives
- ✅ Streaming timing feels realistic (800ms initial, 80ms chunks)
- ✅ Server action preserves both answer formats
- ✅ TypeScript types exported for UI consumption

**No blockers.** UI layer can now consume these APIs to build section-by-section generation with progress indicators.

## Testing Notes

**TypeScript Compilation:** ✅ Zero errors with `npx tsc --noEmit`

**Manual Verification:**
- ✅ 6 sections defined in BID_SECTIONS with correct order
- ✅ All 9 question IDs covered in sourceQuestions arrays
- ✅ 6 template functions in BID_TEMPLATES matching section IDs
- ✅ Templates handle missing answers gracefully (no undefined/null in output)
- ✅ mock-generator exports createMockStream and generateBidSection
- ✅ bids.ts exports saveGeneratedBid and GeneratedBidContent type
- ✅ Import links verified: mock-generator → bid-templates → sections

**Self-Check:** PASSED (see below)

## Self-Check: PASSED

All created files exist:
- ✅ src/lib/bids/sections.ts
- ✅ src/lib/bids/bid-templates.ts
- ✅ src/lib/bids/mock-generator.ts

All commits exist:
- ✅ 4ae8c67 (Task 1: section mapping and templates)
- ✅ 16c4576 (Task 2: mock generator and server action)
