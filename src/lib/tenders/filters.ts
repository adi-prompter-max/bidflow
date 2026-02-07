import { z } from 'zod'

// Filter schema for validating tender search/filter params
export const tenderFilterSchema = z.object({
  sector: z.string().optional(), // "IT" | "Construction" | undefined (all sectors)
  minValue: z.coerce.number().optional(), // Minimum tender value in EUR
  maxValue: z.coerce.number().optional(), // Maximum tender value in EUR
  deadline: z.string().optional(), // ISO date string - tenders with deadline >= this date
  sort: z.enum(['relevance', 'deadline', 'value']).default('relevance'),
})

export type TenderFilters = z.infer<typeof tenderFilterSchema>

/**
 * Parse URL search params into validated TenderFilters
 * Returns defaults if parsing fails
 */
export function parseFilters(
  searchParams: Record<string, string | string[] | undefined>
): TenderFilters {
  // Convert searchParams to a plain object with single values
  const params: Record<string, string | undefined> = {}
  for (const [key, value] of Object.entries(searchParams)) {
    if (value !== undefined) {
      params[key] = Array.isArray(value) ? value[0] : value
    }
  }

  const result = tenderFilterSchema.safeParse(params)

  if (!result.success) {
    // Return defaults if validation fails
    return {
      sort: 'relevance',
    }
  }

  return result.data
}
