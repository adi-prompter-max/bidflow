# Architecture Research

**Domain:** AI-assisted bid builder / EU procurement platform
**Researched:** 2026-02-06
**Confidence:** MEDIUM (based on training knowledge of similar enterprise document automation platforms; no external verification due to tool access restrictions)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │Dashboard │  │ Tender   │  │   Bid    │  │ Profile  │    │
│  │   UI     │  │ Browser  │  │ Builder  │  │  Mgmt    │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
├───────┴──────────────┴──────────────┴──────────────┴────────┤
│                   APPLICATION LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Tender Matching │  │  Bid Generation │  │ Compliance  │ │
│  │    Engine       │  │     Engine      │  │  Validator  │ │
│  └────────┬────────┘  └────────┬────────┘  └──────┬──────┘ │
│           │                     │                   │        │
│  ┌────────┴────────┐  ┌────────┴────────┐  ┌──────┴──────┐ │
│  │  TED Ingestion  │  │   AI Orchestr.  │  │  Document   │ │
│  │     Service     │  │     Service     │  │   Export    │ │
│  └────────┬────────┘  └────────┬────────┘  └──────┬──────┘ │
├───────────┴──────────────────────┴───────────────────┴──────┤
│                      DATA LAYER                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Company │  │ Tender  │  │   Bid   │  │  User   │        │
│  │ Profiles│  │ Database│  │ Drafts  │  │   DB    │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
├─────────────────────────────────────────────────────────────┤
│                   EXTERNAL INTEGRATIONS                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ TED API  │  │ AI Model │  │ Document │  │  Email   │    │
│  │(mocked)  │  │ (mocked) │  │  Export  │  │ Service  │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **TED Ingestion Service** | Fetch, parse, normalize tender data from TED API | Background job scheduler (cron/Bull) + REST client |
| **Tender Matching Engine** | Score tenders against company profiles based on industry, capabilities, keywords | Rule-based scoring algorithm + keyword extraction |
| **Bid Builder UI** | Structured Q&A workflow, progress tracking, section navigation | Multi-step form wizard with state management |
| **AI Orchestration Service** | Prompt construction, AI request management, response parsing | LLM client wrapper + prompt templates + retry logic |
| **Bid Generation Engine** | Transform user inputs + tender requirements into bid documents | Template engine + AI-assisted content generation |
| **Compliance Validator** | Check bid completeness against tender requirements | Requirement checklist + coverage analysis |
| **Document Export** | Convert bid drafts to PDF/DOCX format | Templating library (Handlebars/EJS) + document generator (PDFKit, docx) |
| **Company Profile Store** | CRUD for company data, capabilities, certifications, past projects | PostgreSQL/MongoDB with structured schema |
| **Tender Database** | Store ingested tender data with searchable metadata | Relational DB with full-text search (Postgres) or document DB |
| **Bid Drafts Store** | Versioned storage of work-in-progress bids | Document store with revision history |

## Recommended Project Structure

