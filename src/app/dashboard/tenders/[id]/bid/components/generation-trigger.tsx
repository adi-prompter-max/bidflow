'use client'

import { validateBidCompleteness } from '@/lib/bids/validation'
import type { Question } from '@/lib/bids/questions'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'

type GenerationTriggerProps = {
  questions: Question[]
  answers: Record<string, unknown>
  onGenerate: () => void
  disabled?: boolean
}

export function GenerationTrigger({
  questions,
  answers,
  onGenerate,
  disabled = false,
}: GenerationTriggerProps) {
  const completeness = validateBidCompleteness(answers, questions)

  return (
    <div className="border-2 border-black p-6 bg-white">
      <h3 className="font-display text-xl font-bold mb-3">
        Generate Professional Bid
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Transform your Q&A answers into a professionally formatted bid document
        with six comprehensive sections.
      </p>

      {!completeness.complete && (
        <div className="bg-yellow-50 border border-yellow-700 p-3 mb-4">
          <p className="text-sm text-yellow-700">
            <strong>Incomplete:</strong> {completeness.missingQuestions.length}{' '}
            required question{completeness.missingQuestions.length !== 1 ? 's' : ''}{' '}
            remaining
          </p>
        </div>
      )}

      <Button
        onClick={onGenerate}
        disabled={!completeness.complete || disabled}
        size="lg"
        className="w-full"
      >
        {disabled ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5 mr-2" />
            Generate Bid
          </>
        )}
      </Button>
    </div>
  )
}
