import { verifySession } from '@/lib/dal'
import { getTenderById } from '@/lib/tenders/queries'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { format, differenceInDays } from 'date-fns'
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  FileText,
  Target,
  Clock,
  CheckCircle,
  Award,
} from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TenderDetailPage({ params }: PageProps) {
  const { id } = await params
  const session = await verifySession()

  // Fetch tender with relevance score
  const tender = await getTenderById(id, session.userId)

  if (!tender) {
    notFound()
  }

  // Calculate days remaining until deadline
  const daysRemaining = differenceInDays(tender.deadline, new Date())

  // Determine urgency color
  const getUrgencyColor = (days: number) => {
    if (days < 0) return 'text-gray-500'
    if (days < 14) return 'text-red-600'
    if (days < 30) return 'text-amber-600'
    return 'text-green-600'
  }

  // Get status badge variant
  const getStatusBadgeVariant = (
    status: string
  ): 'default' | 'secondary' | 'outline' => {
    switch (status) {
      case 'OPEN':
        return 'default'
      case 'CLOSED':
        return 'secondary'
      case 'AWARDED':
        return 'outline'
      default:
        return 'outline'
    }
  }

  // Parse requirements JSON
  let requirements: {
    technical?: string[]
    certifications?: string[]
    experience?: string[]
    deliverables?: string[]
    tags?: string[]
  } | null = null

  if (tender.requirements) {
    try {
      requirements = JSON.parse(tender.requirements)
    } catch {
      // Invalid JSON, leave as null
    }
  }

  // Parse documents JSON
  let documents: Array<{ name: string; url?: string }> | null = null

  if (tender.documents) {
    try {
      documents = JSON.parse(tender.documents)
    } catch {
      // Invalid JSON, leave as null
    }
  }

  // Calculate relevance color and label
  const getRelevanceColor = (score: number) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 40) return 'text-amber-600'
    return 'text-gray-600'
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-5xl">
      {/* Back link */}
      <Link
        href="/dashboard/tenders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tenders
      </Link>

      {/* Header section */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold mb-3">{tender.title}</h1>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline">{tender.sector}</Badge>
              <Badge variant={getStatusBadgeVariant(tender.status)}>
                {tender.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Key metrics row */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        {/* Estimated Value */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Estimated Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{tender.value.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* Deadline */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Deadline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">
              {format(tender.deadline, 'MMM dd, yyyy')}
            </div>
            <div className={`text-sm flex items-center gap-1 ${getUrgencyColor(daysRemaining)}`}>
              <Clock className="h-3 w-3" />
              {daysRemaining < 0
                ? 'Expired'
                : daysRemaining === 0
                  ? 'Due today'
                  : daysRemaining === 1
                    ? '1 day remaining'
                    : `${daysRemaining} days remaining`}
            </div>
          </CardContent>
        </Card>

        {/* Relevance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Relevance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRelevanceColor(tender.relevanceScore)}`}>
              {tender.relevanceScore}%
            </div>
            <p className="text-sm text-muted-foreground">
              Match to your profile
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      {/* Description section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {tender.description}
          </div>
        </CardContent>
      </Card>

      {/* Requirements section */}
      {requirements && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {requirements.technical && requirements.technical.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Technical Requirements
                </h3>
                <ul className="space-y-1 ml-6">
                  {requirements.technical.map((req, index) => (
                    <li key={index} className="text-sm list-disc">
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {requirements.certifications &&
              requirements.certifications.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Required Certifications
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {requirements.certifications.map((cert, index) => (
                      <Badge key={index} variant="secondary">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            {requirements.experience &&
              requirements.experience.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-2">
                    Experience Requirements
                  </h3>
                  <ul className="space-y-1 ml-6">
                    {requirements.experience.map((exp, index) => (
                      <li key={index} className="text-sm list-disc">
                        {exp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {requirements.deliverables &&
              requirements.deliverables.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-2">Deliverables</h3>
                  <ul className="space-y-1 ml-6">
                    {requirements.deliverables.map((deliverable, index) => (
                      <li key={index} className="text-sm list-disc">
                        {deliverable}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {requirements.tags && requirements.tags.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-2">Key Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {requirements.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {(!requirements.technical ||
              requirements.technical.length === 0) &&
              (!requirements.certifications ||
                requirements.certifications.length === 0) &&
              (!requirements.experience ||
                requirements.experience.length === 0) &&
              (!requirements.deliverables ||
                requirements.deliverables.length === 0) &&
              (!requirements.tags || requirements.tags.length === 0) && (
                <p className="text-sm text-muted-foreground">
                  No specific requirements listed
                </p>
              )}
          </CardContent>
        </Card>
      )}

      {!requirements && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No specific requirements listed
            </p>
          </CardContent>
        </Card>
      )}

      {/* Documents section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {documents && documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <a
                    href="#"
                    className="text-sm font-medium hover:underline flex-1"
                  >
                    {doc.name}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No documents available
            </p>
          )}
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* Tender info footer */}
      <div className="text-sm text-muted-foreground space-y-1">
        <p>
          <span className="font-medium">Source:</span> {tender.source}
        </p>
        <p>
          <span className="font-medium">Created:</span>{' '}
          {format(tender.createdAt, 'MMM dd, yyyy')}
        </p>
        <p>
          <span className="font-medium">Last updated:</span>{' '}
          {format(tender.updatedAt, 'MMM dd, yyyy')}
        </p>
      </div>
    </div>
  )
}
