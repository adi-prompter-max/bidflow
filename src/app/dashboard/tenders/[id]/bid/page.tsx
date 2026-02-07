import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { generateQuestionsFromRequirements } from '@/lib/bids/questions'
import { redirect } from 'next/navigation'
import { BidWorkspace } from './components/bid-workspace'

type Params = Promise<{ id: string }>

export default async function BidWorkspacePage({
  params,
}: {
  params: Params
}) {
  const { id: tenderId } = await params
  const session = await verifySession()

  // Get user's company
  const company = await prisma.company.findUnique({
    where: { ownerId: session.userId },
  })

  if (!company) {
    redirect('/dashboard/profile/wizard')
  }

  // Fetch tender
  const tender = await prisma.tender.findUnique({
    where: { id: tenderId },
  })

  if (!tender) {
    redirect('/dashboard/tenders')
  }

  // Find or create bid
  let bid = await prisma.bid.findFirst({
    where: {
      tenderId,
      companyId: company.id,
    },
  })

  if (!bid) {
    bid = await prisma.bid.create({
      data: {
        tenderId,
        companyId: company.id,
        status: 'DRAFT',
        content: {},
      },
    })
  }

  // Parse tender requirements
  const requirements = tender.requirements
    ? JSON.parse(tender.requirements as string)
    : {}

  // Generate questions
  const questions = generateQuestionsFromRequirements(
    requirements,
    tender.title,
    tender.sector
  )

  // Prepare initial answers and detect content format
  const rawContent = bid.content as Record<string, unknown>
  const isPostGeneration = rawContent?.answers && typeof rawContent.answers === 'object' && !Array.isArray(rawContent.answers)
  const initialAnswers = isPostGeneration ? (rawContent.answers as Record<string, unknown>) : rawContent
  const initialGeneratedSections = isPostGeneration ? (rawContent.sections as Record<string, string> | undefined) : undefined
  const initialGeneratedAt = isPostGeneration ? (rawContent.generatedAt as string | undefined) : undefined

  // Determine last answered index
  let lastAnsweredIndex = 0
  for (let i = questions.length - 1; i >= 0; i--) {
    const answer = initialAnswers[questions[i].id]
    if (
      answer !== null &&
      answer !== undefined &&
      answer !== '' &&
      !(Array.isArray(answer) && answer.length === 0)
    ) {
      lastAnsweredIndex = i
      break
    }
  }

  return (
    <BidWorkspace
      bid={{
        id: bid.id,
        status: bid.status,
        updatedAt: bid.updatedAt.toISOString(),
      }}
      tender={{
        id: tender.id,
        title: tender.title,
        sector: tender.sector,
        deadline: tender.deadline.toISOString(),
        value: tender.value,
      }}
      questions={questions}
      initialAnswers={initialAnswers}
      startIndex={lastAnsweredIndex}
      initialGeneratedSections={initialGeneratedSections}
      initialGeneratedAt={initialGeneratedAt}
    />
  )
}