```
bidflow/
├── backend/
│   ├── src/
│   │   ├── api/                  # REST API routes
│   │   │   ├── auth/             # Authentication endpoints
│   │   │   ├── profiles/         # Company profile management
│   │   │   ├── tenders/          # Tender browsing and matching
│   │   │   └── bids/             # Bid creation and export
│   │   ├── services/             # Core business logic
│   │   │   ├── ted-ingestion/    # TED API integration
│   │   │   ├── matching/         # Tender matching engine
│   │   │   ├── ai-orchestration/ # AI prompt/response handling
│   │   │   ├── bid-generation/   # Bid document generation
│   │   │   ├── compliance/       # Requirement validation
│   │   │   └── export/           # PDF/DOCX generation
│   │   ├── models/               # Database models/schemas
│   │   │   ├── user.ts
│   │   │   ├── company-profile.ts
│   │   │   ├── tender.ts
│   │   │   └── bid-draft.ts
│   │   ├── lib/                  # Shared utilities
│   │   │   ├── ai-client.ts      # AI API wrapper (mocked)
│   │   │   ├── ted-client.ts     # TED API wrapper (mocked)
│   │   │   └── validators.ts     # Validation helpers
│   │   ├── jobs/                 # Background jobs
│   │   │   ├── tender-sync.ts    # Periodic TED sync
│   │   │   └── match-refresh.ts  # Re-score matches
│   │   └── config/               # Configuration
│   │       ├── database.ts
│   │       └── env.ts
│   ├── tests/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/                # Top-level route pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── TenderBrowser.tsx
│   │   │   ├── BidBuilder.tsx
│   │   │   └── ProfileSettings.tsx
│   │   ├── components/           # Reusable UI components
│   │   │   ├── TenderCard.tsx
│   │   │   ├── ProgressStepper.tsx
│   │   │   ├── QuestionForm.tsx
│   │   │   └── ComplianceChecklist.tsx
│   │   ├── features/             # Feature-specific logic
│   │   │   ├── matching/
│   │   │   ├── bid-builder/
│   │   │   └── profile/
│   │   ├── services/             # API client layer
│   │   │   ├── api.ts            # Base HTTP client
│   │   │   ├── tenders.ts
│   │   │   └── bids.ts
│   │   ├── store/                # State management
│   │   │   ├── user.ts
│   │   │   ├── tenders.ts
│   │   │   └── bid-draft.ts
│   │   └── utils/
│   ├── tests/
│   └── package.json
└── shared/
    ├── types/                    # Shared TypeScript types
    │   ├── tender.ts
    │   ├── bid.ts
    │   └── profile.ts
    └── constants/                # Shared constants
        └── industries.ts
```

### Structure Rationale

- **backend/services/:** Domain logic isolated from API routes enables testing and reuse across different interfaces (REST, jobs, etc.)
- **shared/types/:** Single source of truth for data contracts between frontend and backend prevents type mismatches
- **frontend/features/:** Feature-based organization (not technical layers) keeps related code together as app grows
- **jobs/:** Background processing separated from request-response cycle for TED sync and heavy computations

## Architectural Patterns

### Pattern 1: Adapter Pattern for External Services

**What:** Wrap external APIs (TED, AI models) behind internal interfaces with mock implementations

**When to use:** Any external dependency that may be unavailable, change providers, or need mocking for testing/MVP

**Trade-offs:**
- PRO: Easy to swap implementations (mock → real API)
- PRO: Isolates external API changes to single adapter
- CON: Extra abstraction layer adds some code

**Example:**
```typescript
// backend/src/lib/ai-client.ts

export interface AIClient {
  generateBidSection(prompt: string, context: object): Promise<string>;
}

export class MockAIClient implements AIClient {
  async generateBidSection(prompt: string, context: object): Promise<string> {
    // Return canned response based on prompt type
    return "Mock AI response: This is a sample technical approach...";
  }
}

export class AnthropicAIClient implements AIClient {
  async generateBidSection(prompt: string, context: object): Promise<string> {
    // Real API call to Anthropic Claude
    const response = await this.client.messages.create({...});
    return response.content[0].text;
  }
}

// Factory selects implementation based on environment
export function createAIClient(): AIClient {
  return process.env.USE_MOCK_AI === 'true'
    ? new MockAIClient()
    : new AnthropicAIClient();
}
```

### Pattern 2: Command Pattern for Bid Generation Pipeline

**What:** Chain of processing steps that transform user inputs → AI prompts → generated content → validated output

**When to use:** Multi-stage document generation with different responsibilities at each stage

**Trade-offs:**
- PRO: Each step testable in isolation
- PRO: Easy to add/remove/reorder pipeline stages
- CON: More complex than direct generation for simple cases

