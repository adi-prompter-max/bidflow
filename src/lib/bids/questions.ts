/**
 * Mock question generation engine for bid workspace
 * Generates 5-8 questions based on tender requirements
 */

export type Question = {
  id: string
  text: string
  type: 'text' | 'textarea' | 'number' | 'select'
  required: boolean
  options?: string[]
  helpText?: string
}

export type TenderRequirements = {
  tags?: string[]
  certifications?: string[]
  experience?: string[]
  technical?: string[]
  deliverables?: string[]
  projectTypes?: string[]
}

/**
 * Generate questions from tender requirements JSON
 * Always includes 4 standard questions + dynamic questions based on requirements
 * Target: 5-8 questions total
 */
export function generateQuestionsFromRequirements(
  requirements: TenderRequirements,
  tenderTitle: string,
  tenderSector: string
): Question[] {
  const questions: Question[] = []

  // Standard questions (always included)
  questions.push({
    id: 'company_overview',
    text: 'Company Overview',
    type: 'textarea',
    required: true,
    helpText: 'Provide a brief overview of your company and why you are qualified for this tender.',
  })

  questions.push({
    id: 'proposed_approach',
    text: 'Proposed Approach',
    type: 'textarea',
    required: true,
    helpText: 'Describe your approach to delivering this project.',
  })

  questions.push({
    id: 'timeline',
    text: 'Proposed Timeline',
    type: 'text',
    required: true,
    helpText: 'Provide your estimated timeline for project completion (e.g., "12 weeks", "3 months").',
  })

  questions.push({
    id: 'budget_notes',
    text: 'Budget Notes',
    type: 'textarea',
    required: false,
    helpText: 'Optional: Add any notes about your budget or pricing approach.',
  })

  // Dynamic questions based on requirements
  if (requirements.tags && requirements.tags.length > 0) {
    questions.push({
      id: 'capability_match',
      text: 'Capability Match',
      type: 'textarea',
      required: true,
      helpText: `This tender requires the following capabilities: ${requirements.tags.join(', ')}. Explain how your company's capabilities align with these requirements.`,
    })
  }

  if (requirements.certifications && requirements.certifications.length > 0) {
    questions.push({
      id: 'certifications',
      text: 'Certification Status',
      type: 'select',
      required: true,
      options: [
        'Yes - We have all required certifications',
        'Some - We have some certifications',
        'None but willing - We do not have certifications but are willing to obtain them',
        'No',
      ],
      helpText: `Required certifications: ${requirements.certifications.join(', ')}`,
    })
  }

  if (requirements.experience && requirements.experience.length > 0) {
    questions.push({
      id: 'relevant_experience',
      text: 'Relevant Experience',
      type: 'textarea',
      required: true,
      helpText: `This tender requires experience in: ${requirements.experience.join(', ')}. Describe your relevant experience in these areas.`,
    })
  }

  if (requirements.technical && requirements.technical.length > 0) {
    questions.push({
      id: 'technical_approach',
      text: 'Technical Approach',
      type: 'textarea',
      required: true,
      helpText: `Technical requirements: ${requirements.technical.join(', ')}. Explain your technical approach to meeting these requirements.`,
    })
  }

  if (requirements.deliverables && requirements.deliverables.length > 0) {
    questions.push({
      id: 'deliverables_plan',
      text: 'Deliverables Plan',
      type: 'textarea',
      required: true,
      helpText: `Expected deliverables: ${requirements.deliverables.join(', ')}. Outline your plan for delivering these items.`,
    })
  }

  return questions
}
