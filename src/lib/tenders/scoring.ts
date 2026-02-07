import 'server-only'

import { Tender, Company, Project, Certification } from '@prisma/client'

export type CompanyWithRelations = Company & {
  projects: Project[]
  certifications: Certification[]
}

export type TenderWithScore = Tender & {
  relevanceScore: number
}

/**
 * Parse value range string to numeric midpoint
 * Examples: "50k - 100k" -> 75000, "Under 50k" -> 25000, "Over 1M" -> 1250000
 */
function parseValueRange(range: string): number {
  const lower = range.toLowerCase()

  if (lower.includes('under')) {
    // "Under 50k" -> half of 50k = 25k
    const match = lower.match(/(\d+)k/)
    if (match) return parseInt(match[1]) * 500 // 50k -> 25000
    return 25000 // fallback
  }

  if (lower.includes('over')) {
    // "Over 1M" -> 1M + 250k = 1.25M
    const match = lower.match(/(\d+)m/)
    if (match) return parseInt(match[1]) * 1000000 + 250000
    return 1250000 // fallback
  }

  // "50k - 100k" -> midpoint = 75k
  const matches = lower.match(/(\d+)k\s*-\s*(\d+)([km])/)
  if (matches) {
    const min = parseInt(matches[1]) * 1000
    const maxNum = parseInt(matches[2])
    const maxMultiplier = matches[3] === 'm' ? 1000000 : 1000
    const max = maxNum * maxMultiplier
    return (min + max) / 2
  }

  return 0 // fallback for unparseable ranges
}

/**
 * Calculate weighted relevance score (0-100) for a tender based on company profile
 *
 * Scoring weights:
 * - Sector match: 40 points
 * - Value match: 20 points
 * - Tag match: 40 points
 *
 * @param tender The tender to score
 * @param company The company profile with projects and certifications (nullable)
 * @returns Score from 0-100
 */
export function calculateRelevanceScore(
  tender: Tender,
  company: CompanyWithRelations | null
): number {
  if (!company) return 0

  let score = 0

  // 1. SECTOR MATCH (40 points)
  if (company.sectors.includes(tender.sector)) {
    score += 40
  }

  // 2. VALUE MATCH (20 points)
  // Compare tender value against company's average past project value
  if (company.projects.length > 0) {
    const projectValues = company.projects.map((p) => parseValueRange(p.valueRange))
    const avgProjectValue = projectValues.reduce((a, b) => a + b, 0) / projectValues.length

    const valueDiff = Math.abs(tender.value - avgProjectValue)
    const percentageDiff = valueDiff / avgProjectValue

    if (percentageDiff <= 0.5) {
      // Within 50% of average -> full 20 points
      score += 20
    } else if (percentageDiff <= 1.0) {
      // Within 100% of average -> 10 points
      score += 10
    }
    // Otherwise 0 points for value component
  } else {
    // No projects: skip value scoring, redistribute to sector (50%) and tags (50%)
    // We already gave sector score, so adjust final score calculation
    // For now, just give 0 for value component
  }

  // 3. TAG MATCH (40 points)
  // Parse tender requirements JSON to extract tags
  let tenderTags: string[] = []
  if (tender.requirements) {
    try {
      const requirements = JSON.parse(tender.requirements)
      if (requirements.tags && Array.isArray(requirements.tags)) {
        tenderTags = requirements.tags.map((t: string) => t.toLowerCase().trim())
      }
    } catch (e) {
      // Invalid JSON, skip tag scoring
    }
  }

  if (tenderTags.length > 0 && company.capabilityTags.length > 0) {
    const companyTags = company.capabilityTags.map((t) => t.toLowerCase().trim())
    const matchingTags = tenderTags.filter((tag) => companyTags.includes(tag))
    const tagScore = (matchingTags.length / tenderTags.length) * 40
    score += tagScore
  }
  // If no tender tags, give 0 for tag component

  // Handle case where company has no projects: redistribute weights
  if (company.projects.length === 0) {
    // Remove value component, redistribute to sector and tags
    // Original: sector 40%, value 20%, tags 40%
    // New distribution: sector 50%, tags 50%
    // We need to recalculate with different weights

    // Reset score and recalculate
    score = 0

    // Sector: 50 points
    if (company.sectors.includes(tender.sector)) {
      score += 50
    }

    // Tags: 50 points
    if (tenderTags.length > 0 && company.capabilityTags.length > 0) {
      const companyTags = company.capabilityTags.map((t) => t.toLowerCase().trim())
      const matchingTags = tenderTags.filter((tag) => companyTags.includes(tag))
      const tagScore = (matchingTags.length / tenderTags.length) * 50
      score += tagScore
    }
  }

  // Clamp score to 0-100 range
  return Math.max(0, Math.min(100, Math.round(score)))
}