**Example:**
```typescript
// backend/src/services/bid-generation/pipeline.ts

interface BidGenerationStep {
  execute(context: BidContext): Promise<BidContext>;
}

class GatherInputsStep implements BidGenerationStep {
  async execute(context: BidContext): Promise<BidContext> {
    // Collect user answers from Q&A
    context.userInputs = await this.fetchAnswers(context.bidId);
    return context;
  }
}

class BuildPromptsStep implements BidGenerationStep {
  async execute(context: BidContext): Promise<BidContext> {
    // Construct AI prompts from tender requirements + user inputs
    context.prompts = this.buildPrompts(
      context.tender.requirements,
      context.userInputs
    );
    return context;
  }
}

class GenerateContentStep implements BidGenerationStep {
  async execute(context: BidContext): Promise<BidContext> {
    // Call AI for each section
    context.generatedSections = await Promise.all(
      context.prompts.map(p => this.aiClient.generate(p))
    );
    return context;
  }
}

class ValidateComplianceStep implements BidGenerationStep {
  async execute(context: BidContext): Promise<BidContext> {
    // Check coverage of requirements
    context.validationResult = this.validator.check(
      context.tender.requirements,
      context.generatedSections
    );
    return context;
  }
}

export class BidGenerationPipeline {
  private steps: BidGenerationStep[] = [
    new GatherInputsStep(),
    new BuildPromptsStep(),
    new GenerateContentStep(),
    new ValidateComplianceStep()
  ];

  async execute(bidId: string): Promise<BidContext> {
    let context = { bidId };
    for (const step of this.steps) {
      context = await step.execute(context);
    }
    return context;
  }
}
```

### Pattern 3: Repository Pattern for Data Access

**What:** Abstract database operations behind domain-specific interfaces

**When to use:** Need to switch databases or isolate domain logic from persistence details

**Trade-offs:**
- PRO: Domain services don't know about database implementation
- PRO: Easy to swap Postgres → MongoDB or add caching layer
- CON: Extra abstraction for simple CRUD

**Example:**
```typescript
// backend/src/models/tender-repository.ts

export interface TenderRepository {
  findById(id: string): Promise<Tender | null>;
  findMatching(profile: CompanyProfile): Promise<Tender[]>;
  save(tender: Tender): Promise<void>;
}

export class PostgresTenderRepository implements TenderRepository {
  async findById(id: string): Promise<Tender | null> {
    const result = await this.db.query(
      'SELECT * FROM tenders WHERE id = $1',
      [id]
    );
    return result.rows[0] ? this.mapToTender(result.rows[0]) : null;
  }

  async findMatching(profile: CompanyProfile): Promise<Tender[]> {
    // Complex query with filtering and scoring
    const results = await this.db.query(`
      SELECT * FROM tenders
      WHERE industry = ANY($1)
        AND deadline > NOW()
        AND estimated_value >= $2
      ORDER BY published_date DESC
    `, [profile.industries, profile.minContractValue]);
    return results.rows.map(this.mapToTender);
  }

  async save(tender: Tender): Promise<void> {
    await this.db.query(
      'INSERT INTO tenders (...) VALUES (...) ON CONFLICT (id) DO UPDATE ...',
      [...]
    );
  }
}
```

### Pattern 4: Strategy Pattern for Matching Algorithms

**What:** Pluggable scoring algorithms for tender-to-company matching

**When to use:** Multiple ways to score relevance (keyword-based, ML-based, rule-based) with ability to A/B test

**Trade-offs:**
- PRO: Can experiment with different matching strategies
- PRO: Easy to combine multiple strategies
- CON: Overkill if only one matching approach needed

**Example:**
```typescript
// backend/src/services/matching/strategies.ts

export interface MatchingStrategy {
  score(tender: Tender, profile: CompanyProfile): number;
}

export class KeywordMatchStrategy implements MatchingStrategy {
  score(tender: Tender, profile: CompanyProfile): number {
    const tenderKeywords = this.extractKeywords(tender.description);
    const profileKeywords = new Set(profile.capabilities);
    const overlap = tenderKeywords.filter(k => profileKeywords.has(k));
    return overlap.length / tenderKeywords.length;
  }
}

export class IndustryMatchStrategy implements MatchingStrategy {
  score(tender: Tender, profile: CompanyProfile): number {
    return profile.industries.includes(tender.industry) ? 1.0 : 0.0;
  }
}

export class CompositeMatchingStrategy implements MatchingStrategy {
  constructor(
    private strategies: { strategy: MatchingStrategy, weight: number }[]
  ) {}

  score(tender: Tender, profile: CompanyProfile): number {
    let totalScore = 0;
    let totalWeight = 0;

    for (const { strategy, weight } of this.strategies) {
      totalScore += strategy.score(tender, profile) * weight;
      totalWeight += weight;
    }

    return totalScore / totalWeight;
  }
}

// Usage:
const matcher = new CompositeMatchingStrategy([
  { strategy: new IndustryMatchStrategy(), weight: 0.5 },
  { strategy: new KeywordMatchStrategy(), weight: 0.3 },
  { strategy: new CertificationMatchStrategy(), weight: 0.2 }
]);
```

