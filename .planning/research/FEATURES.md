# Feature Research

**Domain:** AI-Assisted Bid Builder for EU Public Tenders
**Researched:** 2026-02-06
**Confidence:** MEDIUM (based on Claude training data + domain knowledge; web research unavailable)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Company Profile Management** | Every bid platform needs to know who you are and what you do | LOW | Industry, capabilities, certifications, past projects. Foundation for matching. |
| **Tender Discovery & Search** | Users need to find relevant tenders; manual search is expected even if matching is automated | MEDIUM | Filters by sector, value, location, deadline. Basic table-stakes functionality. |
| **Tender Details View** | Users must see tender requirements, deadlines, documents before deciding to bid | LOW | Display parsed tender info in readable format. Critical for decision-making. |
| **Document Upload/Attachment** | Bids require supporting docs (certifications, references, financial statements) | LOW | File upload, storage, attachment to bid sections. Standard file management. |
| **Bid Draft Saving** | Bid creation takes days/weeks; users expect auto-save and manual save | LOW | Draft persistence with timestamps. Users panic without this. |
| **Export to PDF/DOCX** | Final output must be submittable; procurement portals expect these formats | MEDIUM | Template-based generation with formatting preservation. Non-negotiable for submission. |
| **Deadline Tracking** | Missing deadlines disqualifies bids; users expect visible countdowns | LOW | Show days/hours remaining on tender cards and detail pages. Reduces anxiety. |
| **Bid Status Tracking** | Users need to know what's "in progress" vs "ready to submit" vs "submitted" | LOW | Simple state machine: Draft → Review → Finalized → Submitted (manual). |
| **User Authentication** | Multi-user companies need role-based access (admin, bid writer, reviewer) | MEDIUM | Login, session management, basic permissions. Security baseline. |
| **Question-Answer Structure** | Tenders are organized by sections/questions; bid builder must mirror this | MEDIUM | Parse tender into Q&A pairs, collect responses per question, maintain structure. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **AI-Powered Tender Matching** | Automatically surfaces relevant tenders vs manual search through 1000s | HIGH | Match tender requirements to company profile using semantic understanding. Key differentiator. |
| **Guided Q&A Interface** | Plain-language prompts vs confronting raw tender jargon | MEDIUM | Transform "technical specifications ISO 9001" into "Do you have quality management certification?" SME-friendly. |
| **AI Bid Generation** | Draft professional narratives from plain-language answers vs writing from scratch | HIGH | Transform "We've done 3 school projects" into "Our portfolio demonstrates proven expertise in educational facilities..." Core value. |
| **Compliance Validation** | Proactive gap detection vs hoping you addressed everything | HIGH | Check if all mandatory requirements have responses; flag missing/weak areas. Reduces disqualification risk. |
| **Reusable Content Library** | Store past answers/sections for reuse vs rewriting similar content every time | MEDIUM | Tag responses by topic (e.g., "company history", "quality assurance approach"); suggest relevant past content. Massive time-saver. |
| **Tender Requirement Extraction** | Automatic parsing of requirements from tender docs vs manual reading | HIGH | NLP to extract mandatory vs optional requirements, deadlines, evaluation criteria. Reduces human error. |
| **Smart Sectioning** | Group related questions vs flat list of 100+ questions | MEDIUM | Cluster questions by theme (technical, financial, experience); progressive disclosure. Better UX than competitors. |
| **Real-Time Collaboration** | Multiple team members work on bid simultaneously vs emailing DOCX versions | HIGH | Conflict resolution, commenting, change tracking. Critical for companies with distributed teams. |
| **Bid Quality Scoring** | Estimate competitiveness before submission vs blind submission | MEDIUM | Analyze completeness, keyword coverage, past success patterns. Helps prioritize which bids to pursue. |
| **Template Adaptation** | Learn from past successful bids to improve suggestions | HIGH | Feedback loop: mark bids as won/lost, adapt AI suggestions. Long-term differentiator. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Fully Automated Bidding** | "Just submit bids for me automatically" | Legal liability, quality concerns, removes human judgment from high-stakes decisions. Most tenders require company-specific insights. | **AI-assisted drafting with mandatory human review.** User approves every section. System warns about gaps but doesn't auto-submit. |
| **Generic Bid Templates** | "Give me a template I can reuse everywhere" | Tenders vary widely; generic responses are obvious and get rejected. Evaluators penalize cookie-cutter bids. | **Dynamic content generation per tender.** Learn from past bids but customize heavily. Templates for structure only, not content. |
| **Real-Time TED API Sync** | "I want new tenders instantly" | TED API rate limits, costly infrastructure, overkill for SMEs who bid monthly not daily. Adds complexity without value for MVP. | **Daily/weekly tender sync batch jobs.** 24-hour latency acceptable; tenders are published weeks before deadline. Mock in MVP. |
| **Complex Workflow Engines** | "I need approval chains with 5 levels" | SMEs have flat structures; over-engineering kills simplicity. More configuration burden than value. | **Simple 2-role model: Writer + Approver.** Optional reviewer role. Keep it dead simple. Most SMEs have 1-3 people on bids. |
| **Built-In Contract Management** | "Track post-award contracts here too" | Scope creep; different problem space. Pre-award (bidding) and post-award (contract execution) are separate tools. | **Focus on bid preparation only.** Link to external contract tools if needed. Stay in lane. |
| **Blockchain-Based Submission** | "Use blockchain for immutable bid records" | Solution looking for a problem; procurement portals don't accept blockchain submissions. Adds tech complexity with zero user benefit. | **Standard audit logs with timestamps.** Sufficient for accountability. Export to PDF with metadata. |
| **Social/Gamification Features** | "Add leaderboards and badges for bid wins" | Procurement is serious business; gamification feels tone-deaf. Companies care about ROI, not badges. | **Simple analytics dashboard.** Win rate, bid volume, time saved. Data-driven insights without gimmicks. |

