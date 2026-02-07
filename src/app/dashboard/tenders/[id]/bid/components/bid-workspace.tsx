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
import { GenerationTrigger } from './generation-trigger'
import { GenerationProgress } from './generation-progress'
import { Button } from '@/components/ui/button'
import { ArrowLeft, RotateCcw } from 'lucide-react'
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
  initialGeneratedSections?: Record<string, string>
  initialGeneratedAt?: string
}

export function BidWorkspace({
  bid,
  tender,
  questions,
  initialAnswers,
  startIndex,
  initialGeneratedSections,
  initialGeneratedAt,
}: BidWorkspaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(startIndex)
  const [isSaving, setIsSaving] = useState(false)
  const [answers, setAnswers] = useState<Record<string, unknown>>(initialAnswers)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Initialize view based on existing generated content
  const hasExistingGenerated = Object.keys(initialGeneratedSections ?? {}).length > 0
  const [view, setView] = useState<'questions' | 'generating' | 'preview'>(
    hasExistingGenerated ? 'preview' : 'questions'
  )

  const [generatedSections, setGeneratedSections] = useState<Record<string, string>>(
    initialGeneratedSections ?? {}
  )
  const [generatedAt, setGeneratedAt] = useState<string | null>(initialGeneratedAt ?? null)

  // Debounced save function with content-aware structure
  const debouncedSave = useDebouncedCallback(
    async (newAnswers: Record<string, unknown>) => {
      if (isSaving) return

      setIsSaving(true)
      try {
        // Content-aware save: preserve generated sections when they exist
        const hasGenerated = Object.keys(generatedSections).length > 0
        const saveData = hasGenerated
          ? { answers: newAnswers, sections: generatedSections, generatedAt }
          : newAnswers

        const result = await saveBidDraft(bid.id, saveData)
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

  // Handle generation trigger
  const handleGenerate = () => {
    setView('generating')
  }

  // Handle generation complete
  const handleGenerationComplete = (generatedContent: Record<string, string>) => {
    setGeneratedSections(generatedContent)
    setGeneratedAt(new Date().toISOString())
    setView('preview')
  }

  // Handle back to questions
  const handleBackToQuestions = () => {
    setView('questions')
  }

  // Handle regenerate
  const handleRegenerate = () => {
    setGeneratedSections({})
    setGeneratedAt(null)
    setView('generating')
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

      {/* Questions View */}
      {view === 'questions' && (
        <>
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

          {/* Generation Trigger - show when all required questions are answered */}
          {allRequiredAnswered && (
            <GenerationTrigger
              questions={questions}
              answers={answers}
              onGenerate={handleGenerate}
              disabled={view !== 'questions'}
            />
          )}

          {/* Submit for review button */}
          {currentQuestionIndex === questions.length - 1 && allRequiredAnswered && (
            <div className="flex justify-center pt-4">
              <Button onClick={handleSubmitForReview} size="lg">
                Submit for Review
              </Button>
            </div>
          )}
        </>
      )}

      {/* Generating View */}
      {view === 'generating' && (
        <GenerationProgress
          answers={answers}
          tenderTitle={tender.title}
          bidId={bid.id}
          onComplete={handleGenerationComplete}
        />
      )}

      {/* Preview View */}
      {view === 'preview' && (
        <div className="space-y-6">
          {/* Generated sections display */}
          <div className="space-y-4">
            {Object.entries(generatedSections).map(([sectionId, content]) => (
              <div key={sectionId} className="border-2 border-black bg-white">
                <div className="border-b-2 border-black p-4 bg-white">
                  <h3 className="font-display text-lg font-bold">
                    {sectionId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </h3>
                </div>
                <div className="p-6">
                  <div className="whitespace-pre-wrap font-serif text-base leading-relaxed">
                    {content}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Preview actions */}
          <div className="flex gap-4 justify-center">
            <Button onClick={handleBackToQuestions} variant="outline">
              Back to Questions
            </Button>
            <Button onClick={handleRegenerate} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
            <Button onClick={handleSubmitForReview} size="lg">
              Submit for Review
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