## Data Flow

### 1. Tender Discovery and Matching Flow

```
TED API (mocked)
    ↓
[Ingestion Job] → Parse tender data → Normalize to internal schema
    ↓
[Tender DB] → Store tender with metadata
    ↓
[Matching Engine] → Score against all company profiles
    ↓
[Match Results] → Store scores, sort by relevance
    ↓
[Dashboard UI] ← Fetch top matches for user's company
```

**Key steps:**
1. Background job polls TED API (or uses webhook) for new tenders
2. Parser extracts structured data (title, description, requirements, deadline, value)
3. Matching engine runs scoring algorithms against each active company profile
4. Results cached with scores for fast dashboard loading
5. Users see personalized feed of relevant tenders

### 2. Bid Creation Flow

```
[User selects tender]
    ↓
[Bid Builder UI] → Create draft bid entity
    ↓
[Requirement Extraction] → Parse tender into structured questions
    ↓
[Q&A Session] ← Present questions to user
    ↓ (user provides answers)
[Draft Storage] → Save answers incrementally
    ↓
[Generation Trigger] → User requests AI assistance
    ↓
[AI Orchestration] → Build prompts from answers + requirements
    ↓
[AI Client (mocked)] → Generate narrative sections
    ↓
[Compliance Check] → Validate coverage of requirements
    ↓
[Preview UI] ← Show generated content + validation status
    ↓ (user reviews/edits)
[Export Service] → Generate PDF/DOCX
    ↓
[Download] ← User downloads final bid document
```

**Key steps:**
1. User initiates bid for specific tender
2. System extracts requirements from tender and converts to structured questions
3. User answers questions through guided workflow (with save/resume)
4. User triggers AI generation for specific sections or whole bid
5. AI service constructs prompts combining requirements + user context + answers
6. Generated content returned and merged with manual inputs
7. Compliance validator checks all requirements addressed
8. User reviews in preview mode, makes edits
9. Export service renders final document from template + content
10. User downloads for manual submission

### 3. Profile Management Flow

```
[User] → Edit company profile
    ↓
[Profile Form UI] → Collect industries, capabilities, certifications
    ↓
[Validation] → Ensure required fields present
    ↓
[Profile DB] → Update company profile
    ↓
[Match Refresh Job] → Trigger re-scoring of all tenders
    ↓
[Updated Matches] ← User sees new recommendations
```

### 4. State Management (Frontend)

```
[User Action] → UI Component
    ↓
[Action] → State Management (Redux/Zustand/Context)
    ↓
[API Service] → HTTP Request to Backend
    ↓
[State Update] ← Response
    ↓
[UI Re-render] ← Components re-render with new state
```

