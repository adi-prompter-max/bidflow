/**
 * Bid section mapping and utilities
 * Maps Q&A questions to professional bid document sections
 */

export type BidSection = {
  id: string
  title: string
  order: number
  sourceQuestions: string[] // Question IDs from questions.ts that feed this section
  required: boolean
}

/**
 * Standard bid sections (6 sections covering all question IDs)
 *
 * Question ID Coverage:
 * - Standard questions (always present): company_overview, proposed_approach, timeline, budget_notes
 * - Dynamic questions (conditionally generated): capability_match, certifications, relevant_experience, technical_approach, deliverables_plan
 *
 * Every question ID is mapped to at least one section's sourceQuestions array.
 */
export const BID_SECTIONS: BidSection[] = [
  {
    id: 'executive_summary',
    title: 'Executive Summary',
    order: 1,
    sourceQuestions: ['company_overview', 'proposed_approach'],
    required: true,
  },
  {
    id: 'technical_approach',
    title: 'Technical Approach',
    order: 2,
    sourceQuestions: ['technical_approach', 'capability_match'],
    required: true,
  },
  {
    id: 'methodology',
    title: 'Methodology & Delivery',
    order: 3,
    sourceQuestions: ['proposed_approach', 'deliverables_plan'],
    required: true,
  },
  {
    id: 'timeline',
    title: 'Project Timeline',
    order: 4,
    sourceQuestions: ['timeline'],
    required: true,
  },
  {
    id: 'experience',
    title: 'Relevant Experience',
    order: 5,
    sourceQuestions: ['relevant_experience', 'certifications'],
    required: false,
  },
  {
    id: 'budget',
    title: 'Budget Considerations',
    order: 6,
    sourceQuestions: ['budget_notes'],
    required: false,
  },
]

/**
 * Extract answers for a specific bid section
 * Skips missing question IDs (when dynamic questions weren't generated for this tender)
 */
export function getAnswersForSection(
  section: BidSection,
  allAnswers: Record<string, unknown>
): Record<string, unknown> {
  const sectionAnswers: Record<string, unknown> = {}

  for (const questionId of section.sourceQuestions) {
    // Skip if question wasn't generated (dynamic questions may be absent)
    if (allAnswers[questionId] !== undefined) {
      sectionAnswers[questionId] = allAnswers[questionId]
    }
  }

  return sectionAnswers
}
