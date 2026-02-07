/**
 * Bid validation logic
 * - Completeness validation
 * - Status transition rules
 */

import { BidStatus } from '@prisma/client'
import type { Question } from './questions'

export type BidCompletenessResult = {
  complete: boolean
  answeredCount: number
  totalRequired: number
  missingQuestions: string[]
}

/**
 * Validate bid completeness based on questions
 * A question is "answered" if its value is not undefined, not null, not empty string, and not 0 for numbers
 */
export function validateBidCompleteness(
  content: Record<string, unknown>,
  questions: Question[]
): BidCompletenessResult {
  const requiredQuestions = questions.filter((q) => q.required)
  const missingQuestions: string[] = []
  let answeredCount = 0

  for (const question of requiredQuestions) {
    const value = content[question.id]

    // Check if answered: not undefined, not null, not empty string, and not 0 for numbers
    const isAnswered =
      value !== undefined &&
      value !== null &&
      value !== '' &&
      !(typeof value === 'number' && value === 0)

    if (isAnswered) {
      answeredCount++
    } else {
      missingQuestions.push(question.text)
    }
  }

  return {
    complete: answeredCount === requiredQuestions.length,
    answeredCount,
    totalRequired: requiredQuestions.length,
    missingQuestions,
  }
}

/**
 * Validate status transitions
 * Valid transitions:
 * - DRAFT -> IN_REVIEW
 * - IN_REVIEW -> FINALIZED
 * - IN_REVIEW -> DRAFT (back to edit)
 * - FINALIZED -> SUBMITTED
 */
export function isValidStatusTransition(
  current: BidStatus,
  next: BidStatus
): boolean {
  const validTransitions: Record<BidStatus, BidStatus[]> = {
    DRAFT: [BidStatus.IN_REVIEW],
    IN_REVIEW: [BidStatus.FINALIZED, BidStatus.DRAFT],
    FINALIZED: [BidStatus.SUBMITTED],
    SUBMITTED: [], // No transitions from SUBMITTED
  }

  return validTransitions[current]?.includes(next) ?? false
}