**Key considerations:**
- Optimistic updates for better UX (update UI immediately, rollback on error)
- Local caching of tender data to reduce API calls
- Draft auto-save to prevent data loss during bid creation
- Offline support not critical for MVP but consider local storage for drafts

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **TED API** | Polling + webhook (both mocked in MVP) | REST API with OAuth; rate limits apply; mock returns fixed dataset |
| **AI Model API** | Request-response (mocked in MVP) | Streaming for long responses; retry logic for rate limits; mock returns template-based content |
| **Email Service** | Async job queue | For notifications (new matches, bid deadlines); use Nodemailer or SendGrid; not critical for MVP |
| **Document Export** | Synchronous generation | PDFKit for PDF, docx library for DOCX; relatively fast (<5s) so can be request-response |
| **Authentication** | JWT tokens | Simple email/password → JWT stored client-side; no OAuth for MVP |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Frontend ↔ Backend** | REST API (JSON over HTTP) | Standard CRUD endpoints; consider GraphQL if query complexity grows |
| **API ↔ Services** | Direct function calls | Services are just TypeScript classes/functions, no need for message bus in monolith |
| **Services ↔ Data** | Repository pattern | Keeps services database-agnostic |
| **Background Jobs ↔ Services** | Shared service layer | Jobs import and call same services as API routes |

## Build Order and Dependencies

### Phase Dependencies

The architecture suggests this build order based on component dependencies:

1. **Foundation (no dependencies):**
   - User authentication
   - Company profile CRUD
   - Basic frontend shell (routing, layout)

2. **Data Layer (depends on foundation):**
   - Tender data model and mock dataset
   - TED ingestion service (mocked)
   - Tender storage and retrieval

3. **Matching (depends on data layer):**
   - Matching engine (scoring algorithms)
   - Match results storage
   - Tender browser UI

4. **Bid Creation (depends on matching):**
   - Bid draft model
   - Q&A workflow UI
   - Draft persistence and recovery

5. **AI Generation (depends on bid creation):**
   - AI client (mocked)
   - Prompt construction logic
   - Generation pipeline
   - AI-assisted content UI

6. **Validation and Export (depends on generation):**
   - Compliance validator
   - Requirement coverage checker
   - PDF/DOCX export
   - Document preview UI

**Critical path:** Cannot build bid generation without bid creation workflow; cannot test matching without tender data. Start with data models and basic CRUD, then layer on intelligence.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **0-1k users** | Monolith is fine; single server + database; mock external APIs |
| **1k-10k users** | Add caching layer (Redis) for match results; optimize database queries; connection pooling |
| **10k-100k users** | Separate background jobs to dedicated workers; add CDN for static assets; database read replicas |
| **100k+ users** | Consider microservices (TED ingestion, matching, generation as separate services); message queue (RabbitMQ/SQS); horizontal scaling; separate databases per service |

### Scaling Priorities

1. **First bottleneck: AI generation latency**
   - **Problem:** AI API calls slow, users wait during bid generation
   - **Solution:** Async generation with progress updates; queue system (Bull) for job processing; websockets for real-time status

2. **Second bottleneck: Database queries for matching**
   - **Problem:** Scoring all tenders against all profiles becomes slow
   - **Solution:** Cache match results; incremental scoring (only new tenders); materialized views for common queries

3. **Third bottleneck: Concurrent tender ingestion**
   - **Problem:** TED API rate limits, large batch imports
   - **Solution:** Distributed job queue; rate limiting; pagination; incremental sync

## Anti-Patterns

### Anti-Pattern 1: Premature Microservices

**What people do:** Split into microservices from day one (separate services for tenders, profiles, bids, AI)

**Why it's wrong:**
- Adds operational complexity (deployment, monitoring, service discovery)
- Network latency between services
- Harder to develop and debug locally
- Database transactions across services are complex
- No performance benefit until high scale

**Do this instead:**
- Start with modular monolith (separate services/ folders but single deployment)
- Use clear internal boundaries (repositories, services)
- Extract to microservices only when specific scaling need identified

### Anti-Pattern 2: Over-Abstraction of AI Layer

**What people do:** Build generic "AI service" that tries to handle all possible AI use cases with complex configuration

**Why it's wrong:**
- Each use case (bid generation, requirement extraction, compliance check) has unique needs
- Generic prompts produce worse results than specialized ones
- Configuration becomes complex and brittle
- Hard to test and debug

**Do this instead:**
- Purpose-built prompt templates for each use case
- Separate functions for each AI task with specific inputs/outputs
- Share only the HTTP client wrapper, not business logic

### Anti-Pattern 3: Real-Time Everything

