'use server'

import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import {
  companyInfoSchema,
  sectorsSchema,
  capabilitiesSchema,
  certificationSchema,
  projectSchema,
  type CompanyInfoFormValues,
  type SectorsFormValues,
  type CapabilitiesFormValues,
  type CertificationFormValues,
  type ProjectFormValues,
} from '@/lib/validations/profile'
import { Prisma } from '@prisma/client'

type ActionResult =
  | { success: true; data?: unknown }
  | { success: false; errors?: Record<string, string[]>; message?: string }

// Save company info (Step 1)
export async function saveCompanyInfo(
  data: CompanyInfoFormValues
): Promise<ActionResult> {
  try {
    const session = await verifySession()

    // Validate input
    const validated = companyInfoSchema.safeParse(data)
    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.flatten().fieldErrors,
      }
    }

    const { name, country, size, website, description } = validated.data

    // Upsert company keyed on ownerId
    const company = await prisma.company.upsert({
      where: { ownerId: session.userId },
      update: {
        name,
        country,
        size,
        website: website || null,
        description: description || null,
      },
      create: {
        name,
        country,
        size,
        website: website || null,
        description: description || null,
        ownerId: session.userId,
        sectors: [], // Initialize empty sectors array
      },
    })

    return { success: true, data: { companyId: company.id } }
  } catch (error) {
    console.error('saveCompanyInfo error:', error)
    return {
      success: false,
      message: 'Failed to save company information. Please try again.',
    }
  }
}

// Save sectors (Step 2)
export async function saveSectors(
  data: SectorsFormValues
): Promise<ActionResult> {
  try {
    const session = await verifySession()

    // Validate input
    const validated = sectorsSchema.safeParse(data)
    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.flatten().fieldErrors,
      }
    }

    const { sectors, sectorSubcategories } = validated.data

    // Upsert company
    const company = await prisma.company.upsert({
      where: { ownerId: session.userId },
      update: {
        sectors,
        sectorSubcategories: sectorSubcategories || Prisma.JsonNull,
      },
      create: {
        name: 'Untitled Company',
        sectors,
        sectorSubcategories: sectorSubcategories || Prisma.JsonNull,
        ownerId: session.userId,
      },
    })

    return { success: true, data: { companyId: company.id } }
  } catch (error) {
    console.error('saveSectors error:', error)
    return {
      success: false,
      message: 'Failed to save sectors. Please try again.',
    }
  }
}

// Save capabilities (Step 3)
export async function saveCapabilities(
  data: CapabilitiesFormValues
): Promise<ActionResult> {
  try {
    const session = await verifySession()

    // Validate input
    const validated = capabilitiesSchema.safeParse(data)
    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.flatten().fieldErrors,
      }
    }

    const { capabilityDescription, capabilityTags } = validated.data

    // Upsert company
    const company = await prisma.company.upsert({
      where: { ownerId: session.userId },
      update: {
        capabilityDescription: capabilityDescription || null,
        capabilityTags,
      },
      create: {
        name: 'Untitled Company',
        sectors: [],
        capabilityDescription: capabilityDescription || null,
        capabilityTags,
        ownerId: session.userId,
      },
    })

    return { success: true, data: { companyId: company.id } }
  } catch (error) {
    console.error('saveCapabilities error:', error)
    return {
      success: false,
      message: 'Failed to save capabilities. Please try again.',
    }
  }
}

// Save certification (Step 4)
export async function saveCertification(
  data: CertificationFormValues & { id?: string }
): Promise<ActionResult> {
  try {
    const session = await verifySession()

    // Validate input
    const validated = certificationSchema.safeParse(data)
    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.flatten().fieldErrors,
      }
    }

    const { name, issuingBody, issueDate, expiryDate } = validated.data

    // Get user's company
    const company = await prisma.company.findUnique({
      where: { ownerId: session.userId },
    })

    if (!company) {
      return {
        success: false,
        message: 'Company profile not found. Please complete Step 1 first.',
      }
    }

    // Parse dates
    const parsedIssueDate = new Date(issueDate)
    const parsedExpiryDate = expiryDate ? new Date(expiryDate) : null

    if (data.id) {
      // Update existing certification
      // Verify ownership
      const existing = await prisma.certification.findUnique({
        where: { id: data.id },
      })

      if (!existing || existing.companyId !== company.id) {
        return {
          success: false,
          message: 'Certification not found or unauthorized.',
        }
      }

      const certification = await prisma.certification.update({
        where: { id: data.id },
        data: {
          name,
          issuingBody,
          issueDate: parsedIssueDate,
          expiryDate: parsedExpiryDate,
        },
      })

      return { success: true, data: { certificationId: certification.id } }
    } else {
      // Create new certification
      const certification = await prisma.certification.create({
        data: {
          name,
          issuingBody,
          issueDate: parsedIssueDate,
          expiryDate: parsedExpiryDate,
          companyId: company.id,
        },
      })

      return { success: true, data: { certificationId: certification.id } }
    }
  } catch (error) {
    console.error('saveCertification error:', error)
    return {
      success: false,
      message: 'Failed to save certification. Please try again.',
    }
  }
}

