'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { WizardProgress } from './wizard-progress'
import { StepCompanyInfo } from './step-company-info'
import { StepSectors } from './step-sectors'
import { StepCapabilities } from './step-capabilities'
import { StepCertifications } from './step-certifications'
import { StepProjects } from './step-projects'
import { Button } from '@/components/ui/button'
import type { Company, Certification, Project } from '@prisma/client'

type CompanyProfile = (Company & {
  certifications: Certification[]
  projects: Project[]
}) | null

type ProfileCompleteness = {
  complete: boolean
  percentage: number
  steps: {
    companyInfo: boolean
    sectors: boolean
    capabilities: boolean
    certifications: boolean
    projects: boolean
  }
}

interface WizardContainerProps {
  initialData: CompanyProfile
  initialStep: number
  completeness: ProfileCompleteness
}

export function WizardContainer({
  initialData,
  initialStep,
  completeness,
}: WizardContainerProps) {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const router = useRouter()

  const handleNext = () => {
    if (currentStep < 5) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      // Update URL without full page reload
      window.history.replaceState(
        null,
        '',
        `/dashboard/profile/wizard?step=${nextStep}`
      )
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      window.history.replaceState(
        null,
        '',
        `/dashboard/profile/wizard?step=${prevStep}`
      )
    }
  }

  const handleSkip = () => {
    handleNext()
  }

  const handleFinish = () => {
    // Navigate back to dashboard (profile view page will be built in Plan 04)
    router.push('/dashboard')
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepCompanyInfo initialData={initialData} />
      case 2:
        return <StepSectors initialData={initialData} />
      case 3:
        return <StepCapabilities initialData={initialData} />
      case 4:
        return <StepCertifications initialData={initialData} />
      case 5:
        return <StepProjects initialData={initialData} />
      default:
        return <div>Invalid step</div>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Company Profile Wizard</h1>
        <p className="text-muted-foreground">
          Complete your company profile to start bidding on tenders
        </p>
      </div>

      {/* Progress */}
      <WizardProgress currentStep={currentStep} completeness={completeness} />

      {/* Step Content */}
      <div className="bg-card border rounded-lg min-h-[400px]">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          Back
        </Button>
        <div className="flex gap-2">
          {currentStep < 5 && (
            <>
              <Button variant="ghost" onClick={handleSkip}>
                Skip
              </Button>
              <Button onClick={handleNext}>Next</Button>
            </>
          )}
          {currentStep === 5 && (
            <Button onClick={handleFinish}>Finish</Button>
          )}
        </div>
      </div>
    </div>
  )
}