**What people do:** Use websockets for all updates; live-updating dashboards; real-time collaboration

**Why it's wrong:**
- Adds significant complexity (connection management, state sync)
- Tender data changes slowly (daily at most)
- Bid creation is single-user activity, no need for collaboration in MVP
- Polling or user-triggered refresh is sufficient

**Do this instead:**
- Use request-response for most operations
- Add websockets only for long-running tasks (AI generation, document export)
- Manual refresh acceptable for tender list

### Anti-Pattern 4: Client-Side AI Prompt Construction

**What people do:** Build prompts in frontend, send to backend AI wrapper

**Why it's wrong:**
- Prompts expose system behavior and IP
- Frontend can't access full context (other users' bids, internal scoring)
- Prompt injection vulnerabilities
- Hard to version and A/B test prompts

**Do this instead:**
- All prompt construction on backend
- Frontend sends semantic intent (e.g., "generateTechnicalApproach")
- Backend builds prompt from templates + context + user input

### Anti-Pattern 5: Naive Requirement Extraction

**What people do:** Simple regex or keyword extraction from tender PDFs/HTML

**Why it's wrong:**
- Tender formats vary widely across EU countries
- Requirements often implicit or buried in narrative
- Structured vs unstructured sections hard to parse
- Quality of extraction determines quality of bid

**Do this instead:**
- For MVP: Manual requirement templating (admin defines requirements for each tender)
- Post-MVP: Use AI for requirement extraction as separate step with human review
- Don't automate end-to-end without validation loop

## Domain-Specific Architectural Concerns

### 1. Tender Data Synchronization

**Challenge:** TED publishes thousands of tenders; need efficient sync without overwhelming system

**Approach:**
- Incremental sync (only new tenders since last sync)
- Pagination and rate limiting
- Idempotent ingestion (same tender ingested multiple times = same result)
- Webhook support for real-time updates (when available)

### 2. Bid Versioning and Recovery

**Challenge:** Users may spend days on a bid; need auto-save, version history, recovery

**Approach:**
- Auto-save every N seconds or on field blur
- Event sourcing pattern for bid edits (store sequence of changes, not just final state)
- "Revert to version" capability
- Export version history metadata with final document

### 3. Compliance Validation Accuracy

**Challenge:** False negatives (missed requirement) worse than false positives (extra validation)

**Approach:**
- Conservative validation (flag potential gaps for human review)
- Requirement traceability matrix (each requirement → bid section mapping)
- AI-assisted validation with human-in-the-loop
- Clear UI for "coverage status" per requirement

### 4. Multi-Tenant Data Isolation

**Challenge:** SMEs must not see each other's bids or company data

**Approach:**
- Row-level security in database (every query filtered by company_id)
- Middleware checks user's company_id on all requests
- Separate storage prefixes for uploaded documents
- Audit logging for data access

### 5. Document Generation Determinism

**Challenge:** Users expect same inputs → same output; AI is non-deterministic

**Approach:**
- Cache AI responses for identical prompts
- Allow users to regenerate sections with different "creativity" settings
- Show diff when regenerating to highlight changes
- Version control for generated content

## Sources

**Confidence note:** This research is based on training knowledge of:
- Enterprise document automation platforms (similar workflow patterns)
- Procurement management systems (RFP response tools)
- AI-assisted content generation systems (prompt engineering patterns)
- TypeScript/Node.js full-stack architectures (standard patterns)

**Could not verify externally due to tool access restrictions.** Recommendations should be validated during implementation phases. Consider this MEDIUM confidence - patterns are sound but specific to EU procurement domain details may need adjustment based on real TED API documentation and eForms standard specifics.

**Suggested validation:**
- Review official TED API documentation when available
- Examine eForms standard for structured data requirements
- Research real-world procurement platform architectures if case studies available
- Validate AI generation patterns against Anthropic best practices documentation

---
*Architecture research for: BidFlow - AI-Assisted Bid Builder for EU Public Tenders*
*Researched: 2026-02-06*
*Researcher: GSD Project Researcher Agent*