## Feature Dependencies

```
[Company Profile]
    ├──required for──> [Tender Matching]
    │                      └──surfaces──> [Matched Tenders]
    │                                         └──user selects──> [Bid Workspace]
    │
    └──provides context for──> [AI Bid Generation]


[Tender Requirement Extraction]
    └──produces──> [Structured Q&A Interface]
                       └──collects──> [User Responses]
                                          └──input to──> [AI Bid Generation]
                                                             └──output to──> [Compliance Validation]
                                                                                 └──when complete──> [PDF/DOCX Export]


[Reusable Content Library]
    └──enhances──> [AI Bid Generation]
    └──enhances──> [Guided Q&A Interface] (pre-fill suggestions)


[Real-Time Collaboration]
    └──requires──> [Bid Draft Saving] (conflict resolution depends on versioning)
    └──conflicts with──> [Offline Mode] (can't collaborate offline)


[Bid Quality Scoring]
    └──requires──> [Compliance Validation] (completeness is part of score)
    └──enhanced by──> [Template Adaptation] (historical data improves scoring)
```

### Dependency Notes

- **Company Profile is foundational:** Must exist before tender matching works. Build this in Phase 1.
- **Tender → Q&A → Response → AI → Validation → Export is linear:** Core workflow dependencies. Each step feeds the next. Can't skip steps.
- **Reusable Content Library is orthogonal:** Enhances multiple features but isn't required for MVP. Add in Phase 2+.
- **Real-Time Collaboration requires infrastructure:** WebSockets, conflict resolution, operational complexity. Defer to post-MVP.
- **Bid Quality Scoring requires historical data:** Needs completed bids (won/lost) to train. Phase 3+ feature.

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [x] **Company Profile Management** — Foundation for everything. User enters industry, capabilities, certifications, past projects.
- [x] **Tender Discovery (Mocked Data)** — Browse/filter mocked tender list. Proves discovery UX without API complexity.
- [x] **Tender Details View** — Display requirements, deadlines, documents. User decides "yes, I'll bid on this."
- [x] **Manual Tender Selection** — User clicks "Start Bid" on interesting tenders. (Skip auto-matching for MVP; prove workflow first.)
- [x] **Requirement Extraction (Simple Parsing)** — Parse tender into sections/questions. Start with manual/template-based for MVP; AI later.
- [x] **Guided Q&A Interface** — Ask user plain-language questions per tender section. Core UX innovation.
- [x] **AI Bid Generation (Mocked Responses)** — Simulate AI-generated professional text from user answers. Prove value before real AI.
- [x] **Compliance Validation (Basic)** — Check all questions answered; flag gaps. Simple completeness check for MVP.
- [x] **Bid Draft Saving** — Auto-save and manual save drafts. Non-negotiable for multi-day bid creation.
- [x] **PDF/DOCX Export** — Export completed bid as formatted document. Must be submission-ready.
- [x] **Basic Authentication** — Email/password login. Single user per company for MVP; roles later.
- [x] **Bid Status Tracking** — Show Draft/Review/Finalized states. User needs to know what's in progress.

