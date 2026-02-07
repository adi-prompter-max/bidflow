'use client'

import { Badge } from '@/components/ui/badge'

type BidStatusBadgeProps = {
  status: string
}

export function BidStatusBadge({ status }: BidStatusBadgeProps) {
  switch (status) {
    case 'DRAFT':
      return <Badge variant="secondary">Draft</Badge>

    case 'IN_REVIEW':
      return <Badge variant="default">In Review</Badge>

    case 'FINALIZED':
      return (
        <Badge variant="outline" className="text-green-600 border-green-600">
          Finalized
        </Badge>
      )

    case 'SUBMITTED':
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-600">
          Submitted
        </Badge>
      )

    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}
