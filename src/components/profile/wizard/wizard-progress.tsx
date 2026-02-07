'use client'

import { Progress } from '@/components/ui/progress'

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

interface WizardProgressProps {
  currentStep: number
  completeness: ProfileCompleteness
}

export function WizardProgress({ currentStep, completeness }: WizardProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">
          Step {currentStep} of 5
        </span>
        <span className="text-sm text-muted-foreground">
          {Math.round(completeness.percentage)}% complete
        </span>
      </div>
      <Progress value={completeness.percentage} className="h-2" />
    </div>
  )
}
