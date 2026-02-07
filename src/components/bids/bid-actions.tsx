'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createBid } from '@/actions/bids'
import { toast } from 'sonner'
import { FileEdit } from 'lucide-react'

interface BidActionsProps {
  tenderId: string
  existingBidId?: string
  existingBidStatus?: string
}

export function BidActions({
  tenderId,
  existingBidId,
  existingBidStatus,
}: BidActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleStartBid = async () => {
    setIsLoading(true)
    try {
      const result = await createBid(tenderId)

      if (!result.success) {
        toast.error(result.message || 'Failed to create bid')
        return
      }

      if (
        result.data &&
        typeof result.data === 'object' &&
        'bidId' in result.data
      ) {
        router.push(`/dashboard/tenders/${tenderId}/bid`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // If user already has a bid for this tender
  if (existingBidId) {
    const isFinalized =
      existingBidStatus === 'FINALIZED' || existingBidStatus === 'SUBMITTED'

    return (
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <span className="text-muted-foreground">Your bid: </span>
          <span className="font-medium">{existingBidStatus}</span>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/tenders/${tenderId}/bid`)}
        >
          {isFinalized ? 'View Bid' : 'Continue Bid'}
        </Button>
      </div>
    )
  }

  // No existing bid - show Start Bid button
  return (
    <Button onClick={handleStartBid} disabled={isLoading}>
      <FileEdit className="h-4 w-4" />
      {isLoading ? 'Creating...' : 'Start Bid'}
    </Button>
  )
}
