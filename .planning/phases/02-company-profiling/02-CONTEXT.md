# Phase 2: Company Profiling - Context

**Gathered:** 2026-02-07
**Status:** Ready for planning

<domain>
## Phase Boundary

SMEs can create and manage comprehensive company profiles that drive tender matching. Users select industry sectors (IT & Construction), describe capabilities with free-text and tags, add certifications, and add past projects with references. Profile data persists across sessions. Tender discovery and matching logic are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Profile flow
- Multi-step wizard with 5 steps: Company Info → Industry Sectors → Capabilities & Tags → Certifications → Past Projects
- Linear but skippable: steps presented in order, user can skip ahead, skipped steps marked incomplete
- Simple progress bar at top (percentage-based, no step labels)
- Auto-save on blur: each field saves automatically when user moves to next field
- Dashboard shows a "Complete your profile" card linking to wizard (not a hard redirect on first login)
- After initial creation, editing happens on a dedicated profile page (not re-entering the wizard)

### Company info (Step 1)
- Standard detail level: company name, country, company size (employee range), website, brief description (1-2 sentences)

### Industry sectors (Step 2)
- Checkbox list UI (not cards)
- Only IT & Construction sectors for MVP (2 top-level options)
- Multi-select: user can pick one or both
- Each sector has 3-5 sub-categories for more precise matching (e.g., IT → Cloud Services, Cybersecurity, Software Dev)

### Capabilities & tags (Step 3)
- One capability description + tag set per company (not per sector)
- Free-text textarea for description, plus tag input (type and press Enter, tags appear as removable chips)
- Soft limits: character counter for description (~500 chars), tag count shown but not enforced (~20 tags)

### Past projects (Step 5)
- Standard detail per project: name, client name, description, sector, contract value range, year completed
- Displayed as a table with columns for name, client, sector, value, year
- Add/edit via modal dialog (keeps table view clean)
- Minimum 1 project required for wizard step to be considered complete

### Profile completeness
- Dashboard shows a checklist card: which sections are done vs missing (✓ Company Info, ✗ Certifications)
- All 5 wizard steps required for profile to be considered "complete"
- Soft block on tender discovery: section visible but shows "Complete your profile to see matched tenders"
- Checklist card stays visible even at 100% (all items checked, serves as quick profile overview)

### Claude's Discretion
- Certifications step (Step 4) UI and data structure
- Exact sub-categories for IT and Construction sectors
- Profile page layout and section editing UX
- Error states and validation messaging
- Wizard navigation button styling and placement

</decisions>

<specifics>
## Specific Ideas

No specific references — open to standard approaches for wizard and profile patterns.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-company-profiling*
*Context gathered: 2026-02-07*
