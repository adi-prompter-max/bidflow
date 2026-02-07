import 'server-only'

import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { calculateRelevanceScore, TenderWithScore } from './scoring'
import { TenderFilters } from './filters'

/**
 * Fetch company with relations for scoring
 */
async function getCompanyForScoring(userId: string) {
  return prisma.company.findUnique({
    where: { ownerId: userId },
    include: {
      projects: true,
      certifications: true,
    },
  })
}

/**
 * Build dynamic Prisma where clause from filters
 */
function buildWhereClause(filters: TenderFilters): Prisma.TenderWhereInput {
  const where: Prisma.TenderWhereInput = {
    status: 'OPEN', // Always filter to OPEN tenders only
  }

  // Sector filter
  if (filters.sector) {
    where.sector = filters.sector
  }

  // Value range filters
  if (filters.minValue !== undefined || filters.maxValue !== undefined) {
    where.value = {}
    if (filters.minValue !== undefined) {
      where.value.gte = filters.minValue
    }
    if (filters.maxValue !== undefined) {
      where.value.lte = filters.maxValue
    }
  }

  // Deadline filter (tenders with deadline >= specified date)
  if (filters.deadline) {
    where.deadline = {
      gte: new Date(filters.deadline),
    }
  }

  return where
}

/**
 * Get filtered tenders with relevance scores
 *
 * @param filters Filter criteria (sector, value range, deadline, sort)
 * @param userId User ID for company profile lookup and scoring
 * @returns Array of tenders with relevance scores, sorted by criteria
 */
export async function getTenders(
  filters: TenderFilters,
  userId: string
): Promise<TenderWithScore[]> {
  // Fetch company profile for relevance scoring
  const company = await getCompanyForScoring(userId)

  // Build where clause from filters
  const where = buildWhereClause(filters)

  // Fetch tenders matching filters
  const tenders = await prisma.tender.findMany({
    where,
  })

  // Calculate relevance scores for each tender
  const tendersWithScores: TenderWithScore[] = tenders.map((tender) => ({
    ...tender,
    relevanceScore: calculateRelevanceScore(tender, company),
  }))

  // Sort by specified criteria
  const sorted = [...tendersWithScores]

  switch (filters.sort) {
    case 'relevance':
      sorted.sort((a, b) => b.relevanceScore - a.relevanceScore)
      break
    case 'deadline':
      sorted.sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
      break
    case 'value':
      sorted.sort((a, b) => b.value - a.value)
      break
  }

  return sorted
}

/**
 * Get single tender by ID with relevance score
 *
 * @param id Tender ID
 * @param userId User ID for company profile lookup and scoring
 * @returns Tender with relevance score, or null if not found
 */
export async function getTenderById(
  id: string,
  userId: string
): Promise<TenderWithScore | null> {
  // Fetch company profile for relevance scoring
  const company = await getCompanyForScoring(userId)

  // Fetch tender by ID
  const tender = await prisma.tender.findUnique({
    where: { id },
  })

  if (!tender) return null

  // Calculate and attach relevance score
  return {
    ...tender,
    relevanceScore: calculateRelevanceScore(tender, company),
  }
}
