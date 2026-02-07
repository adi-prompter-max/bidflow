import { z } from 'zod'

// Step 1: Company Info
export const companyInfoSchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters').max(100),
  country: z.string().min(1, 'Country is required'),
  size: z.string().min(1, 'Company size is required'),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  description: z.string().max(300, 'Description must be under 300 characters').optional().or(z.literal('')),
})

// Step 2: Industry Sectors
// Sector sub-categories for IT and Construction
export const IT_SUBCATEGORIES = [
  'Cloud Services',
  'Cybersecurity',
  'Software Development',
  'Data Analytics',
  'IT Consulting',
] as const

export const CONSTRUCTION_SUBCATEGORIES = [
  'Renovation & Refurbishment',
  'New Build - Commercial',
  'New Build - Residential',
  'Infrastructure',
  'Demolition & Clearance',
] as const

export const SECTORS = ['IT', 'Construction'] as const

export const COMPANY_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '500+',
] as const

export const sectorsSchema = z.object({
  sectors: z.array(z.enum(SECTORS)).min(1, 'Select at least one sector'),
  sectorSubcategories: z.record(z.string(), z.array(z.string())).optional(),
})

// Step 3: Capabilities & Tags
export const capabilitiesSchema = z.object({
  capabilityDescription: z.string().max(500, 'Description must be under 500 characters').optional().or(z.literal('')),
  capabilityTags: z.array(z.string().min(1)).max(30, 'Maximum 30 tags allowed'),
})

// Step 4: Certifications (single certification for add/edit)
export const certificationSchema = z.object({
  name: z.string().min(1, 'Certification name is required').max(100),
  issuingBody: z.string().min(1, 'Issuing body is required').max(100),
  issueDate: z.string().min(1, 'Issue date is required'), // ISO date string from input[type=date]
  expiryDate: z.string().optional().or(z.literal('')),
})

// Step 5: Past Projects (single project for add/edit)
export const PROJECT_VALUE_RANGES = [
  'Under 50k',
  '50k - 100k',
  '100k - 250k',
  '250k - 500k',
  '500k - 1M',
  'Over 1M',
] as const

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  clientName: z.string().min(1, 'Client name is required').max(100),
  description: z.string().min(1, 'Project description is required').max(1000),
  sector: z.string().min(1, 'Sector is required'),
  valueRange: z.string().min(1, 'Value range is required'),
  yearCompleted: z.coerce.number().min(2000).max(new Date().getFullYear()),
})

// Types inferred from schemas
export type CompanyInfoFormValues = z.infer<typeof companyInfoSchema>
export type SectorsFormValues = z.infer<typeof sectorsSchema>
export type CapabilitiesFormValues = z.infer<typeof capabilitiesSchema>
export type CertificationFormValues = z.infer<typeof certificationSchema>
export type ProjectFormValues = z.infer<typeof projectSchema>
