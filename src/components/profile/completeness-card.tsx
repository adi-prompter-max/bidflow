import { getProfileCompleteness } from '@/actions/profile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { CheckCircle2, XCircle } from 'lucide-react'

export async function CompletenessCard() {
  const completeness = await getProfileCompleteness()
  const { percentage, steps } = completeness

  const checklistItems = [
    { key: 'companyInfo', label: 'Company Info', complete: steps.companyInfo },
    { key: 'sectors', label: 'Industry Sectors', complete: steps.sectors },
    { key: 'capabilities', label: 'Capabilities & Tags', complete: steps.capabilities },
    { key: 'certifications', label: 'Certifications', complete: steps.certifications },
    { key: 'projects', label: 'Past Projects', complete: steps.projects },
  ]

  const isComplete = percentage === 100

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Company Profile</CardTitle>
        <Badge variant={isComplete ? "default" : "secondary"}>
          {Math.round(percentage)}%
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {checklistItems.map((item) => (
            <div key={item.key} className="flex items-center gap-2 text-sm">
              {item.complete ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={item.complete ? 'text-foreground' : 'text-muted-foreground'}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          {isComplete ? (
            <Link
              href="/dashboard/profile"
              className="text-sm font-medium text-primary hover:underline"
            >
              View profile →
            </Link>
          ) : (
            <Link
              href="/dashboard/profile/wizard"
              className="text-sm font-medium text-primary hover:underline"
            >
              Complete your profile →
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
