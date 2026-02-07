'use client'

import type { BidSection } from '@/lib/bids/sections'
import { Circle, Loader2, CheckCircle2 } from 'lucide-react'

type GeneratedSectionProps = {
  section: BidSection
  content: string | undefined
  status: 'pending' | 'generating' | 'complete'
}

export function GeneratedSection({
  section,
  content,
  status,
}: GeneratedSectionProps) {
  return (
    <div className="border-2 border-black bg-white">
      {/* Header bar with status */}
      <div className="border-b-2 border-black p-4 flex items-center justify-between bg-white">
        <h3 className="font-display text-lg font-bold">{section.title}</h3>
        <div className="flex items-center gap-2 text-sm">
          {status === 'pending' && (
            <>
              <Circle className="h-4 w-4 text-gray-400" />
              <span className="text-gray-400">Waiting...</span>
            </>
          )}
          {status === 'generating' && (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating...</span>
            </>
          )}
          {status === 'complete' && (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-green-600">Complete</span>
            </>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="p-6">
        {status === 'pending' && (
          <div className="h-12 flex items-center text-gray-400 text-sm">
            Section will generate after previous sections complete
          </div>
        )}
        {status === 'generating' && content && (
          <div className="whitespace-pre-wrap font-serif text-base leading-relaxed">
            {content}
            <span className="animate-pulse text-xl">▋</span>
          </div>
        )}
        {status === 'complete' && content && (
          <div className="whitespace-pre-wrap font-serif text-base leading-relaxed">
            {content}
          </div>
        )}
      </div>
    </div>
  )
}
