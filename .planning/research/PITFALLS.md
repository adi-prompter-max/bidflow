# Pitfalls Research

**Domain:** AI-Assisted Bid Builder for EU Public Tenders
**Researched:** 2026-02-06
**Confidence:** MEDIUM (based on established domain knowledge; web verification unavailable)

## Critical Pitfalls

### Pitfall 1: Treating TED Data as Clean, Structured Input

**What goes wrong:**
Teams build parsers assuming TED notices follow consistent schemas, but in reality, TED data quality varies wildly by contracting authority. Notices contain inconsistent formatting, missing mandatory fields, incorrect categorization (CPV codes), and multilingual text mixing. Your matching and extraction logic breaks on 30-40% of real notices.

**Why it happens:**
Developers test against a handful of well-formed notices from the TED API documentation or major contracting authorities. They don't encounter the messy reality: small municipalities using free-text for structured fields, outdated CPV codes, missing deadlines, or mixed-language notices (French title, English description).

**How to avoid:**
- Build a "dirty data pipeline" from day one with normalization layers
- Test against 200+ random notices from different member states and authority types
- Implement fuzzy matching for CPV codes, dates, and amounts (not exact match)
- Create a "data quality score" for each tender (high/medium/low confidence)
- Flag unclear tenders for manual review rather than auto-processing
- Store raw notice XML/JSON alongside parsed data for debugging

**Warning signs:**
- Your demo works with 5 curated notices but fails when users browse real tenders
- Matching algorithm returns zero results or floods users with irrelevant tenders
- Date parsing crashes on "31/02/2026" or "end of Q2" format
- CPV code lookups fail because authorities use deprecated codes

**Phase to address:**
Phase 1 (TED Integration & Tender Discovery) — make dirty data handling a first-class concern, not a post-launch fix.

---

### Pitfall 2: Generating Bids Without Domain Knowledge Validation

**What goes wrong:**
AI generates grammatically perfect, impressively detailed responses that are factually wrong, make impossible promises, or miss mandatory requirements. SMEs submit these bids, get disqualified, lose trust in your platform. Example: AI claims company has ISO 27001 certification when they don't, or promises delivery timelines that violate procurement rules.

**Why it happens:**
Teams treat bid generation as a "fill in the template" task, feeding questions to GPT without verifying outputs against company capabilities, procurement rules, or mandatory criteria. They optimize for fluency, not accuracy. The AI doesn't understand that "Do you have liability insurance?" requires a specific certificate, not just "Yes, we prioritize risk management."

**How to avoid:**
- Implement multi-stage validation: AI generates → rule-based compliance check → mandatory fields verification → factual claims audit
- Maintain a "company evidence database" (certifications, past projects, capabilities) and validate AI claims against it
- Create a "cannot hallucinate" list: insurance details, certifications, financial figures, legal entity info must come from verified data, never generated
- Use structured Q&A to collect factual evidence before AI writing phase
- Show confidence scores per answer section ("High: based on company data" vs. "Low: AI inferred")
- Require manual review for any claim exceeding company's documented capabilities

**Warning signs:**
- Users report "the AI made up that we have X certification"
- Bids get disqualified for missing mandatory attachments AI didn't flag
- Generated technical sections reference non-existent methodologies
- Financial sections don't match company's actual turnover/capacity

**Phase to address:**
Phase 3 (AI Bid Generation) AND Phase 4 (Compliance Validation) — validation must be architected alongside generation, not bolted on later.

---

### Pitfall 3: Underestimating EU Procurement Regulation Complexity

**What goes wrong:**
Platform advises SMEs to submit bids that violate procurement directives, miss mandatory exclusion ground declarations, or fail to follow procedure-specific rules (open procedure vs. restricted procedure vs. competitive dialogue have different requirements). Users face legal issues, platform loses credibility.

**Why it happens:**
Teams read the high-level EU Procurement Directives (2014/24/EU, 2014/25/EU) but miss that each member state has national implementing legislation with additional requirements, and each contracting authority has their own supplementary rules. The regulatory landscape is fractal: EU → national → sector-specific → authority-specific.

