'use client'

import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Circle } from 'lucide-react'

type ProgressIndicatorProps = {
  current: number
  total: number
  answered: number
}

export function ProgressIndicator({
  current,
  total,
  answered,
}: ProgressIndicatorProps) {
  const progressPercentage = (answered / total) * 100
  const isComplete = answered === total

  return (
    <div className="space-y-2">
      {/* Question counter */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          Question {current} of {total}
        </span>
        <span className="text-muted-foreground">
          {answered} / {total} answered
        </span>
      </div>

      {/* Progress bar */}
      <Progress value={progressPercentage} className="h-2" />

      {/* Status indicator */}
      <div className="flex items-center gap-2 text-sm">
        {isComplete ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-green-600 font-medium">
              All questions answered
            </span>
          </>
        ) : (
          <>
            <Circle className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {total - answered} question{total - answered !== 1 ? 's' : ''}{' '}
              remaining
            </span>
          </>
        )}
      </div>
    </div>
  )
}
