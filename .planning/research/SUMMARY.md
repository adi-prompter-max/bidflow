# Project Research Summary

**Project:** BidFlow
**Domain:** AI-Assisted Bid Builder for EU Public Tenders
**Researched:** 2026-02-06
**Confidence:** MEDIUM

## Executive Summary

BidFlow is an AI-assisted platform for helping SMEs respond to EU public tenders. Expert practitioners in this domain emphasize that successful bid platforms must balance three competing forces: regulatory compliance complexity (EU + national + sector-specific rules), document heterogeneity (narrative sections, structured forms, legal declarations, evidence attachments), and SME time constraints (companies need value within minutes, not hours of setup).

The recommended approach is to build a modular Next.js monolith with TypeScript, using mocked external services (TED API, AI models) for MVP validation. Start with a narrow scope (specific countries/sectors) and progressively expand regulatory coverage. The architecture should separate concerns clearly: TED ingestion, tender matching, bid generation pipeline, compliance validation, and document export as distinct services with defined interfaces. This enables incremental complexity addition while maintaining testability.

Key risks center on three areas: (1) treating TED data as clean when it's highly variable, requiring robust normalization; (2) AI hallucination in high-stakes bid content, requiring multi-stage validation and human-in-the-loop workflows; and (3) underestimating EU regulatory complexity, requiring explicit scope definition and legal partnership. Mitigation involves building "dirty data" handling from day one, never fully automating bid submission without review, and scoping regulatory coverage narrowly for MVP before expanding.

## Key Findings

### Recommended Stack

**Core Technologies (HIGH confidence):**
- **Next.js 15 + React 19**: Full-stack framework eliminates need for separate backend; server components handle AI workloads efficiently; built-in API routes via tRPC for type-safe internal APIs
- **TypeScript 5.7+ + Prisma 6**: Database-first schema as source of truth; automatic type generation ensures end-to-end type safety from PostgreSQL through backend to frontend
- **PostgreSQL 16**: Structured tender data with JSON flexibility; full-text search for tender matching; proven for document-heavy applications
- **Vercel AI SDK**: Unified interface for multiple LLM providers (OpenAI, Anthropic); easy mock-to-real transition; streaming support for long-form generation
- **pdf-lib + docx**: Low-level control for PDF/DOCX export; critical for matching contracting authority templates

**UI/Forms Stack (HIGH confidence):**
- **shadcn/ui + Tailwind + Radix UI**: Industry standard for 2025/2026 TypeScript projects; accessible components; customizable without framework lock-in
- **React Hook Form + Zod**: Type-safe form management with validation; essential for structured Q&A workflow and compliance data collection