// Delete certification
export async function deleteCertification(id: string): Promise<ActionResult> {
  try {
    const session = await verifySession()

    // Get user's company
    const company = await prisma.company.findUnique({
      where: { ownerId: session.userId },
    })

    if (!company) {
      return {
        success: false,
        message: 'Company profile not found.',
      }
    }

    // Verify ownership
    const certification = await prisma.certification.findUnique({
      where: { id },
    })

    if (!certification || certification.companyId !== company.id) {
      return {
        success: false,
        message: 'Certification not found or unauthorized.',
      }
    }

    await prisma.certification.delete({
      where: { id },
    })

    return { success: true }
  } catch (error) {
    console.error('deleteCertification error:', error)
    return {
      success: false,
      message: 'Failed to delete certification. Please try again.',
    }
  }
}

// Save project (Step 5)
export async function saveProject(
  data: ProjectFormValues & { id?: string }
): Promise<ActionResult> {
  try {
    const session = await verifySession()

    // Validate input
    const validated = projectSchema.safeParse(data)
    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.flatten().fieldErrors,
      }
    }

    const { name, clientName, description, sector, valueRange, yearCompleted } =
      validated.data

    // Get user's company
    const company = await prisma.company.findUnique({
      where: { ownerId: session.userId },
    })

    if (!company) {
      return {
        success: false,
        message: 'Company profile not found. Please complete Step 1 first.',
      }
    }

    if (data.id) {
      // Update existing project
      // Verify ownership
      const existing = await prisma.project.findUnique({
        where: { id: data.id },
      })

      if (!existing || existing.companyId !== company.id) {
        return {
          success: false,
          message: 'Project not found or unauthorized.',
        }
      }

      const project = await prisma.project.update({
        where: { id: data.id },
        data: {
          name,
          clientName,
          description,
          sector,
          valueRange,
          yearCompleted,
        },
      })

      return { success: true, data: { projectId: project.id } }
    } else {
      // Create new project
      const project = await prisma.project.create({
        data: {
          name,
          clientName,
          description,
          sector,
          valueRange,
          yearCompleted,
          companyId: company.id,
        },
      })

      return { success: true, data: { projectId: project.id } }
    }
  } catch (error) {
    console.error('saveProject error:', error)
    return {
      success: false,
      message: 'Failed to save project. Please try again.',
    }
  }
}

// Delete project
export async function deleteProject(id: string): Promise<ActionResult> {
  try {
    const session = await verifySession()

    // Get user's company
    const company = await prisma.company.findUnique({
      where: { ownerId: session.userId },
    })

    if (!company) {
      return {
        success: false,
        message: 'Company profile not found.',
      }
    }

    // Verify ownership
    const project = await prisma.project.findUnique({
      where: { id },
    })

    if (!project || project.companyId !== company.id) {
      return {
        success: false,
        message: 'Project not found or unauthorized.',
      }
    }

    await prisma.project.delete({
      where: { id },
    })

    return { success: true }
  } catch (error) {
    console.error('deleteProject error:', error)
    return {
      success: false,
      message: 'Failed to delete project. Please try again.',
    }
  }
}

// Get company profile
export async function getCompanyProfile() {
  try {
    const session = await verifySession()

    const company = await prisma.company.findUnique({
      where: { ownerId: session.userId },
      include: {
        certifications: {
          orderBy: { issueDate: 'desc' },
        },
        projects: {
          orderBy: { yearCompleted: 'desc' },
        },
      },
    })

    return company
  } catch (error) {
    console.error('getCompanyProfile error:', error)
    return null
  }
}

// Get profile completeness
export async function getProfileCompleteness() {
  try {
    const session = await verifySession()

    const company = await prisma.company.findUnique({
      where: { ownerId: session.userId },
      include: {
        certifications: true,
        projects: true,
      },
    })

    if (!company) {
      return {
        complete: false,
        percentage: 0,
        steps: {
          companyInfo: false,
          sectors: false,
          capabilities: false,
          certifications: false,
          projects: false,
        },
      }
    }

    // Check step completion
    const steps = {
      companyInfo:
        !!company.name && !!company.country && !!company.size,
      sectors: company.sectors.length > 0,
      capabilities:
        !!company.capabilityDescription || company.capabilityTags.length > 0,
      certifications: company.certifications.length > 0,
      projects: company.projects.length > 0,
    }

    const completedSteps = Object.values(steps).filter(Boolean).length
    const percentage = (completedSteps / 5) * 100
    const complete = completedSteps === 5

    return {
      complete,
      percentage,
      steps,
    }
  } catch (error) {
    console.error('getProfileCompleteness error:', error)
    return {
      complete: false,
      percentage: 0,
      steps: {
        companyInfo: false,
        sectors: false,
        capabilities: false,
        certifications: false,
        projects: false,
      },
    }
  }
}
