'use client'

import { useState, useEffect } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { toast } from 'sonner'
import { saveBidDraft, updateBidStatus } from '@/actions/bids'
import type { Question } from '@/lib/bids/questions'
import { QuestionCard } from './question-card'
import { DeadlineTimer } from './deadline-timer'
import { ProgressIndicator } from './progress-indicator'
import { BidStatusBadge } from './bid-status-badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type BidWorkspaceProps = {
  bid: {
    id: string
    status: string
    updatedAt: string
  }
  tender: {
    id: string
    title: string
    sector: string
    deadline: string
    value: number
  }
  questions: Question[]
  initialAnswers: Record<string, unknown>
  startIndex: number
}

export function BidWorkspace({
  bid,
  tender,
  questions,
  initialAnswers,
  startIndex,
}: BidWorkspaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(startIndex)
  const [isSaving, setIsSaving] = useState(false)
  const [answers, setAnswers] = useState<Record<string, unknown>>(initialAnswers)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Debounced save function
  const debouncedSave = useDebouncedCallback(
    async (data: Record<string, unknown>) => {
      if (isSaving) return

      setIsSaving(true)
      try {
        const result = await saveBidDraft(bid.id, data)
        if (result.success) {
          toast.success('Draft saved', { duration: 2000 })
          setHasUnsavedChanges(false)
        } else {
          toast.error('Failed to save draft')
        }
      } catch (error) {
        toast.error('Failed to save draft')
      } finally {
        setIsSaving(false)
      }
    },
    500,
    { maxWait: 2000 }
  )

  // Handle answer changes
  const handleAnswerChange = (questionId: string, value: unknown) => {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)
    setHasUnsavedChanges(true)
    debouncedSave(newAnswers)
  }

  // Warn before unload if unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Ctrl+S / Cmd+S to force save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        debouncedSave.flush()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [debouncedSave])

  // Navigation handlers
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  // Calculate progress
  const answeredCount = questions.filter((q) => {
    const answer = answers[q.id]
    return (
      answer !== null &&
      answer !== undefined &&
      answer !== '' &&
      !(Array.isArray(answer) && answer.length === 0)
    )
  }).length

  const progressPercentage = (answeredCount / questions.length) * 100

  // Check if all required questions are answered
  const allRequiredAnswered = questions
    .filter((q) => q.required)
    .every((q) => {
      const answer = answers[q.id]
      return (
        answer !== null &&
        answer !== undefined &&
        answer !== '' &&
        !(Array.isArray(answer) && answer.length === 0)
      )
    })

  const currentQuestion = questions[currentQuestionIndex]

  // Handle submit for review
  const handleSubmitForReview = async () => {
    if (!allRequiredAnswered) {
      toast.error('Please answer all required questions')
      return
    }

    // Flush any pending saves
    await debouncedSave.flush()

    const result = await updateBidStatus(bid.id, 'IN_REVIEW')
    if (result.success) {
      toast.success('Bid submitted for review')
      window.location.href = `/dashboard/tenders/${tender.id}`
    } else {
      toast.error(result.message || 'Failed to submit bid')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Back link */}
      <Link
        href={`/dashboard/tenders/${tender.id}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tender
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{tender.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tender.sector} • £{tender.value.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <BidStatusBadge status={bid.status} />
          <DeadlineTimer deadline={tender.deadline} />
        </div>
      </div>

      {/* Progress indicator */}
      <ProgressIndicator
        current={currentQuestionIndex + 1}
        total={questions.length}
        answered={answeredCount}
      />

      {/* Current question */}
      <QuestionCard
        question={currentQuestion}
        value={answers[currentQuestion.id]}
        onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isFirst={currentQuestionIndex === 0}
        isLast={currentQuestionIndex === questions.length - 1}
      />

      {/* Saving indicator */}
      {isSaving && (
        <p className="text-sm text-muted-foreground text-center">Saving...</p>
      )}

      {/* Submit for review button */}
      {currentQuestionIndex === questions.length - 1 && allRequiredAnswered && (
        <div className="flex justify-center pt-4">
          <Button onClick={handleSubmitForReview} size="lg">
            Submit for Review
          </Button>
        </div>
      )}
    </div>
  )
}
