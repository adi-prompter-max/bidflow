'use client'

import { useState, useEffect } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type DeadlineTimerProps = {
  deadline: string
}

type TimeRemaining = {
  days: number
  hours: number
  minutes: number
  seconds: number
  isUrgent: boolean
  isPast: boolean
}

function calculateTimeRemaining(deadline: string): TimeRemaining {
  const deadlineDate = new Date(deadline)
  const now = new Date()
  const diff = deadlineDate.getTime() - now.getTime()

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isUrgent: false,
      isPast: true,
    }
  }

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const isUrgent = diff < 24 * 60 * 60 * 1000 // Less than 24 hours

  return {
    days,
    hours: hours % 24,
    minutes: minutes % 60,
    seconds: seconds % 60,
    isUrgent,
    isPast: false,
  }
}

export function DeadlineTimer({ deadline }: DeadlineTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(deadline)
  )

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(deadline))
    }, 1000)

    return () => clearInterval(timer)
  }, [deadline])

  if (timeRemaining.isPast) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="h-3 w-3" />
        Deadline passed
      </Badge>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <Clock
        className={`h-4 w-4 ${timeRemaining.isUrgent ? 'text-orange-500' : 'text-muted-foreground'}`}
      />
      <span
        className={
          timeRemaining.isUrgent ? 'text-orange-500 font-medium' : 'text-muted-foreground'
        }
      >
        {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m{' '}
        {timeRemaining.seconds}s remaining
      </span>
    </div>
  )
}