**What to avoid:**
- Express.js (unnecessary with Next.js API routes)
- Redux Toolkit (overkill; use Zustand for client state, TanStack Query for server state)
- MongoDB (PostgreSQL's JSON support handles flexibility while maintaining relational benefits)
- pdfmake (verbose API, poor TypeScript support)

### Expected Features

**Must have (table stakes):**
- Company Profile Management — foundation for matching and AI context
- Tender Discovery & Search — even with matching, users expect manual browse capability
- Tender Details View — users must see requirements before deciding to bid
- Guided Q&A Interface — plain-language prompts vs raw tender jargon; core UX innovation
- Bid Draft Saving — multi-day bid creation requires auto-save and manual save
- PDF/DOCX Export — submittable output in standard formats
- Deadline Tracking — visible countdowns prevent disqualification
- Basic Authentication — email/password; multi-role later
- Question-Answer Structure — mirror tender's section organization

**Should have (competitive advantage):**
- AI-Powered Tender Matching — semantic understanding of company-tender fit; automates discovery
- AI Bid Generation — transform plain-language answers into professional narratives; core value proposition
- Compliance Validation — proactive gap detection reduces disqualification risk
- Reusable Content Library — tag/retrieve past answers by topic; massive time-saver for repeat bidders
- Requirement Extraction — automatic parsing of tender requirements into structured Q&A

**Defer (v2+):**
- Real TED API Integration — mock sufficient for MVP; add when workflow validated
- Real-Time Collaboration — infrastructure complexity; most SMEs work sequentially
- Bid Quality Scoring — requires historical win/loss data (need 20+ completed bids first)
- Multi-Language Support — start English-only; localize after PMF
- Mobile App — bid creation is desktop activity; mobile for status checks is low ROI

**Anti-features (do NOT build):**
- Fully automated bidding without human review — legal liability, quality concerns
- Generic bid templates — evaluators penalize cookie-cutter responses
- Real-time TED sync — overkill for SMEs; daily/weekly batch acceptable
- Blockchain submission — no procurement portal supports this
- Built-in contract management — scope creep; stay focused on pre-award bidding

### Architecture Approach

The standard architecture for this domain is a **modular monolith** with clear service boundaries that can later extract to microservices if needed. Start with Next.js handling both frontend and backend in single deployment; avoid premature separation.

**Major components:**
1. **TED Ingestion Service** — background job polling TED API (mocked); parse, normalize, store tender data with quality scoring for dirty data handling
2. **Tender Matching Engine** — pluggable scoring strategies (keyword-based, industry match, certification requirements); composite scoring with configurable weights
3. **Bid Generation Pipeline** — command pattern with stages: gather inputs → build prompts → generate content → validate compliance; each stage testable independently
4. **Compliance Validator** — requirement checklist vs bid coverage; start with completeness checks (Level 1), evolve to semantic validation (Level 3+)
5. **Document Export Service** — template-based PDF/DOCX generation; support heterogeneous section types (narratives, forms, tables, declarations)

**Key patterns:**
- **Adapter Pattern** for external services (TED API, AI models) — easy mock-to-real transition
- **Repository Pattern** for data access — domain logic isolated from persistence
- **Strategy Pattern** for tender matching — pluggable algorithms, A/B testable
- **Command Pipeline** for bid generation — multi-stage transformation with intermediate validation

**Critical architectural decisions:**
- Database-first schema (Prisma) generates TypeScript types, not reverse
- tRPC for internal API (type-safe frontend-backend); REST only if public API needed later
- React Server Components for data-heavy pages (tender lists); Client Components for interactivity (forms, editors)
- Background job queue (Bull) for TED sync and AI generation; don't block request-response

### Critical Pitfalls

1. **Treating TED Data as Clean, Structured Input**
   - **Problem:** TED data quality varies wildly; inconsistent formatting, missing fields, incorrect categorization. Parser breaks on 30-40% of real notices.
   - **Prevention:** Build "dirty data pipeline" from day one with normalization layers; test against 200+ random notices from diverse member states; implement fuzzy matching for dates/amounts; create data quality score per tender; store raw notice alongside parsed data for debugging.
   - **Phase:** Address in Phase 1 (TED Integration) — not a post-launch fix.

2. **Generating Bids Without Domain Knowledge Validation**
   - **Problem:** AI generates fluent but factually wrong content (hallucinated certifications, impossible promises). Users submit and get disqualified.
   - **Prevention:** Multi-stage validation: AI generates → rule-based compliance check → factual claims verification against company database. Maintain "cannot hallucinate" list (insurance, certifications, financials must come from verified data). Show confidence scores per section. Require manual review for any claim exceeding documented capabilities.
   - **Phase:** Address in Phase 3 (AI Generation) AND Phase 4 (Compliance Validation) — validation architected alongside generation.

3. **Underestimating EU Procurement Regulation Complexity**
   - **Problem:** Platform advises users to submit bids violating procurement directives; regulatory landscape is fractal (EU → national → sector → authority-specific rules).
   - **Prevention:** Don't build compliance engine from scratch — partner with legal experts or license rule databases. For MVP, explicitly scope to specific countries + sectors (e.g., "Italy IT tenders only"). Implement "compliance confidence level" per tender. Provide regulatory disclaimers. Build feedback loop when users report gaps.
   - **Phase:** Scope definition in Phase 0 (Research); incremental validation in Phase 4 (Compliance).

4. **Ignoring the "SME Time Poverty" Problem**
   - **Problem:** Extensive setup (data entry, document uploads, questionnaires) before showing value. SMEs abandon during onboarding.
   - **Prevention:** "Value in 5 minutes" rule — show tender matches before asking for detailed profile. Progressive profiling: minimal data for first bid, build over time. Import company data automatically (registries, LinkedIn). Offer "quick start" mode. Track time-to-first-value and optimize.
   - **Phase:** Architect for incremental data collection in Phase 2 (Company Profiling) from day one.

5. **Treating Bid Documents as Uniform Text Generation**
   - **Problem:** EU tenders require mix of narratives, structured forms, legal declarations, tables, evidence attachments. AI-generated prose insufficient.
   - **Prevention:** Analyze 50+ real tender documents to map output formats. Build separate workflows for narrative generation, form filling, compliance declarations, document assembly. Use form builders for structured sections, not free text + AI. Support common evidence documents: upload once, reuse across bids. Implement "bid document compiler" assembling heterogeneous sections.
   - **Phase:** Address in Phase 3 (AI Generation) AND Phase 5 (Document Export) — treat as structured assembly problem.

**Other notable pitfalls:**
- TED API rate limits and data staleness — design for eventual consistency, aggressive caching, pre-fetching
- One-size-fits-all AI models — section-specific prompts (technical vs financial vs management have different styles/requirements)
- Poor company profile data model — reverse-engineer from winning bids to identify critical fields, not intuition
- Performance traps — pagination, background generation, caching match scores essential at scale

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 0: Foundation & Research Validation
**Rationale:** Before building, validate technical assumptions and scope regulatory coverage. Stack research identified medium-confidence areas (PDF generation libraries, eForms standard details) needing verification. Pitfalls research emphasized regulatory complexity requiring narrow scope definition.

**Delivers:**
- Verified versions of Next.js 15, Prisma 6, Vercel AI SDK compatibility
- Regulatory scope document (which countries/sectors for MVP)
- Analysis of 50+ real tender documents and winning bids (output format requirements)
- Legal partnership or rule database licensing decision

**Avoids:** Building generic solution that doesn't fit actual procurement formats; over-promising compliance capabilities

### Phase 1: TED Integration & Tender Discovery
**Rationale:** Can't test matching or bid generation without tender data. Must build "dirty data" handling from start per Pitfall 1. Architecture defines TED Ingestion as foundational service with no dependencies.

**Delivers:**
- Mocked TED API with 200+ diverse notices (test data quality variability)
- Tender data model with normalization pipeline
- Basic tender browser UI (search, filter by sector/deadline/value)
- Tender details view
- Data quality scoring system

**Addresses (Features):** Tender Discovery & Search, Tender Details View

**Implements (Architecture):** TED Ingestion Service, Tender Repository

**Avoids (Pitfall 1):** Dirty TED data — normalization built-in, not retrofitted

**Stack elements:** PostgreSQL (tender storage), Next.js API routes (REST endpoints), Fuse.js (client-side search)

**Research flag:** Standard pattern (well-documented API integration), skip `/gsd:research-phase`

### Phase 2: Company Profiling & Matching
**Rationale:** Matching depends on having both tender data (Phase 1) and company profiles. Progressive profiling critical per Pitfall 4 (SME time poverty). Architecture defines Matching Engine as dependent on both data sources.

**Delivers:**
- Company profile CRUD (industries, capabilities, certifications, past projects)
- Progressive profiling flow (minimal → expanded over time)
- Matching engine with pluggable strategies (keyword, industry, certification)
- Match scoring and results caching
- Personalized tender feed

**Addresses (Features):** Company Profile Management, AI-Powered Tender Matching (v1: rule-based; v2: semantic)

**Implements (Architecture):** Matching Engine (Strategy Pattern), Company Profile Repository

**Avoids (Pitfall 4):** Time poverty — show value before extensive data entry

**Stack elements:** Prisma schema for profiles, Zustand (client state for onboarding flow), TanStack Query (match results caching)

**Research flag:** Standard pattern (established matching algorithms), skip `/gsd:research-phase`

### Phase 3: Bid Creation Workflow & Q&A
**Rationale:** Core user workflow: select tender → answer questions → generate bid. Must establish workflow and data collection before AI generation. Architecture defines Bid Builder UI and draft persistence as prerequisites for generation pipeline.

**Delivers:**
- Bid workspace (link tender to draft)
- Requirement extraction (manual/template-based for MVP; AI later)
- Guided Q&A interface (plain-language prompts per tender section)
- Draft persistence with auto-save and version control
- Bid status tracking (Draft/Review/Finalized)
- Progress indicators

**Addresses (Features):** Guided Q&A Interface, Bid Draft Saving, Question-Answer Structure, Bid Status Tracking

**Implements (Architecture):** Bid Builder UI, Draft Storage (with versioning per Architecture notes)

**Avoids (Pitfall 5):** Uniform text generation — Q&A captures structured vs narrative needs early

**Stack elements:** React Hook Form + Zod (form validation), shadcn/ui (stepper, dialog, form components), Prisma (draft model with relations)

**Research flag:** Standard pattern (form-heavy CRUD workflow), skip `/gsd:research-phase`

### Phase 4: AI Bid Generation (Mocked)
**Rationale:** Prove value proposition (plain answers → professional bid content) with mocked AI before real API costs/complexity. Architecture's Command Pipeline pattern enables mock implementation that swaps to real later. Must address Pitfall 2 (AI hallucination) with validation from start.

**Delivers:**
- Mock AI client (template-based responses)
- Bid generation pipeline (gather inputs → build prompts → generate content)
- Section-specific prompt templates (technical, financial, management, social value)
- AI response preview and editing
- Regeneration capability

**Addresses (Features):** AI Bid Generation (mocked), Smart Sectioning

**Implements (Architecture):** AI Orchestration Service, Bid Generation Engine (Command Pipeline pattern)

**Avoids (Pitfall 2 partially):** Hallucination risk reduced by mocked responses for MVP; sets up validation architecture

**Avoids (Pitfall 7):** One-size-fits-all AI — section-specific templates from start

**Stack elements:** Adapter pattern (MockAIClient interface), Vercel AI SDK structure (prepare for real integration), background job queue (async generation)

**Research flag:** NEEDS RESEARCH — prompt engineering for bid writing is specialized domain; `/gsd:research-phase` for prompt template development

### Phase 5: Compliance Validation & Export
**Rationale:** Validate bid completeness/correctness before export. Critical for user confidence and avoiding disqualifications. Architecture treats validation as separate stage in pipeline. Must handle heterogeneous document formats per Pitfall 5.

**Delivers:**
- Compliance validator (Level 1: completeness checks — all mandatory questions answered)
- Requirement traceability matrix (requirement → bid section mapping)
- Gap flagging and warnings
- PDF/DOCX export with formatting
- Document preview
- Template-based generation for structured sections (forms, tables, declarations)

**Addresses (Features):** Compliance Validation (basic), PDF/DOCX Export, Document Upload/Attachment

**Implements (Architecture):** Compliance Validator, Document Export Service

**Avoids (Pitfall 3 partially):** Regulatory complexity — start with basic completeness, expand to rules later

**Avoids (Pitfall 5):** Document heterogeneity — separate workflows for narratives vs forms vs declarations

**Stack elements:** pdf-lib (PDF generation), docx library (DOCX generation), Zod schemas (structured form validation)

**Research flag:** NEEDS RESEARCH — PDF/DOCX template requirements vary by authority; `/gsd:research-phase` for format analysis

### Phase 6: Authentication & Multi-Tenancy
**Rationale:** Deferred until core workflow proven because auth complexity distracts from value proposition validation. Architecture notes multi-tenant data isolation (row-level security) as critical security requirement.

**Delivers:**
- Email/password authentication
- Session management (JWT)
- Multi-tenant data isolation (row-level security, company_id filtering)
- Basic role system (single user per company for MVP)

**Addresses (Features):** User Authentication

**Implements (Architecture):** Multi-tenant security (middleware checks, audit logging per Architecture notes)

**Avoids (Architecture anti-pattern):** Complex workflow engines — simple single-user model for MVP

**Stack elements:** NextAuth.js 5, bcryptjs (password hashing), Jose (JWT handling)

**Research flag:** Standard pattern (established auth flow), skip `/gsd:research-phase`

### Phase 7: Real AI Integration
**Rationale:** After mocked AI proves value, swap to real LLM API. Adapter pattern from Phase 4 enables clean swap. Must implement Pitfall 2 mitigations (factual validation, confidence scoring) here.

**Delivers:**
- Real AI client (OpenAI/Anthropic integration)
- Production prompt templates (tuned for quality)
- Factual claim validation (check against company evidence database)
- Confidence scoring per section
- "Cannot hallucinate" field enforcement (insurance, certifications from verified data only)
- Diff view for regeneration

**Addresses (Features):** AI Bid Generation (real), Reusable Content Library (enhance generation with past content)

**Implements (Architecture):** Swap MockAIClient → AnthropicAIClient via Adapter Pattern

**Avoids (Pitfall 2):** AI hallucination — multi-stage validation, confidence scores, human-in-the-loop

**Stack elements:** Vercel AI SDK (provider abstraction), OpenAI SDK or Anthropic SDK, streaming (for long responses)

**Research flag:** NEEDS RESEARCH — production prompt engineering, RAG for content library; `/gsd:research-phase` for prompt optimization

### Phase 8: Real TED Integration
**Rationale:** After workflow validated with mocked data, connect to real TED API. Must handle rate limits and data freshness per Pitfall 6. Architecture defines ingestion as background job with polling strategy.

**Delivers:**
- Real TED API client (with authentication)
- Background sync job (daily/weekly batch updates)
- Rate limit handling (caching, pre-fetching, budgeting)
- Change detection (amendments, cancellations)
- User notifications for tender updates

**Addresses (Features):** Real TED API Integration (was deferred from MVP)

**Implements (Architecture):** TED Ingestion Service (swap mock → real, keeping normalization pipeline)

**Avoids (Pitfall 1):** Dirty data — normalization already built in Phase 1

**Avoids (Pitfall 6):** API limits — caching and background processing designed-in

**Stack elements:** Background job queue (Bull), webhook support (if TED provides), incremental sync logic

**Research flag:** NEEDS RESEARCH — TED API specifics (authentication, rate limits, eForms standard); `/gsd:research-phase` for API integration details

### Phase Ordering Rationale

**Dependencies:**
- Phases 1-2 are parallel-capable (no interdependencies) but Phase 2 benefits from having tender data to test matching
- Phases 3-5 are sequential: can't generate bids without Q&A workflow (3 → 4); can't validate without generation (4 → 5)
- Phase 6 (Auth) is independent, can be parallel with Phases 3-5 but deferred for focus
- Phases 7-8 are swaps of mocked implementations, depend on their mock-building phases being complete

**Groupings by architecture:**
- **Data Foundation (Phases 1-2):** Establish tender and company data models, repositories, basic matching
- **Core Workflow (Phases 3-5):** End-to-end bid creation from selection through export
- **Production Hardening (Phases 6-8):** Auth, real integrations, scaling concerns

**Pitfall avoidance:**
- Early phases address foundational pitfalls (dirty data, time poverty, document heterogeneity)
- Middle phases implement validation architecture (hallucination prevention, compliance checking)
- Late phases handle external complexity (regulatory scope, API integration)

### Research Flags

**Phases likely needing `/gsd:research-phase` during planning:**
- **Phase 4 (AI Bid Generation - Mocked):** Prompt engineering for procurement domain is specialized; section-specific templates need research
- **Phase 5 (Compliance Validation & Export):** PDF/DOCX format requirements vary by contracting authority; need template analysis
- **Phase 7 (Real AI Integration):** Production prompt optimization and RAG for content library; model selection (GPT-4 vs Claude vs fine-tuned)
- **Phase 8 (Real TED Integration):** TED API authentication, rate limits, eForms standard details need verification

**Phases with standard patterns (skip research):**
- **Phase 1:** REST API integration and data normalization are well-documented
- **Phase 2:** Matching algorithms and profile management are established patterns
- **Phase 3:** Form-heavy CRUD workflows are standard Next.js/React patterns
- **Phase 6:** NextAuth.js authentication is thoroughly documented

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM-HIGH | Core technologies (Next.js, TypeScript, PostgreSQL, Prisma) are industry standard with HIGH confidence. AI integration (Vercel AI SDK) is MEDIUM (need to verify current API patterns). Document generation libraries (pdf-lib, docx) are MEDIUM (need to test against real tender templates). Version numbers based on January 2025 training data — recommend verification. |
| Features | MEDIUM | Table stakes features have HIGH confidence (consistent across similar platforms). Differentiators and anti-features have MEDIUM confidence (based on domain knowledge, not user interviews). MVP definition is reasonable but should be validated with 5-10 SMEs who've bid on EU tenders. Feature prioritization matrix is logical but untested. |
| Architecture | MEDIUM-HIGH | Architectural patterns (Adapter, Repository, Strategy, Command Pipeline) are well-established with HIGH confidence. Domain-specific concerns (dirty data, versioning, compliance validation, multi-tenancy) are MEDIUM confidence — patterns are sound but EU procurement specifics need validation. Component boundaries and data flows are logical. Build order dependencies are well-reasoned. |
| Pitfalls | MEDIUM | Critical pitfalls are based on established domain knowledge (EU procurement systems, AI content generation, SME software adoption patterns) but lack external verification due to web access restrictions. Pitfalls are plausible and align with similar domains, but should be validated with SME interviews and analysis of real TED data. Recovery strategies are reasonable. Phase mapping is sound. |

**Overall confidence:** MEDIUM

Research is comprehensive and internally consistent, but limited by:
1. No web verification (training data through January 2025)
2. No user research (SME interviews, winning bid analysis)
3. No real TED API testing (rate limits, data quality)
4. No procurement legal expert consultation

### Gaps to Address

**During Phase 0 (Foundation):**
- [ ] Verify current versions of all stack components (npm registry check)
- [ ] Check Next.js 15 + Prisma 6 + tRPC 11 compatibility matrix
- [ ] Test pdf-lib and docx libraries against sample tender templates
- [ ] Research Vercel AI SDK current best practices (streaming, error handling)

**During Planning (Before Implementation):**
- [ ] Analyze 50+ real tender documents from target sectors to validate output format requirements
- [ ] Interview 5-10 SMEs who bid on EU tenders to validate feature prioritization and pain points
- [ ] Consult procurement legal expert to scope regulatory coverage for MVP (which countries/sectors feasible)
- [ ] Review official TED API documentation (authentication, rate limits, eForms standard)
- [ ] Examine winning bid examples to reverse-engineer company profile data requirements

**During Phase 1 (TED Integration):**
- [ ] Test against 200+ real TED notices to validate data quality assumptions and normalization logic
- [ ] Measure actual parsing success rate (target >90%)
- [ ] Benchmark fuzzy matching performance at scale (10,000+ tenders)

**During Phase 4 (AI Generation):**
- [ ] Research procurement-specific prompt engineering patterns (technical vs narrative sections)
- [ ] Test LLM provider options (OpenAI GPT-4 vs Anthropic Claude) for bid writing quality
- [ ] Validate section-specific temperature settings and prompt templates

**During Phase 5 (Export):**
- [ ] Catalog PDF/DOCX requirements across target contracting authorities (template variations)
- [ ] Test export libraries against real-world document complexity (tables, multilingual, special characters)

**During Phase 8 (Real TED Integration):**
- [ ] Verify TED API rate limits and quota policies
- [ ] Test webhook availability for real-time tender updates vs polling requirements
- [ ] Validate eForms standard parsing requirements

**Regulatory Scope Decision (Critical for MVP feasibility):**
- [ ] Explicitly define which EU member states, procurement types (above/below threshold), and sectors (IT, construction, consulting) are in-scope for MVP
- [ ] Document which compliance rules are automated vs flagged for manual review
- [ ] Partner with legal expert or license existing procurement rule database (don't build from scratch per Pitfall 3)

## Sources

### Primary (HIGH confidence)
- EU Procurement Directives 2014/24/EU and 2014/25/EU (public sector procurement framework)
- TypeScript/Node.js ecosystem patterns (Next.js, Prisma, React best practices through January 2025)
- TED (Tenders Electronic Daily) platform architecture (training knowledge)
- Standard document automation and AI content generation patterns

### Secondary (MEDIUM confidence)
- Training knowledge of similar platforms (RFP response tools, procurement management systems)
- AI-assisted writing tools (prompt engineering patterns, validation strategies)
- SME software adoption patterns and time-constraint considerations
- Established architectural patterns (Adapter, Repository, Strategy, Command) for TypeScript applications

### Tertiary (LOW confidence, needs validation)
- Specific version numbers for stack components (based on January 2025 training cutoff; may have updates)
- TED API rate limits and data quality (not verified; based on typical API patterns)
- Procurement compliance complexity specifics (general domain knowledge; legal consultation needed)
- Bid writing quality requirements per sector (needs real bid analysis)

### Limitations
**Research conducted without:**
- Web access (WebFetch/Context7 unavailable)
- User interviews (no primary research with SMEs)
- Real TED API access (no testing of actual data quality or rate limits)
- Legal expert consultation (regulatory scope assumptions unvalidated)
- Winning bid examples (output format requirements inferred)

**Recommended verification steps:**
1. Check npm for current versions: `npm view <package> version`
2. Verify Next.js compatibility: https://nextjs.org/docs
3. Review Vercel AI SDK docs: https://sdk.vercel.ai/docs
4. Analyze real TED notices: https://ted.europa.eu/TED/browse/browseByMap.do
5. Consult procurement legal expert for regulatory scope
6. Interview 5-10 SMEs who've bid on EU tenders

---
*Research completed: 2026-02-06*
*Ready for roadmap: yes*
*Next step: Requirements definition (gsd-requirements-definer) will use this to structure PRD*
