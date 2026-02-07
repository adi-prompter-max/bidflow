import { verifySession } from '@/lib/dal'
import { getCompanyProfile, getProfileCompleteness } from '@/actions/profile'
import { WizardContainer } from '@/components/profile/wizard/wizard-container'
import { redirect } from 'next/navigation'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function WizardPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  // Verify session
  await verifySession()

  // Fetch existing profile and completeness
  const profile = await getCompanyProfile()
  const completeness = await getProfileCompleteness()

  // Resolve search params
  const params = await searchParams
  const stepParam = params.step

  // Parse initial step from URL or determine from completeness
  let initialStep = 1

  if (stepParam && typeof stepParam === 'string') {
    const parsed = parseInt(stepParam, 10)
    if (parsed >= 1 && parsed <= 5) {
      initialStep = parsed
    }
  } else if (profile) {
    // If company exists, start at first incomplete step
    const steps = completeness.steps
    if (!steps.companyInfo) initialStep = 1
    else if (!steps.sectors) initialStep = 2
    else if (!steps.capabilities) initialStep = 3
    else if (!steps.certifications) initialStep = 4
    else if (!steps.projects) initialStep = 5
    else initialStep = 1 // All complete, start at beginning
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <WizardContainer
        initialData={profile}
        initialStep={initialStep}
        completeness={completeness}
      />
    </div>
  )
}