**MVP Rationale:** Proves entire workflow end-to-end with mocked integrations. User goes from "select tender" → "answer questions" → "get professional bid document" without external dependencies. Validates value prop before complexity.

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] **AI-Powered Tender Matching** — Trigger: Users complain about manually browsing 100+ tenders. Automate discovery once profile-matching logic is proven.
- [ ] **Real AI Integration** — Trigger: Mocked responses prove value; users willing to pay/wait for real AI. Integrate GPT-4 or Claude API.
- [ ] **Reusable Content Library** — Trigger: Users bid on 2+ tenders and realize they're retyping similar answers. Add content reuse to save time.
- [ ] **Multi-User Roles** — Trigger: Teams of 2+ people want to collaborate. Add Writer/Reviewer/Admin roles with permissions.
- [ ] **Deadline Notifications** — Trigger: Users miss deadlines. Add email/push notifications for upcoming deadlines.
- [ ] **Advanced Compliance Validation** — Trigger: Users submit incomplete bids. Upgrade from completeness check to semantic gap detection (e.g., "You mentioned safety but didn't provide safety training proof").
- [ ] **Document Attachment Management** — Trigger: Users need to include certifications/references. Add file upload to bid sections.

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Real TED API Integration** — Why defer: API integration complexity, rate limits, testing challenges. Mock data sufficient until validated.
- [ ] **Real-Time Collaboration** — Why defer: Infrastructure complexity (WebSockets, conflict resolution, operational overhead). Most SMEs work sequentially, not simultaneously.
- [ ] **Bid Quality Scoring** — Why defer: Requires historical win/loss data (need 20+ completed bids). Can't build ML without data.
- [ ] **Template Adaptation (Learning)** — Why defer: Requires significant bid volume and feedback loops. Phase 3+ differentiator.
- [ ] **Mobile App** — Why defer: Bids are created on desktop (document-heavy work). Mobile for "check status" is low-ROI.
- [ ] **Multi-Language Support** — Why defer: English covers EU-wide tenders. Localization is expensive; validate single-language first.
- [ ] **Consortium Formation Tools** — Why defer: Out of MVP scope per PROJECT.md. Future vision feature.
- [ ] **Investor-Backed Bids** — Why defer: Business model complexity; validate core platform first.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Company Profile Management | HIGH | LOW | P1 (MVP) |
| Tender Discovery (Mocked) | HIGH | LOW | P1 (MVP) |
| Guided Q&A Interface | HIGH | MEDIUM | P1 (MVP) |
| AI Bid Generation (Mocked) | HIGH | LOW | P1 (MVP) |
| PDF/DOCX Export | HIGH | MEDIUM | P1 (MVP) |
| Compliance Validation (Basic) | HIGH | LOW | P1 (MVP) |
| Bid Draft Saving | HIGH | LOW | P1 (MVP) |
| Authentication | MEDIUM | LOW | P1 (MVP) |
| Bid Status Tracking | MEDIUM | LOW | P1 (MVP) |
| AI-Powered Tender Matching | HIGH | HIGH | P2 (Post-MVP) |
| Real AI Integration | HIGH | MEDIUM | P2 (Post-MVP) |
| Reusable Content Library | HIGH | MEDIUM | P2 (Post-MVP) |
| Multi-User Roles | MEDIUM | MEDIUM | P2 (Post-MVP) |
| Advanced Compliance Validation | MEDIUM | HIGH | P2 (Post-MVP) |
| Document Attachment | MEDIUM | LOW | P2 (Post-MVP) |
| Deadline Notifications | MEDIUM | LOW | P2 (Post-MVP) |
| Real TED API Integration | MEDIUM | HIGH | P3 (Future) |
| Real-Time Collaboration | MEDIUM | HIGH | P3 (Future) |
| Bid Quality Scoring | MEDIUM | HIGH | P3 (Future) |
| Template Adaptation | LOW | HIGH | P3 (Future) |

