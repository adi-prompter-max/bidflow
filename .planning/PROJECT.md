# BidFlow — AI-Assisted Bid Builder for SMEs

## What This Is

An end-to-end web platform that helps small and medium-sized companies compete for EU public tenders without expensive bid consultants. The system discovers tenders from TED (Tenders Electronic Daily), matches them to an SME's profile, and guides the company through generating compliant bid documents — transforming plain-language answers into professional tender responses.

## Core Value

SMEs can go from "here's a relevant tender" to "here's a ready-to-submit bid document" without needing procurement expertise or consultants.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] SME can create and manage a company profile (industry, capabilities, certifications, past projects)
- [ ] System discovers and ingests tenders from TED API (mocked for MVP)
- [ ] System matches tenders to company profile and surfaces relevant opportunities
- [ ] SME can browse, filter, and approve matched tenders to bid on
- [ ] System extracts and presents tender requirements in structured form
- [ ] Platform asks SME structured questions in plain language to collect bid inputs
- [ ] AI generates compliant bid documents (structured forms + written narratives) from SME inputs
- [ ] System validates bid content covers all tender requirements
- [ ] SME can review, edit, and finalize generated bid documents
- [ ] Export completed bids as PDF/DOCX for manual submission

### Out of Scope

- Freelancer marketplace — future vision, not MVP
- Investor-backed bids — future vision, not MVP
- Automated consortium formation — future vision, not MVP
- Direct TED/eSender submission — MVP is export-only, manual submission
- Real AI model integration — MVP uses mock AI responses; free APIs later
- Real TED API integration — MVP uses mock tender data
- OAuth/social login — email/password sufficient for MVP
- Mobile app — web-first
- Multi-language support — English only for MVP
- Payment/billing — no monetization in MVP

## Context

- **Domain:** EU public procurement (TED platform, eForms standard)
- **Target sectors:** IT & Software, Construction (initial focus)
- **Target users:** SMEs (typically 10-250 employees) who lack dedicated bid teams
- **Bid documents:** Mix of structured forms (predefined templates) and free-form written proposals (technical narratives, pricing documents)
- **Compliance:** Content validation — checking that bid responses actually address all tender requirements, not just structural formatting
- **TED API:** Official API exists for tender data access (mocked in MVP)
- **MVP philosophy:** Mock data and mock APIs throughout to nail the user flow before integrating real services

## Constraints

- **Tech stack:** Node.js / TypeScript (full stack)
- **Interface:** Browser-based web dashboard
- **AI:** Mock responses for MVP; plan to integrate free AI APIs post-MVP
- **Data:** All tender data mocked for MVP; no real TED API calls
- **Sectors:** Scoped to IT & Software and Construction for initial tender matching logic

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Mock all external APIs for MVP | Focus on UX flow before integration complexity | — Pending |
| Node/TypeScript full stack | Developer preference | — Pending |
| Export-only (no direct submission) | Submission APIs add complexity; manual submission acceptable for MVP | — Pending |
| Content validation over structural | Users care more about "did I address everything?" than formatting | — Pending |
| Web dashboard (not chat-first) | Dashboard gives overview and control; structured questions within bid workspace | — Pending |
| Target IT & Construction first | Two distinct sectors to validate matching logic breadth | — Pending |

---
*Last updated: 2026-02-06 after initialization*
