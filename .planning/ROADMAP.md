# Roadmap: BidFlow

## Overview

BidFlow transforms EU tender responses for SMEs through six phases: authentication and demo data foundation, company profiling with progressive data collection, tender discovery with matching algorithms, bid workspace with structured Q&A, mocked AI generation for professional narratives, and validation with compliant document export. Each phase delivers a coherent capability that enables the next, culminating in end-to-end bid creation without procurement expertise.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Authentication** - User accounts with demo data for immediate testing
- [ ] **Phase 2: Company Profiling** - SME profile management with capabilities and credentials
- [ ] **Phase 3: Tender Discovery** - Browse, filter, and match tenders to company profile
- [ ] **Phase 4: Bid Workspace** - Structured Q&A workflow with draft management
- [ ] **Phase 5: AI Bid Generation** - Transform plain answers into professional bid narratives (mocked)
- [ ] **Phase 6: Validation & Export** - Content validation and compliant PDF/DOCX export

## Phase Details

### Phase 1: Foundation & Authentication
**Goal**: Users can access the platform with secure accounts and explore pre-loaded demo data
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03
**Success Criteria** (what must be TRUE):
  1. User can create an account with email and password
  2. User can log in and session persists across browser refresh
  3. User can log out from any page
  4. Demo company profile, sample tenders, and example bids exist in database for immediate testing
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Project bootstrap, database schema, and seed data
- [x] 01-02-PLAN.md — Authentication system (Auth.js v5, server actions, login/signup UI)
- [x] 01-03-PLAN.md — Protected dashboard, app header with logout, landing page

### Phase 2: Company Profiling
**Goal**: SMEs can create and manage comprehensive company profiles that drive tender matching
**Depends on**: Phase 1
**Requirements**: PROF-01, PROF-02, PROF-03, PROF-04
**Success Criteria** (what must be TRUE):
  1. User can select industry sectors (IT & Software, Construction)
  2. User can describe capabilities using free-text descriptions and tags
  3. User can add certifications (ISO, security clearances, industry-specific)
  4. User can add past projects with descriptions and references
  5. Profile data persists and displays correctly across sessions
**Plans**: 4 plans

Plans:
- [ ] 02-01-PLAN.md — Database schema evolution, Zod validations, shadcn/ui components
- [ ] 02-02-PLAN.md — Server actions for profile CRUD, wizard shell with Steps 1-2
- [ ] 02-03-PLAN.md — Wizard Steps 3-5 (Capabilities, Certifications, Past Projects)
- [ ] 02-04-PLAN.md — Dashboard completeness card, profile view/edit page, visual verification

### Phase 3: Tender Discovery
**Goal**: Users can discover, filter, and identify relevant tender opportunities matched to their profile
**Depends on**: Phase 2
**Requirements**: TEND-01, TEND-02, TEND-03, TEND-04
**Success Criteria** (what must be TRUE):
  1. User can browse a list of mock tenders showing title, sector, estimated value, and deadline
  2. User can filter tenders by sector, value range, and deadline date
  3. System displays tender relevance scores based on company profile match
  4. User can view full tender details including requirements, deadlines, and documents
  5. Tenders are sorted by relevance score by default
**Plans**: TBD

Plans:
- [ ] 03-01: TBD during planning

### Phase 4: Bid Workspace
**Goal**: Users can create and manage bid drafts through structured Q&A workflow with auto-save
**Depends on**: Phase 3
**Requirements**: BID-01, BID-02, BID-03, BID-04
**Success Criteria** (what must be TRUE):
  1. User can start a new bid from any tender detail page
  2. System presents structured plain-language questions mapped to tender requirements
  3. User answers are automatically saved as draft progresses
  4. User can see bid status (Draft / In Review / Finalized) at any time
  5. User can see deadline countdown on active bid workspace
  6. User can return to draft bid and resume from last answered question
**Plans**: TBD

Plans:
- [ ] 04-01: TBD during planning

### Phase 5: AI Bid Generation
**Goal**: Users can generate professional bid narratives from plain-language answers using mocked AI
**Depends on**: Phase 4
**Requirements**: AGEN-01, AGEN-02, AGEN-03
**Success Criteria** (what must be TRUE):
  1. System extracts tender requirements and structures them into bid sections
  2. User can trigger AI generation for completed Q&A sections
  3. System generates professional bid narratives from plain-language answers (mocked responses)
  4. Generation happens section-by-section with visible progress indication
  5. Generated content appears in bid workspace for review
**Plans**: TBD

Plans:
- [ ] 05-01: TBD during planning

### Phase 6: Validation & Export
**Goal**: Users can validate bid completeness, review/edit content, and export compliant documents
**Depends on**: Phase 5
**Requirements**: VALD-01, VALD-02, VALD-03, VALD-04
**Success Criteria** (what must be TRUE):
  1. System checks bid content against all tender requirements and flags missing responses
  2. User can review all generated content in single view
  3. User can edit any AI-generated section before export
  4. User can export completed bid as formatted PDF
  5. User can export completed bid as formatted DOCX
  6. Exported documents are properly formatted and submittable
**Plans**: TBD

Plans:
- [ ] 06-01: TBD during planning

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Authentication | 3/3 | Complete | 2026-02-06 |
| 2. Company Profiling | 0/4 | Planned | - |
| 3. Tender Discovery | 0/TBD | Not started | - |
| 4. Bid Workspace | 0/TBD | Not started | - |
| 5. AI Bid Generation | 0/TBD | Not started | - |
| 6. Validation & Export | 0/TBD | Not started | - |

---
*Roadmap created: 2026-02-06*
*Coverage: 22/22 v1 requirements mapped*