**Priority key:**
- P1: Must have for launch (MVP)
- P2: Should have, add when possible (post-validation)
- P3: Nice to have, future consideration (scale/PMF phase)

## Competitor Feature Analysis

| Feature | Traditional Bid Consultants | Generic Document Tools | Our Approach (BidFlow) |
|---------|----------------------------|------------------------|------------------------|
| **Tender Discovery** | Manual; consultant searches TED | N/A | Automated matching + manual browse (best of both) |
| **Requirement Extraction** | Manual reading + notes | Copy-paste from PDF | Automatic parsing + structured Q&A |
| **Content Generation** | Consultant writes from scratch | User types in Word | AI drafts from plain-language inputs |
| **Compliance Checking** | Manual review by consultant | None | Automated gap detection |
| **Cost** | €5K-50K per bid | Free but 100+ hours | Freemium SaaS (hours not €000s) |
| **Time to Bid** | 2-6 weeks | 3-8 weeks (SME alone) | 1-2 weeks (guided + AI-assisted) |
| **Reusability** | Consultant memory (if same consultant) | Manual copy-paste | Built-in content library |
| **Collaboration** | Email DOCX versions | Google Docs | Purpose-built bid workspace (future) |
| **Quality** | High (expert-written) | Variable (depends on SME skill) | Medium-High (AI + human review) |

**Key Insight:** BidFlow sits between "hire expensive consultant" and "DIY in Word." We're not replacing top-tier consultants (they handle mega-bids); we're empowering SMEs who'd otherwise go alone or skip bidding.

## Domain-Specific Feature Notes

### EU Tender Context

- **eForms Standard:** EU's new standard for tender notices (replacing old TED formats). Our parser must handle eForms structure post-MVP.
- **CPV Codes:** Common Procurement Vocabulary codes categorize tenders. Essential for matching (e.g., "72000000" = IT services). Must support in profile + matching.
- **ESPD (European Single Procurement Document):** Standardized self-declaration form. Future feature: auto-generate ESPD from company profile.
- **Language Requirements:** Many tenders require responses in buyer's language (not just English). Out of scope for MVP but critical for v2+.

### AI Generation Considerations

- **Hallucination Risk:** AI may invent false claims (e.g., "We have ISO 27001" when company doesn't). Validation: User reviews all generated text; mark AI content clearly.
- **Tone/Style Consistency:** Procurement language is formal. AI must match tone (professional, confident, not salesy). Use prompt engineering + examples.
- **Evidence Requirements:** Tenders require proof (certifications, project lists, financials). AI can draft narrative but can't generate fake evidence. Clear UX: "AI writes text; you provide proof."
- **Multilingual Generation:** Future feature. Start English-only; expand with localized models.

### Compliance Validation Levels

1. **Level 1 (MVP):** Completeness check. All mandatory questions answered? Any sections empty?
2. **Level 2 (Post-MVP):** Keyword matching. Does response mention required keywords from tender (e.g., "safety plan" in construction bid)?
3. **Level 3 (Future):** Semantic validation. Does response actually address the question? (NLP understanding, not just keyword matching.)
4. **Level 4 (Future):** Evidence validation. Does attached document support the claim in text?

Start with Level 1 for MVP; each level adds significant complexity.

## Sources

**Confidence Assessment:** MEDIUM

This research is based on:
- Claude training data on procurement platforms, document management systems, and AI writing tools (up to January 2025)
- PROJECT.md context for BidFlow-specific requirements
- Domain knowledge of EU public procurement (TED, eForms, CPV codes) from training data

**Not verified with:**
- Current (2026) competitor platform features (web research unavailable)
- Real user interviews or surveys (no primary research conducted)
- Official TED/EU procurement documentation (WebFetch unavailable)

**Gaps to address in future research:**
- Current state of AI bid writing tools in market (2025-2026)
- SME pain points from user interviews
- Competitive landscape analysis (who are the actual competitors?)
- TED API capabilities and limitations
- eForms standard technical details

**Recommendation:** Validate table stakes list with 3-5 SMEs who've bid on EU tenders. Ask: "What features would you expect? What would you pay for?" Use to refine P1/P2 boundaries before building.

---
*Feature research for: BidFlow — AI-Assisted Bid Builder*
*Researched: 2026-02-06*
*Confidence: MEDIUM (training data + domain knowledge; web verification pending)*
