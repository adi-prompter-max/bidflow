'use client'

import { useState, useEffect, useRef } from 'react'
import { BID_SECTIONS, getAnswersForSection } from '@/lib/bids/sections'
import { generateBidSection } from '@/lib/bids/mock-generator'
import { saveGeneratedBid } from '@/actions/bids'
import { GeneratedSection } from './generated-section'
import { toast } from 'sonner'

type GenerationProgressProps = {
  answers: Record<string, unknown>
  tenderTitle: string
  bidId: string
  onComplete: (generatedContent: Record<string, string>) => void
}

export function GenerationProgress({
  answers,
  tenderTitle,
  bidId,
  onComplete,
}: GenerationProgressProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({})
  const [sectionStatuses, setSectionStatuses] = useState<
    Record<string, 'pending' | 'generating' | 'complete'>
  >(() => {
    const statuses: Record<string, 'pending' | 'generating' | 'complete'> = {}
    BID_SECTIONS.forEach((section) => {
      statuses[section.id] = 'pending'
    })
    return statuses
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const isMounted = useRef(true)
  const readerRef = useRef<ReadableStreamDefaultReader<string> | null>(null)

  // Generation sequence
  useEffect(() => {
    const generateAllSections = async () => {
      setIsGenerating(true)

      // Local accumulator avoids stale closure over generatedContent state
      const finalContent: Record<string, string> = {}

      for (let i = 0; i < BID_SECTIONS.length; i++) {
        if (!isMounted.current) return

        const section = BID_SECTIONS[i]

        // Set section status to generating
        if (isMounted.current) {
          setSectionStatuses((prev) => ({
            ...prev,
            [section.id]: 'generating',
          }))
          setCurrentSectionIndex(i)
        }

        // Get section-specific answers
        const sectionAnswers = getAnswersForSection(section, answers)

        // Generate section content with streaming
        const stream = generateBidSection(section.id, sectionAnswers, tenderTitle)
        const reader = stream.getReader()
        readerRef.current = reader

        let accumulatedText = ''

        try {
          while (true) {
            const { done, value } = await reader.read()

            if (done) break

            accumulatedText += value

            // Update accumulated content (triggers re-render showing streaming text)
            if (isMounted.current) {
              setGeneratedContent((prev) => ({
                ...prev,
                [section.id]: accumulatedText,
              }))
            } else {
              // Component unmounted during streaming
              return
            }
          }

          // Store final text in local accumulator
          finalContent[section.id] = accumulatedText

          // Mark section as complete
          if (isMounted.current) {
            setSectionStatuses((prev) => ({
              ...prev,
              [section.id]: 'complete',
            }))
          }
        } catch (error) {
          console.error('Stream error:', error)
          if (isMounted.current) {
            toast.error('Generation failed')
          }
        } finally {
          // Always release the reader lock
          try {
            reader.releaseLock()
          } catch {
            // Reader may already be released
          }
          readerRef.current = null
        }
      }

      // All sections complete - save to database using local accumulator (not stale state)
      if (isMounted.current) {
        try {
          const result = await saveGeneratedBid(bidId, {
            answers,
            sections: finalContent,
            generatedAt: new Date().toISOString(),
          })

          if (result.success && isMounted.current) {
            toast.success('Bid generated successfully')
            onComplete(finalContent)
          } else if (isMounted.current) {
            toast.error('Failed to save generated bid')
          }
        } catch (error) {
          if (isMounted.current) {
            toast.error('Failed to save generated bid')
          }
        }
        setIsGenerating(false)
      }
    }

    generateAllSections()

    // Cleanup on unmount
    return () => {
      isMounted.current = false
      if (readerRef.current) {
        try {
          readerRef.current.cancel()
        } catch {
          // Reader may already be released
        } finally {
          try {
            readerRef.current.releaseLock()
          } catch {
            // Reader may already be released
          }
        }
      }
    }
  }, []) // Empty deps - run once on mount

  const completedCount = Object.values(sectionStatuses).filter(
    (status) => status === 'complete'
  ).length

  return (
    <div className="space-y-6">
      {/* Overall progress */}
      <div className="border-2 border-black p-4 bg-white">
        <p className="text-sm font-medium">
          Progress: {completedCount}/{BID_SECTIONS.length} sections generated
        </p>
      </div>

      {/* Section-by-section display */}
      <div className="space-y-4">
        {BID_SECTIONS.map((section) => (
          <GeneratedSection
            key={section.id}
            section={section}
            content={generatedContent[section.id]}
            status={sectionStatuses[section.id]}
          />
        ))}
      </div>
    </div>
  )
}
