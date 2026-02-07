# Requirements: BidFlow

**Defined:** 2026-02-06
**Core Value:** SMEs can go from "here's a relevant tender" to "here's a ready-to-submit bid document" without needing procurement expertise or consultants.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [x] **AUTH-01**: User can sign up with email and password
- [x] **AUTH-02**: User can log in and maintain session across browser refresh
- [x] **AUTH-03**: System ships with seed demo data for MVP testing (demo company, tenders, sample bids)

### Company Profile

- [x] **PROF-01**: User can select industry and sector (IT & Software, Construction)
- [x] **PROF-02**: User can describe capabilities and services (free-text and tags)
- [x] **PROF-03**: User can add certifications (ISO, security clearances, industry certs)
- [x] **PROF-04**: User can add past projects and references as portfolio evidence

### Tender Discovery

- [ ] **TEND-01**: User can browse a list of mock tenders with key details (title, sector, value, deadline)
- [ ] **TEND-02**: User can filter tenders by sector, estimated value, and deadline
- [ ] **TEND-03**: System matches and ranks tenders by relevance to company profile
- [ ] **TEND-04**: User can view full tender details including requirements, deadlines, and documents

### Bid Creation

- [ ] **BID-01**: Platform presents structured plain-language questions mapped to tender requirements
- [ ] **BID-02**: System auto-saves bid drafts as user progresses through questions
- [ ] **BID-03**: User can track bid status (Draft / In Review / Finalized)
- [ ] **BID-04**: System displays deadline countdown on active bids

### AI Generation

- [ ] **AGEN-01**: System extracts and structures requirements from tender data into sections
- [ ] **AGEN-02**: AI generates professional bid narratives from plain-language answers (mocked for MVP)
- [ ] **AGEN-03**: Generation happens section-by-section with progress indication

### Validation & Export

- [ ] **VALD-01**: System checks content completeness against all tender requirements and flags gaps
- [ ] **VALD-02**: User can review and edit AI-generated content before export
- [ ] **VALD-03**: User can export completed bid as formatted PDF
- [ ] **VALD-04**: User can export completed bid as formatted DOCX

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### AI Integration

- **AIRT-01**: Swap mocked AI for real LLM API (GPT-4, Claude, or free alternative)
- **AIRT-02**: Implement domain-specific prompts per bid section type (technical, financial, methodology)

### TED Integration

- **TEDI-01**: Connect to real TED API for live tender data ingestion
- **TEDI-02**: Handle tender amendments, cancellations, and deadline changes

### Content Management

- **CONT-01**: Reusable content library (store past answers for reuse across bids)
- **CONT-02**: Document attachment management (upload certifications, references)

### Collaboration

- **COLB-01**: Multi-user roles (Writer, Reviewer, Admin) with permissions
- **COLB-02**: Password reset via email link

### Advanced Features

- **ADVF-01**: Advanced compliance validation (semantic gap detection, keyword matching)
- **ADVF-02**: Deadline notifications via email
- **ADVF-03**: Bid quality scoring based on completeness and keyword coverage

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Freelancer marketplace | Future vision, not MVP |
| Investor-backed bids | Future vision, not MVP |
| Automated consortium formation | Future vision, not MVP |
| Direct TED/eSender submission | MVP is export-only, manual submission |
| OAuth/social login | Email/password sufficient for MVP |
| Mobile app | Web-first; bids are desktop workflow |
| Multi-language support | English only for MVP |
| Payment/billing | No monetization in MVP |
| Real-time collaboration | High complexity, SMEs work sequentially |
| Template adaptation/learning | Requires historical win/loss data |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| PROF-01 | Phase 2 | Complete |
| PROF-02 | Phase 2 | Complete |
| PROF-03 | Phase 2 | Complete |
| PROF-04 | Phase 2 | Complete |
| TEND-01 | Phase 3 | Pending |
| TEND-02 | Phase 3 | Pending |
| TEND-03 | Phase 3 | Pending |
| TEND-04 | Phase 3 | Pending |
| BID-01 | Phase 4 | Pending |
| BID-02 | Phase 4 | Pending |
| BID-03 | Phase 4 | Pending |
| BID-04 | Phase 4 | Pending |
| AGEN-01 | Phase 5 | Pending |
| AGEN-02 | Phase 5 | Pending |
| AGEN-03 | Phase 5 | Pending |
| VALD-01 | Phase 6 | Pending |
| VALD-02 | Phase 6 | Pending |
| VALD-03 | Phase 6 | Pending |
| VALD-04 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0

---
*Requirements defined: 2026-02-06*
*Last updated: 2026-02-06 after roadmap creation*
