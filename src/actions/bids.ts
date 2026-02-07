'use server'

import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { BidStatus, Prisma } from '@prisma/client'
import {
  generateQuestionsFromRequirements,
  type TenderRequirements,
} from '@/lib/bids/questions'
import {
  validateBidCompleteness,
  isValidStatusTransition,
} from '@/lib/bids/validation'

type ActionResult =
  | { success: true; data?: unknown }
  | { success: false; errors?: Record<string, string[]>; message?: string }

export type GeneratedBidContent = {
  answers: Record<string, unknown>       // Original Q&A answers
  sections: Record<string, string>       // section_id -> generated_text
  generatedAt: string                    // ISO timestamp
}

/**
 * Create a new bid for a tender
 * Idempotent: returns existing bid if already created
 */
export async function createBid(tenderId: string): Promise<ActionResult> {
  try {
    const session = await verifySession()

    // Get user's company
    const company = await prisma.company.findUnique({
      where: { ownerId: session.userId },
    })

    if (!company) {
      return {
        success: false,
        message: 'Complete your company profile first',
      }
    }

    // Check for existing bid (idempotent)
    const existingBid = await prisma.bid.findFirst({
      where: {
        tenderId,
        companyId: company.id,
      },
    })

    if (existingBid) {
      return {
        success: true,
        data: { bidId: existingBid.id },
      }
    }

    // Create new bid with empty content
    const bid = await prisma.bid.create({
      data: {
        tenderId,
        companyId: company.id,
        status: BidStatus.DRAFT,
        content: {},
      },
    })

    // Revalidate tender detail page
    revalidatePath(`/dashboard/tenders/${tenderId}`)

    return {
      success: true,
      data: { bidId: bid.id },
    }
  } catch (error) {
    console.error('createBid error:', error)
    return {
      success: false,
      message: 'Failed to create bid. Please try again.',
    }
  }
}

/**
 * Save bid draft content
 * Only allowed for DRAFT or IN_REVIEW status
 * Does NOT revalidate (auto-save should not trigger revalidation)
 */
export async function saveBidDraft(
  bidId: string,
  content: Record<string, unknown>
): Promise<ActionResult> {
  try {
    const session = await verifySession()

    // Find bid and verify ownership
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        company: true,
      },
    })

    if (!bid) {
      return {
        success: false,
        message: 'Bid not found.',
      }
    }

    // Verify ownership
    if (bid.company.ownerId !== session.userId) {
      return {
        success: false,
        message: 'Unauthorized.',
      }
    }

    // Only allow saving if status is DRAFT or IN_REVIEW
    if (bid.status !== BidStatus.DRAFT && bid.status !== BidStatus.IN_REVIEW) {
      return {
        success: false,
        message: 'Cannot edit bid in current status.',
      }
    }

    // Update bid content
    await prisma.bid.update({
      where: { id: bidId },
      data: {
        content: content as Prisma.JsonObject,
        updatedAt: new Date(),
      },
    })

    return { success: true }
  } catch (error) {
    console.error('saveBidDraft error:', error)
    return {
      success: false,
      message: 'Failed to save bid draft. Please try again.',
    }
  }
}

/**
 * Update bid status
 * Validates status transition and completeness for FINALIZED/SUBMITTED
 */
export async function updateBidStatus(
  bidId: string,
  newStatus: BidStatus
): Promise<ActionResult> {
  try {
    const session = await verifySession()

    // Find bid and verify ownership
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        company: true,
        tender: true,
      },
    })

    if (!bid) {
      return {
        success: false,
        message: 'Bid not found.',
      }
    }

    // Verify ownership
    if (bid.company.ownerId !== session.userId) {
      return {
        success: false,
        message: 'Unauthorized.',
      }
    }

    // Validate status transition
    if (!isValidStatusTransition(bid.status, newStatus)) {
      return {
        success: false,
        message: `Invalid status transition from ${bid.status} to ${newStatus}.`,
      }
    }

    // If transitioning to FINALIZED or SUBMITTED, validate completeness
    if (
      newStatus === BidStatus.FINALIZED ||
      newStatus === BidStatus.SUBMITTED
    ) {
      // Parse tender requirements
      const requirements: TenderRequirements = bid.tender.requirements
        ? JSON.parse(bid.tender.requirements)
        : {}

      // Generate questions
      const questions = generateQuestionsFromRequirements(
        requirements,
        bid.tender.title,
        bid.tender.sector
      )

      // Validate completeness
      const completeness = validateBidCompleteness(
        (bid.content as Record<string, unknown>) || {},
        questions
      )

      if (!completeness.complete) {
        return {
          success: false,
          message: `Bid is incomplete. ${completeness.missingQuestions.length} required question(s) unanswered.`,
          errors: {
            completeness: completeness.missingQuestions,
          },
        }
      }
    }

    // Update bid status
    await prisma.bid.update({
      where: { id: bidId },
      data: {
        status: newStatus,
      },
    })

    // Revalidate bid workspace page
    revalidatePath(`/dashboard/bids/${bidId}`)

    return { success: true }
  } catch (error) {
    console.error('updateBidStatus error:', error)
    return {
      success: false,
      message: 'Failed to update bid status. Please try again.',
    }
  }
}

/**
 * Save generated bid content
 * Stores both original answers and generated sections in bid.content
 * Only allowed for DRAFT or IN_REVIEW status
 */
export async function saveGeneratedBid(
  bidId: string,
  generatedContent: GeneratedBidContent
): Promise<ActionResult> {
  try {
    const session = await verifySession()

    // Find bid and verify ownership
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        company: true,
        tender: true,
      },
    })

    if (!bid) {
      return {
        success: false,
        message: 'Bid not found.',
      }
    }

    // Verify ownership
    if (bid.company.ownerId !== session.userId) {
      return {
        success: false,
        message: 'Unauthorized.',
      }
    }

    // Only allow saving if status is DRAFT or IN_REVIEW
    if (bid.status !== BidStatus.DRAFT && bid.status !== BidStatus.IN_REVIEW) {
      return {
        success: false,
        message: 'Cannot modify bid in current status.',
      }
    }

    // Update bid content with generated content
    await prisma.bid.update({
      where: { id: bidId },
      data: {
        content: generatedContent as Prisma.JsonObject,
        updatedAt: new Date(),
      },
    })

    // Revalidate bid workspace page
    revalidatePath(`/dashboard/tenders/${bid.tenderId}/bid`)

    return { success: true }
  } catch (error) {
    console.error('saveGeneratedBid error:', error)
    return {
      success: false,
      message: 'Failed to save generated bid. Please try again.',
    }
  }
}