**How to avoid:**
- Don't build a compliance engine from scratch — partner with legal experts or license existing rule databases
- For MVP, explicitly scope to specific countries + sectors (e.g., "Italy IT tenders only")
- Implement a "compliance confidence level" per tender based on how well rules are understood
- Surface mandatory document requirements prominently (don't bury in generated text)
- Provide regulatory disclaimers: "This tool assists preparation, not legal advice; verify requirements"
- Build a feedback loop: when users report issues, update rule database
- Track which tenders users abandon (may indicate unclear requirements your tool didn't help with)

**Warning signs:**
- Users ask "Do I need to declare my beneficial owners?" and your tool can't answer
- Generated bids miss ESPD (European Single Procurement Document) requirements
- Platform doesn't distinguish between below-threshold and above-threshold procedures
- No handling of framework agreements vs. one-off contracts
- Tool advises on cross-border tenders without considering foreign establishment requirements

**Phase to address:**
Phase 0 (Foundational Research) AND Phase 4 (Compliance Validation) — scope regulatory coverage early, build validation incrementally.

---

### Pitfall 4: Ignoring the "SME Time Poverty" Problem

**What goes wrong:**
Platform requires extensive setup (manual data entry, document uploads, lengthy questionnaires) before providing value. SMEs abandon during onboarding because they don't have time to "feed the system." You build for enterprise workflows (dedicated bid managers) when SMEs are small teams wearing multiple hats.

**Why it happens:**
Teams optimize for "comprehensive company profiles" that enable better AI outputs, but don't realize SMEs will spend 30-60 minutes on setup before seeing if the tool is useful. They compare to enterprise sales tools that assume dedicated users, not an overworked CEO trying your platform at 9pm.

**How to avoid:**
- "Value in 5 minutes" rule: show useful tender matches before asking for detailed company data
- Progressive profiling: collect minimal data for first bid, gradually build profile over multiple uses
- Import company data automatically: business registries, LinkedIn, company website scraping
- Offer "quick start" mode: answer 5 key questions, get basic bid; refine later for higher quality
- Use AI to infer company capabilities from existing materials (past proposals, website) rather than questionnaires
- Track time-to-first-value metric and optimize relentlessly

**Warning signs:**
- High drop-off during onboarding (>60% abandon before completing profile)
- Users create accounts but never generate their first bid
- Support requests: "Do I really need to fill out all these fields?"
- Users ask "Can I just see an example first?"
- Analytics show users spend 30+ minutes in setup, never return

**Phase to address:**
Phase 2 (Company Profiling & Matching) — architect for incremental data collection from day one, not big-bang onboarding.

---

### Pitfall 5: Treating Bid Documents as Uniform Text Generation

**What goes wrong:**
Platform treats all bid sections as narrative writing tasks, but EU tenders require mix of strict structured forms (financial tables, technical specifications with units/tolerances), legal declarations (yes/no attestations), narrative sections (methodology descriptions), and evidence attachments (certificates, references). Generated bids are well-written prose where users needed Excel tables, checkboxes, or PDF certificates.

**Why it happens:**
Teams think "AI is good at writing" and build a text generation pipeline. They don't analyze actual winning bids to see that 60% of a typical submission is structured data and attachments, not narrative. They optimize for the flashy demo (AI-written executive summary) and underdeliver on the tedious reality (filling out 20 compliance checkboxes correctly).

**How to avoid:**
- Analyze 50+ real tender documents across target sectors to map required output formats
- Build separate workflows for: narrative generation, structured form filling, compliance declarations, document assembly
- For structured sections: use form builders with validation, not free text + AI
- For declarations: yes/no interfaces with evidence upload, not AI-generated statements
- For technical specs: template libraries with dropdowns for units, standards, certifications
- Implement a "bid document compiler" that assembles heterogeneous sections into required format (PDF, DOCX, sometimes platform-specific XML)
- Support common evidence documents: upload once, reuse across bids

**Warning signs:**
- Users complain "I can't enter the financial breakdown table"
- Platform generates great methodology descriptions but users still copy-paste into contracting authority's forms
- Missing support for mandatory annexes (templates authorities require)
- Users ask "How do I attach my ISO certificate?" and there's no upload flow
- Export produces beautiful PDFs but authority requires form-based submission on their portal

**Phase to address:**
Phase 3 (AI Bid Generation) AND Phase 5 (Document Export) — treat document assembly as structured problem, not just text generation.

---

### Pitfall 6: Misunderstanding TED API Rate Limits and Data Freshness

**What goes wrong:**
Platform hits TED API rate limits during user onboarding (when fetching full notice details), causing slow load times or failures. Or platform caches tender data and doesn't notice when deadlines change or tenders get cancelled, leading users to work on invalid opportunities.

**Why it happens:**
Teams build for the happy path (small number of users, daily batch updates) without planning for scale or real-time requirements. They don't realize TED's API has restrictions on bulk queries, search result pagination, and update frequency. They treat tender data as static when it's actually mutable (amendments, cancellations, deadline extensions happen frequently).

**How to avoid:**
- Design for eventual consistency: accept that tender data may be slightly stale, surface last-update timestamp to users
- Implement aggressive caching with smart invalidation (cache full notice details, not search results)
- Use webhooks or change feeds if TED provides them (validate availability); otherwise poll strategically (e.g., only poll tenders users are actively working on)
- Pre-fetch and cache notices in background, don't fetch on-demand during user session
- Implement rate limit budgeting: prioritize API calls for active users over background scraping
- Have a fallback: if API quota exhausted, direct users to TED website with pre-filled search
- Monitor for tender amendments/cancellations and notify users actively working on those bids

**Warning signs:**
- Users experience slow tender detail loading (>3 seconds)
- 429 Rate Limit errors in logs
- Users work on cancelled tenders because platform didn't sync
- Notice amendments (deadline changes) not reflected in platform
- Platform shows tenders as open when they've closed

**Phase to address:**
Phase 1 (TED Integration & Tender Discovery) — API strategy must account for rate limits and staleness from architecture design.

---

### Pitfall 7: Assuming One-Size-Fits-All AI Models for Bid Writing

**What goes wrong:**
Platform uses a single general-purpose LLM for all bid sections, producing mediocre results: technical sections lack domain terminology, financial sections have wrong tone, executive summaries are too verbose. Bids read like AI slop, evaluators notice, SMEs don't win contracts.

**Why it happens:**
Teams pick GPT-4 or Claude and feed everything through the same prompt template with minor variations. They don't realize different bid sections need different writing styles (technical: precise and jargon-heavy; management: concise and confident; social value: narrative and evidence-based) and domain expertise (construction vs. IT consulting have different evaluator expectations).

**How to avoid:**
- Use domain-specific prompts per section type (technical, financial, management, methodology, social value, innovation)
- Fine-tune or use retrieval-augmented generation (RAG) with industry-specific terminology and winning bid examples
- Implement a "style guide" per sector: construction bids emphasize safety and standards compliance; IT bids emphasize security and methodology rigor
- Use different temperature settings: low for factual sections (0.2-0.3), higher for creative sections (0.6-0.7)
- Build a "bid section library" of high-quality reference text per industry and reuse patterns
- A/B test model outputs: let users choose between two generated versions and learn from preferences
- Consider specialized models for specific tasks (e.g., financial writing, technical documentation)

**Warning signs:**
- Users heavily edit AI-generated sections (>50% of text changed)
- Feedback: "This sounds too generic" or "This doesn't sound like my industry"
- Generated technical sections use layman's terms where jargon is expected
- Financial sections too chatty, not concise enough for evaluation grids
- Users prefer to write from scratch rather than edit AI output (defeats the purpose)

**Phase to address:**
Phase 3 (AI Bid Generation) — plan for section-specific AI strategies, not monolithic generation.

---

### Pitfall 8: Building Company Profile UI Before Understanding What Data Matters

**What goes wrong:**
Platform asks for dozens of company profile fields (year founded, number of employees, mission statement, office locations) that don't actually improve bid matching or generation quality. Meanwhile, critical data (specific certifications, past project types, available capacity) is missing. Users waste time, AI outputs don't improve.

**Why it happens:**
Teams design profile forms based on intuition or copying LinkedIn fields, not by analyzing what data actually drives successful bids. They don't work backwards from "What must a bid contain to win?" to "What company data generates that content?".

**How to avoid:**
- Reverse-engineer winning bids: identify mandatory and differentiating data points
- Map bid requirements to company data fields: if 80% of IT tenders require ISO 27001, profile must capture security certifications prominently
- Prioritize fields in order: mandatory for compliance → differentiators → nice-to-have
- Test data value: does including field X improve AI output quality? If not, defer collection
- Implement progressive disclosure: only show advanced fields when relevant (e.g., "international experience" only appears if user matches cross-border tenders)
- Use smart defaults and inference: extract data from existing documents rather than forms

**Warning signs:**
- Company profile form has 50+ fields
- Users abandon profile completion partway through
- Many profile fields never used in generated bids
- Users must enter same information multiple times in different formats
- Profile doesn't capture industry-specific essentials (e.g., construction: plant/equipment; IT: development methodologies)

**Phase to address:**
Phase 2 (Company Profiling & Matching) — data model should be informed by bid analysis, not assumption.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Mock TED API with 10-20 curated notices | Fast MVP development, predictable testing | Doesn't prepare for dirty data reality; requires major refactor when connecting to real API | MVP only if real API integration is Phase 2 AND you've analyzed real data to inform mocks |
| Single-language support (English only) | Simplifies UI, content generation, reduces complexity | Eliminates 80% of EU market; rebuilding for multilingual is painful (not just UI but AI prompts, validation rules, templates) | Never acceptable for EU procurement tool — multilingual is table stakes, even if MVP starts with 2-3 languages |
| Storing only parsed tender data (discarding raw notices) | Saves storage, cleaner database | Can't debug parsing errors, can't reprocess if parsing logic improves, can't verify what TED actually said | Never acceptable — raw data is source of truth, storage is cheap |
| Hard-coding compliance rules in application code | Fast to implement, easy to understand initially | Becomes unmaintainable as rules grow; requires code deploys to update rules; impossible for non-developers to maintain | MVP only; must refactor to rule engine by Phase 4 |
| Using only free-text company profile | Users can describe anything, flexible, no UI complexity | Can't validate, can't match systematically, AI has to parse unstructured text (error-prone) | Never acceptable for mandatory fields; OK for supplementary/qualitative data |
| Skipping document version control in bid drafting | Simpler backend, no branching logic | Users lose work, can't compare drafts, can't recover from AI generation mistakes | Never acceptable — version control is essential for bid preparation workflow |
| Generating bids without user review steps | Magical UX, single-click bid creation | Dangerous: users submit hallucinated content, platform liability | Never acceptable — human-in-the-loop is mandatory for high-stakes content |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| TED API | Assuming search results return all relevant tenders | TED search has limitations: use broad queries + client-side filtering; supplement with CPV code browsing; accept that some tenders will be missed |
| TED API | Not handling multilingual notices (title in French, description in English) | Detect language per field, translate on-demand for matching/display; store original language; consider language preferences in matching algorithm |
| PDF/DOCX export | Generating files in-memory on request (OOM errors at scale) | Use background job queues for document generation; stream large files; implement temporary file cleanup |
| Email notifications (tender alerts) | Sending immediately when tender matches | Batch daily/weekly digests to avoid spam; let users configure frequency; implement smart throttling (don't alert on marginal matches) |
| Company data import (LinkedIn, website scraping) | Scraping during user session (slow, rate limits, failures) | Background processing with user approval; cache imported data; graceful degradation if import fails |
| AI model APIs (OpenAI, Anthropic) | Synchronous calls blocking user interface | Async generation with progress indicators; implement timeouts and retries; queue long-running generations |
| File uploads (certificates, past projects) | Accepting any file type, no virus scanning, no size limits | Whitelist file types, max size enforcement, virus scanning, validate file content matches claim (e.g., PDF claiming to be ISO cert should contain "ISO 27001" text) |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading all user's matched tenders on dashboard | Slow page loads, database queries timing out | Implement pagination, infinite scroll, or virtual scrolling; load summaries first, details on-demand | 50+ tenders per user |
| Generating full bid in single API call | Timeouts, no progress indication, all-or-nothing UX | Generate section-by-section with progress bar; allow partial saves; implement streaming for long content | Bids >10 sections or >5000 words |
| Storing all generated bid versions in primary database | Database bloat, slow queries | Archive old versions to blob storage; keep only last N versions in database; implement lazy loading | 1000+ bids with 5+ versions each |
| Real-time tender matching on profile update | UI freezes while recalculating matches for all tenders | Debounce profile updates; run matching in background; show "recalculating matches..." state; cache match scores | 10000+ tenders in database |
| Inline AI generation without caching | Repeated API costs for same content, slow regeneration | Cache generated content by input hash; reuse sections across similar bids; implement smart cache invalidation | 100+ users generating daily |
| Full-text search across all tender descriptions | Slow queries as tender database grows | Use dedicated search service (Elasticsearch, Algolia); implement search result caching; limit search to recent/relevant tenders | 50000+ tenders |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing sensitive company financial data without encryption at rest | Data breach exposes SME financials, certifications, trade secrets | Encrypt sensitive fields at rest; implement field-level access control; audit data access; consider PII regulations per EU member state |
| Allowing users to share generated bids publicly/socially | Competitors see SME's bid strategies and pricing; undermines competitive advantage | Bids are always private by default; sharing requires explicit confirmation; watermark exports with "confidential" |
| Not validating uploaded certificates/documents | Users upload malicious PDFs, platform becomes malware distribution vector | Virus scanning on upload; validate file types; sandboxed PDF rendering; strip executable content |
| Logging AI prompts containing company secrets | Sensitive business data in plain-text logs accessible to developers/support | Sanitize logs: redact financial figures, strategy details; implement separate encrypted audit logs for sensitive operations |
| Exposing competitor info via tender matching | Showing "5 other companies matched this tender" leaks competitive intelligence | Never reveal who else is bidding; aggregate statistics only (anonymized); consider privacy implications of any competitive signals |
| Not rate-limiting AI generation | Users automate bid generation, abuse free tier, or attack via resource exhaustion | Per-user rate limits on API calls; implement daily generation quotas; detect and block suspicious patterns |
| Inadequate access control on multi-user accounts | Junior employee can see all company bids including confidential ones | Role-based access control (RBAC); separate draft/submitted bid permissions; audit log for sensitive operations |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing all tender fields even when irrelevant | Overwhelming UI, users don't know what matters | Contextual display: show mandatory fields prominently, collapse optional/inapplicable sections; use progressive disclosure |
| Not surfacing deadline urgency | Users miss deadlines, waste time on expired tenders | Visual deadline indicators (red=urgent, yellow=soon, green=plenty of time); sort by deadline by default; alert for approaching deadlines |
| Auto-saving without user awareness | Users don't know if changes are saved, fear data loss | Clear save indicators ("Saving...", "Saved at 14:32"); undo functionality; version history |
| Requiring users to understand procurement jargon | SMEs intimidated by CPV codes, ESPD, exclusion grounds terminology | Explain jargon in plain language; use tooltips; provide examples; consider "simple mode" UI with translations |
| Generating bids without showing confidence/quality indicators | Users don't know if AI output is reliable, submit low-quality bids | Confidence scores per section; highlight sections needing manual review; explain why AI is uncertain |
| Not providing bid comparison to requirements | Users can't verify bid addresses all tender requirements | Checklist view: requirement vs. where addressed in bid; flag missing requirements; cross-reference to tender notice |
| Making it hard to export/share for review | SMEs can't show bid to colleagues/lawyers before submission | One-click export to PDF/DOCX; share link for review (read-only); comment/feedback functionality |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Tender matching:** Algorithm returns results, but doesn't account for exclusion grounds (showing tenders SME is ineligible for due to size requirements, geographic restrictions, or required certifications they lack)
- [ ] **AI bid generation:** Produces fluent text, but doesn't validate against mandatory minimum word counts, required subsections, or evaluation criteria weighting from tender notice
- [ ] **Compliance validation:** Checks for required sections, but doesn't verify legal declarations match company's actual legal entity type (e.g., tender requires limited company, user is sole proprietor)
- [ ] **Document export:** Generates PDFs, but formatting breaks on edge cases (long tables, special characters, multilingual content), or doesn't match contracting authority's template requirements
- [ ] **Company profile:** Captures basic info, but missing industry-specific essentials (construction: H&S policies, insurance details; IT: security clearances, development certifications)
- [ ] **Tender alerts:** Sends notifications, but doesn't deduplicate amended notices (user gets alerted 3 times for same tender with minor updates), or doesn't respect user's notification preferences
- [ ] **Multilingual support:** UI translated, but AI prompts still in English (generating English content for French tenders), or missing right-to-left language support for member states
- [ ] **Mobile experience:** Works on mobile, but tender PDFs unreadable, document upload painful, complex forms frustrating on small screens (mobile should be view-only + simple actions, not full bid creation)

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Dirty TED data breaks matching | MEDIUM | 1. Add data quality monitoring to detect parsing failures; 2. Build normalization layer as wrapper around existing parser; 3. Implement fuzzy matching for critical fields; 4. Add manual review queue for low-confidence parses |
| AI generates hallucinated content | HIGH (reputation damage) | 1. Immediately add disclaimers about AI-generated content requiring review; 2. Implement validation rules to catch obvious hallucinations; 3. Add human review checkpoints before submission; 4. Consider insurance/warranty for missed issues; 5. Contact affected users proactively |
| Missing critical compliance requirements | HIGH | 1. Partner with procurement lawyer to audit rules; 2. Build rule database incrementally (prioritize most-used tender types); 3. Add "compliance confidence" indicators; 4. Implement user feedback loop to capture missed requirements; 5. Make compliance validation a separate, explicit phase |
| Performance issues at scale | MEDIUM | 1. Add caching layer to hot paths; 2. Move slow operations to background jobs; 3. Implement pagination/lazy loading; 4. Optimize database queries; 5. Consider CDN for static assets; 6. Scale horizontally (add servers) as interim solution |
| Users abandon due to complex onboarding | LOW | 1. Analyze where drop-off occurs; 2. Implement progressive profiling (collect data over time); 3. Add "quick start" mode; 4. Use AI to infer data from documents; 5. A/B test simpler onboarding flows |
| Rate limit issues with TED API | LOW | 1. Add aggressive caching; 2. Implement rate limit monitoring and alerting; 3. Pre-fetch popular/active tenders; 4. Queue API calls with backoff; 5. Contact TED for increased quota or partnership |
| Security breach (data exposure) | CRITICAL | 1. Follow incident response plan: contain, assess, notify; 2. Notify affected users per GDPR requirements; 3. Conduct security audit; 4. Implement missing controls; 5. Consider third-party security review; 6. Review insurance coverage |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Dirty TED data | Phase 1 (TED Integration) | Test against 200+ real notices from diverse sources; measure parsing success rate >90%; implement data quality scoring |
| AI hallucination | Phase 3 (AI Generation) + Phase 4 (Validation) | Implement factual claim validation; test against company data; measure edit distance (users should change <30% of generated text) |
| Regulatory complexity | Phase 0 (Research) + Phase 4 (Validation) | Define regulatory scope explicitly; partner with legal expert; build rule database; track user-reported compliance gaps |
| SME time poverty | Phase 2 (Profiling) | Measure time-to-first-value <5 minutes; implement progressive profiling; track onboarding completion rate >70% |
| Document format variety | Phase 3 (AI Generation) + Phase 5 (Export) | Analyze 50+ real bids to catalog output types; build structured workflows per section type; support all common formats |
| TED API limits | Phase 1 (TED Integration) | Design caching strategy; implement rate limit monitoring; test with production-scale data loads |
| One-size-fits-all AI | Phase 3 (AI Generation) | Develop section-specific prompts; measure output quality per section type; A/B test different model approaches |
| Poor data model | Phase 2 (Profiling) | Work backwards from winning bids to required data; validate each field's utility; prioritize mandatory over nice-to-have |

## Sources

**Confidence Note:** This research is based on established domain knowledge of EU procurement systems, AI-assisted content generation platforms, and SME software design patterns. Web verification was unavailable at time of research; findings represent well-documented challenges in this space but should be validated against current sources during implementation.

**Domain Knowledge Sources:**
- EU Procurement Directives 2014/24/EU and 2014/25/EU (public sector and utilities procurement)
- TED (Tenders Electronic Daily) platform architecture and API patterns
- Common challenges in AI content generation for high-stakes business documents
- SME software adoption patterns and time-constraint considerations
- Document generation and export requirements for procurement submissions

**Recommended Validation:**
- Interview 5-10 SMEs who bid on EU tenders about pain points
- Analyze 50+ real tender notices from TED across target sectors
- Review winning bid examples from target industries (if accessible)
- Consult with procurement lawyers about regulatory scope
- Test TED API with realistic usage patterns to confirm rate limits and data quality issues

---
*Pitfalls research for: AI-Assisted Bid Builder for EU Public Tenders (BidFlow)*
*Researched: 2026-02-06*
*Confidence: MEDIUM (domain knowledge-based; web verification recommended)*
