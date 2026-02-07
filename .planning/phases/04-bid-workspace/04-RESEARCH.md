# Phase 4: Bid Workspace - Research

**Researched:** 2026-02-07
**Domain:** Structured Q&A workflow, bid draft management, auto-save, deadline tracking
**Confidence:** HIGH

## Summary

Phase 4 implements a bid workspace where users create and manage bid drafts through a structured plain-language question workflow with auto-save capabilities. The research confirms that the existing stack (Next.js 16.1.6, React Hook Form, Prisma 6, shadcn/ui) provides all necessary capabilities with minimal new dependencies.

The standard approach combines multi-step form patterns (already proven in Phase 2's wizard) with progressive disclosure questionnaires where questions are presented one-at-a-time or in small groups, mapped from tender requirements. Auto-save continues the Phase 2 pattern but with enhanced debouncing (500ms recommended) for longer Q&A sessions. Status tracking (Draft/In Review/Finalized) uses Prisma enums already defined in the schema. Deadline countdown timers use React's useEffect with proper cleanup to avoid memory leaks, with libraries like react-countdown available for advanced formatting.

For MVP, question generation from tender requirements will be **mocked** (hardcoded question templates mapped to requirement types) rather than using real AI, consistent with the STATE.md decision to mock all AI models. The workspace presents questions derived from the tender's `requirements` JSON field, collects answers in the bid's `content` JSON field, and auto-saves on blur/change events.

**Primary recommendation:** Use React Hook Form with controlled step state for Q&A workflow, implement debounced auto-save (500ms) via Server Actions, use sonner (shadcn/ui toast) for save feedback, render countdown timer with useEffect cleanup pattern, and mock question generation with simple template mapping from tender requirements JSON.

## Standard Stack

The established libraries/tools for bid workspace and Q&A workflows:

### Core (Already in Stack)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React Hook Form | 7.71+ | Q&A form state & validation | Already in project, proven in Phase 2, excellent for multi-step workflows |
| Zod | 4.3.6 | Answer validation schemas | Already in project, type-safe validation |
| Prisma | 6.19.2 | Bid CRUD & status tracking | Already in project, Bid model already defined with BidStatus enum |
| Next.js Server Actions | 16.1.6 | Auto-save bid drafts | Already in project, proven pattern from Phase 2 |
| shadcn/ui | Latest | Form components (Input, Textarea, Select) | Already in project, Tailwind v4 compatible |
| date-fns | ^4.1.0 | Countdown calculations | Already in project, used in Phase 3 |

### Supporting (Recommended Additions)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| sonner | Latest (via shadcn) | Toast notifications for save feedback | Better UX than silent auto-save, shadcn/ui recommended toast |
| react-countdown | ^2.3.6 (optional) | Formatted countdown display | Advanced deadline formatting (days/hours/mins/secs), optional for MVP |
| use-debounce | ^10.0.0 | Debounce auto-save calls | Prevent race conditions in auto-save, proven pattern |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom countdown | react-countdown library | Custom gives full control but misses edge cases (timezone, DST, formatting) |
| sonner toast | react-hot-toast | Sonner is shadcn/ui's recommendation, better integration |
| Manual debounce | use-debounce library | Library handles cleanup/edge cases, minimal bundle cost |
| JSON question schema | SurveyJS form builder | SurveyJS overkill for MVP, hardcoded templates sufficient |

**Installation:**
```bash
# Toast notifications (recommended)
npx shadcn@latest add sonner

# Debouncing (recommended)
npm install use-debounce

# Optional: Advanced countdown formatting
npm install react-countdown
```

## Architecture Patterns

### Recommended Project Structure

```
src/app/dashboard/
├── tenders/
│   └── [id]/
│       ├── page.tsx                    # Tender detail page (already exists from Phase 3)
│       └── bid/
│           ├── page.tsx                # Bid workspace page (Q&A interface)
│           └── components/
│               ├── bid-workspace.tsx   # Main Q&A container
│               ├── question-card.tsx   # Individual question display
│               ├── deadline-timer.tsx  # Countdown timer component
│               ├── bid-status-badge.tsx # Status indicator
│               └── progress-indicator.tsx # Q&A progress tracker
src/components/
├── bids/
│   ├── bid-actions.tsx                 # Start bid CTA (on tender detail page)
│   └── bid-list.tsx                    # User's bid drafts list (optional)
src/actions/
└── bids.ts                             # Server Actions for bid CRUD
src/lib/
├── bids/
│   ├── queries.ts                      # Bid data fetching
│   ├── questions.ts                    # Mock question generation from tender requirements
│   └── validation.ts                   # Answer validation schemas
```

### Pattern 1: Mock Question Generation from Tender Requirements

**What:** Map tender requirements JSON to plain-language questions using templates
**When to use:** MVP phase before real AI integration
**Example:**

```typescript
// lib/bids/questions.ts
export type Question = {
  id: string
  text: string
  type: 'text' | 'textarea' | 'number' | 'select' | 'date'
  required: boolean
  options?: string[] // For select type
  helpText?: string
  validationSchema: z.ZodSchema
}

type TenderRequirement = {
  tags?: string[]
  certifications?: string[]
  experience?: number
  minValue?: number
  projectTypes?: string[]
}

export function generateQuestionsFromRequirements(
  requirements: TenderRequirement,
  tenderTitle: string,
  tenderSector: string
): Question[] {
  const questions: Question[] = []

  // Always include standard opening questions
  questions.push({
    id: 'company_overview',
    text: 'Please provide a brief overview of your company and why you are well-suited for this project.',
    type: 'textarea',
    required: true,
    helpText: '2-3 paragraphs recommended',
    validationSchema: z.string().min(100, 'Please provide at least 100 characters').max(1000),
  })

  // Map experience requirement to question
  if (requirements.experience) {
    questions.push({
      id: 'relevant_experience',
      text: `This tender requires ${requirements.experience} years of experience in ${tenderSector}. How many years of relevant experience does your team have?`,
      type: 'number',
      required: true,
      validationSchema: z.number().min(requirements.experience),
    })
  }

  // Map capability tags to questions
  if (requirements.tags && requirements.tags.length > 0) {
    questions.push({
      id: 'capability_match',
      text: `This project requires expertise in: ${requirements.tags.join(', ')}. Please describe your capabilities in these areas.`,
      type: 'textarea',
      required: true,
      validationSchema: z.string().min(200),
    })
  }

  // Map certifications to questions
  if (requirements.certifications && requirements.certifications.length > 0) {
    questions.push({
      id: 'certifications',
      text: `Do you hold the following certifications: ${requirements.certifications.join(', ')}?`,
      type: 'select',
      required: true,
      options: ['Yes, all of them', 'Some of them', 'None, but willing to obtain', 'No'],
      validationSchema: z.string(),
    })
  }

  // Map project types to past project question
  if (requirements.projectTypes && requirements.projectTypes.length > 0) {
    questions.push({
      id: 'past_projects',
      text: `Please describe 1-2 past projects similar to this ${tenderSector} tender.`,
      type: 'textarea',
      required: true,
      helpText: 'Include project name, client, scope, and outcomes',
      validationSchema: z.string().min(200),
    })
  }

  // Standard closing questions
  questions.push({
    id: 'proposed_approach',
    text: 'What is your proposed approach for this project?',
    type: 'textarea',
    required: true,
    validationSchema: z.string().min(300),
  })

  questions.push({
    id: 'timeline',
    text: 'What is your estimated timeline for project completion?',
    type: 'text',
    required: true,
    validationSchema: z.string().min(20),
  })

  questions.push({
    id: 'budget_notes',
    text: 'Any notes on your budget or pricing structure?',
    type: 'textarea',
    required: false,
    validationSchema: z.string().optional(),
  })

  return questions
}
```

### Pattern 2: Q&A Workflow with Auto-Save

**What:** Single-page Q&A interface with progressive disclosure and auto-save on blur
**When to use:** Long-form questionnaires where users need to save progress incrementally
**Example:**

```typescript
// app/dashboard/tenders/[id]/bid/components/bid-workspace.tsx
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDebouncedCallback } from 'use-debounce'
import { toast } from 'sonner'
import { saveBidDraft } from '@/actions/bids'
import { QuestionCard } from './question-card'
import { DeadlineTimer } from './deadline-timer'
import { ProgressIndicator } from './progress-indicator'

type BidWorkspaceProps = {
  bid: Bid & { tender: Tender }
  questions: Question[]
  initialAnswers?: Record<string, any>
}

export function BidWorkspace({ bid, questions, initialAnswers }: BidWorkspaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  // Build dynamic schema from questions
  const answerSchema = z.object(
    questions.reduce((acc, q) => {
      acc[q.id] = q.validationSchema
      return acc
    }, {} as Record<string, z.ZodSchema>)
  )

  const form = useForm({
    resolver: zodResolver(answerSchema),
    defaultValues: initialAnswers || {},
    mode: 'onBlur', // Trigger validation on blur
  })

  // Debounced auto-save (500ms after last change)
  const debouncedSave = useDebouncedCallback(
    async (data: Record<string, any>) => {
      setIsSaving(true)
      try {
        await saveBidDraft(bid.id, data)
        toast.success('Draft saved', { duration: 2000 })
      } catch (error) {
        toast.error('Failed to save draft')
      } finally {
        setIsSaving(false)
      }
    },
    500 // 500ms debounce
  )

  // Watch for changes and trigger auto-save
  useEffect(() => {
    const subscription = form.watch((value) => {
      debouncedSave(value)
    })
    return () => subscription.unsubscribe()
  }, [form.watch, debouncedSave])

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const answeredCount = Object.keys(form.getValues()).filter(
    key => form.getValues(key) !== undefined && form.getValues(key) !== ''
  ).length

  const handleNext = async () => {
    const fieldName = currentQuestion.id
    const isValid = await form.trigger(fieldName)

    if (isValid && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with deadline timer */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{bid.tender.title}</h1>
          <p className="text-muted-foreground">Bid Draft - {bid.status}</p>
        </div>
        <DeadlineTimer deadline={bid.tender.deadline} />
      </div>

      {/* Progress indicator */}
      <ProgressIndicator
        current={currentQuestionIndex + 1}
        total={questions.length}
        answered={answeredCount}
        progress={progress}
      />

      {/* Current question */}
      <QuestionCard
        question={currentQuestion}
        form={form}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isFirst={currentQuestionIndex === 0}
        isLast={currentQuestionIndex === questions.length - 1}
      />

      {/* Auto-save indicator */}
      {isSaving && (
        <p className="text-sm text-muted-foreground text-center">
          Saving draft...
        </p>
      )}
    </div>
  )
}
```

### Pattern 3: Countdown Timer with Cleanup

**What:** Real-time deadline countdown using useEffect with proper cleanup to prevent memory leaks
**When to use:** Displaying time-sensitive information that updates every second
**Example:**

```typescript
// app/dashboard/tenders/[id]/bid/components/deadline-timer.tsx
'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Clock, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type DeadlineTimerProps = {
  deadline: Date
}

type TimeRemaining = {
  days: number
  hours: number
  minutes: number
  seconds: number
  isUrgent: boolean // Less than 24 hours
  isPast: boolean
}

function calculateTimeRemaining(deadline: Date): TimeRemaining {
  const now = new Date()
  const diff = deadline.getTime() - now.getTime()

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isUrgent: true, isPast: true }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  const isUrgent = diff < 24 * 60 * 60 * 1000 // Less than 24 hours

  return { days, hours, minutes, seconds, isUrgent, isPast: false }
}

export function DeadlineTimer({ deadline }: DeadlineTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(
    calculateTimeRemaining(deadline)
  )

  useEffect(() => {
    // Update every second
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(deadline))
    }, 1000)

    // Cleanup: clear interval when component unmounts
    return () => clearInterval(timer)
  }, [deadline])

  if (timeRemaining.isPast) {
    return (
      <Badge variant="destructive" className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        Deadline passed
      </Badge>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Clock className={timeRemaining.isUrgent ? 'h-5 w-5 text-orange-500' : 'h-5 w-5'} />
      <div className={timeRemaining.isUrgent ? 'text-orange-500' : ''}>
        {timeRemaining.days > 0 && (
          <span className="font-semibold">{timeRemaining.days}d </span>
        )}
        <span className="font-semibold">
          {String(timeRemaining.hours).padStart(2, '0')}:
          {String(timeRemaining.minutes).padStart(2, '0')}:
          {String(timeRemaining.seconds).padStart(2, '0')}
        </span>
        <span className="text-sm text-muted-foreground ml-2">remaining</span>
      </div>
    </div>
  )
}
```

### Pattern 4: Server Action Auto-Save with Status Updates

**What:** Server Actions for saving bid drafts with optimistic updates and status transitions
**When to use:** CRUD operations on bid drafts with status management
**Example:**

```typescript
// actions/bids.ts
'use server'

import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { BidStatus } from '@prisma/client'

const bidContentSchema = z.record(z.any()) // Dynamic schema based on questions

export async function saveBidDraft(
  bidId: string,
  content: Record<string, any>
) {
  const session = await verifySession()

  // Validate content
  const validatedContent = bidContentSchema.safeParse(content)
  if (!validatedContent.success) {
    return { error: 'Invalid bid content' }
  }

  try {
    // Verify ownership
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: { company: true },
    })

    if (!bid || bid.company.ownerId !== session.userId) {
      return { error: 'Unauthorized' }
    }

    // Update bid content
    await prisma.bid.update({
      where: { id: bidId },
      data: {
        content: validatedContent.data,
        updatedAt: new Date(),
      },
    })

    revalidatePath(`/dashboard/tenders/${bid.tenderId}/bid`)
    return { success: true }
  } catch (error) {
    console.error('Failed to save bid draft:', error)
    return { error: 'Failed to save draft' }
  }
}

export async function createBid(tenderId: string) {
  const session = await verifySession()

  try {
    // Get user's company
    const company = await prisma.company.findUnique({
      where: { ownerId: session.userId },
    })

    if (!company) {
      return { error: 'Complete your company profile first' }
    }

    // Check for existing bid
    const existingBid = await prisma.bid.findFirst({
      where: {
        tenderId,
        companyId: company.id,
      },
    })

    if (existingBid) {
      return { bidId: existingBid.id } // Return existing bid
    }

    // Create new bid
    const bid = await prisma.bid.create({
      data: {
        tenderId,
        companyId: company.id,
        status: 'DRAFT',
        content: {}, // Empty content initially
      },
    })

    revalidatePath(`/dashboard/tenders/${tenderId}`)
    return { bidId: bid.id }
  } catch (error) {
    console.error('Failed to create bid:', error)
    return { error: 'Failed to create bid' }
  }
}

export async function updateBidStatus(
  bidId: string,
  status: BidStatus
) {
  const session = await verifySession()

  try {
    // Verify ownership
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: { company: true },
    })

    if (!bid || bid.company.ownerId !== session.userId) {
      return { error: 'Unauthorized' }
    }

    // Validate status transition
    if (status === 'FINALIZED' && bid.status === 'DRAFT') {
      // Check if all required questions are answered
      const hasAllAnswers = validateBidCompleteness(bid.content as Record<string, any>)
      if (!hasAllAnswers) {
        return { error: 'Please answer all required questions before finalizing' }
      }
    }

    await prisma.bid.update({
      where: { id: bidId },
      data: { status },
    })

    revalidatePath(`/dashboard/tenders/${bid.tenderId}/bid`)
    return { success: true }
  } catch (error) {
    console.error('Failed to update bid status:', error)
    return { error: 'Failed to update status' }
  }
}

function validateBidCompleteness(content: Record<string, any>): boolean {
  // Mock validation - in real implementation, check against required questions
  const requiredFields = ['company_overview', 'proposed_approach', 'timeline']
  return requiredFields.every(field =>
    content[field] !== undefined &&
    content[field] !== '' &&
    content[field] !== null
  )
}
```

### Pattern 5: Progress Indicator for Q&A

**What:** Visual progress tracker showing answered/total questions and completion percentage
**When to use:** Multi-step questionnaires to show user their progress
**Example:**

```typescript
// app/dashboard/tenders/[id]/bid/components/progress-indicator.tsx
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Circle } from 'lucide-react'

type ProgressIndicatorProps = {
  current: number
  total: number
  answered: number
  progress: number
}

export function ProgressIndicator({
  current,
  total,
  answered,
  progress,
}: ProgressIndicatorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Question {current} of {total}
        </span>
        <span className="font-medium">
          {answered} / {total} answered
        </span>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {answered === total ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            All questions answered
          </>
        ) : (
          <>
            <Circle className="h-4 w-4" />
            {total - answered} questions remaining
          </>
        )}
      </div>
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **No debouncing on auto-save:** Leads to race conditions and excessive database writes, always debounce by 300-500ms
- **Missing timer cleanup in useEffect:** Causes memory leaks, always return cleanup function that calls clearInterval/clearTimeout
- **Silent auto-save failures:** User loses work without knowing, always show toast feedback for save success/failure
- **Complex AI integration for MVP:** Overengineering, use simple template-based question generation first
- **Hardcoded question order:** Makes questions brittle, generate from tender requirements for flexibility
- **No validation before status change:** Users can finalize incomplete bids, validate completeness before allowing FINALIZED status
- **Client-side countdown only:** Inaccurate for long sessions, recalculate from server time periodically

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Toast notifications | Custom toast with position/animation | sonner (shadcn/ui) | Accessibility, queuing, dismiss handling, mobile-friendly |
| Debounce utility | Custom setTimeout tracking | use-debounce library | Handles cleanup, React strict mode, edge cases |
| Countdown timer | Manual interval math | react-countdown (optional) | Handles timezone, DST, formatting, accessibility |
| Q&A schema validation | Manual if/else validation | Zod dynamic schemas | Type safety, reusable, better error messages |
| Form state management | useState for each question | React Hook Form | Handles validation, errors, touched state professionally |
| Progress calculation | Manual percentage math | Built-in component logic | Edge cases (division by zero, rounding) |

**Key insight:** Q&A workflows have subtle UX requirements (validation timing, error display, progress feedback, save confirmations) that look simple but take significant effort to handle properly. Reusing proven patterns from Phase 2 wizard + adding toast feedback + proper timer cleanup = robust solution without reinventing wheels.

## Common Pitfalls

### Pitfall 1: Auto-Save Race Conditions

**What goes wrong:** Multiple auto-save requests fire simultaneously when user types/blurs rapidly, causing data conflicts or stale overwrites.

**Why it happens:** React Hook Form's watch() fires on every keystroke, onBlur can overlap with onChange, debouncing not implemented or configured wrong.

**How to avoid:**
1. Use 500ms debounce (300ms too aggressive for Q&A sessions, 1000ms too slow for UX)
2. Track save state (isSaving) and skip saves while one is in progress
3. Cancel pending debounced calls on unmount with useDebounce cleanup
4. Use optimistic UI updates with rollback on error
5. Show save indicators ("Saving..." → "Saved") for user confidence

**Warning signs:**
- Multiple "Draft saved" toasts appearing quickly
- Network tab shows overlapping POST requests to same endpoint
- Data reverting to old values intermittently
- Console errors about concurrent updates

**Code example:**
```typescript
import { useDebouncedCallback } from 'use-debounce'

const [isSaving, setIsSaving] = useState(false)

const debouncedSave = useDebouncedCallback(
  async (data: Record<string, any>) => {
    if (isSaving) return // Skip if save in progress

    setIsSaving(true)
    try {
      await saveBidDraft(bidId, data)
      toast.success('Draft saved')
    } catch (error) {
      toast.error('Save failed')
    } finally {
      setIsSaving(false)
    }
  },
  500,
  { maxWait: 2000 } // Force save after 2s even if user keeps typing
)
```

### Pitfall 2: Countdown Timer Memory Leaks

**What goes wrong:** Timer continues running after component unmounts, causing "Can't perform a React state update on an unmounted component" errors and memory leaks.

**Why it happens:** setInterval creates a timer that persists beyond component lifecycle, cleanup function not returned from useEffect.

**How to avoid:**
1. Always return cleanup function from useEffect that clears the interval
2. Store interval ID in variable, not directly in setInterval
3. Don't use timers inside state updater functions (causes exponential speed-up)
4. Consider using requestAnimationFrame for smoother updates (advanced)
5. Test unmounting scenarios (navigation away, tab closing)

**Warning signs:**
- Console warnings about state updates on unmounted components
- Timer continues ticking in browser DevTools after navigating away
- Performance degradation over time
- Multiple timers running simultaneously when only one expected

**Code example:**
```typescript
// BAD: No cleanup, causes memory leak
useEffect(() => {
  setInterval(() => {
    setTimeRemaining(calculateTimeRemaining(deadline))
  }, 1000)
}, [deadline])

// GOOD: Proper cleanup
useEffect(() => {
  const timer = setInterval(() => {
    setTimeRemaining(calculateTimeRemaining(deadline))
  }, 1000)

  return () => clearInterval(timer) // CRITICAL: cleanup
}, [deadline])
```

### Pitfall 3: Invalid Status Transitions

**What goes wrong:** Users can change bid status to FINALIZED with incomplete answers, or back from FINALIZED to DRAFT unexpectedly.

**Why it happens:** Missing validation in status update Server Action, client-side validation bypassed, state machine not enforced.

**How to avoid:**
1. Define valid status transitions (DRAFT → IN_REVIEW → FINALIZED, one-way)
2. Validate completeness before allowing FINALIZED (check all required questions answered)
3. Server-side validation in updateBidStatus action (never trust client)
4. Show clear error messages when transition invalid
5. Disable status change buttons based on current state

**Warning signs:**
- Incomplete bids marked as FINALIZED
- Users confused about status meanings
- Status reverting unexpectedly
- Finalized bids being edited

**Code example:**
```typescript
// actions/bids.ts
export async function updateBidStatus(bidId: string, newStatus: BidStatus) {
  const bid = await prisma.bid.findUnique({ where: { id: bidId } })

  // Define valid transitions
  const validTransitions: Record<BidStatus, BidStatus[]> = {
    DRAFT: ['IN_REVIEW'],
    IN_REVIEW: ['FINALIZED', 'DRAFT'], // Can go back to edit
    FINALIZED: ['SUBMITTED'], // Can only move forward
    SUBMITTED: [], // Terminal state
  }

  if (!validTransitions[bid.status].includes(newStatus)) {
    return { error: `Cannot transition from ${bid.status} to ${newStatus}` }
  }

  // Validate completeness for FINALIZED
  if (newStatus === 'FINALIZED') {
    const isComplete = validateBidCompleteness(bid.content)
    if (!isComplete) {
      return { error: 'Answer all required questions before finalizing' }
    }
  }

  await prisma.bid.update({
    where: { id: bidId },
    data: { status: newStatus },
  })

  return { success: true }
}
```

### Pitfall 4: Question Dependency Hell

**What goes wrong:** Conditional questions (Q5 only shows if Q3 = "Yes") cause validation errors, answer persistence issues, or confusing UX when questions appear/disappear.

**Why it happens:** React Hook Form validation runs on hidden fields, schema doesn't account for conditional fields, answers not cleared when questions hide.

**How to avoid:**
1. For MVP, avoid conditional questions entirely (flat linear questionnaire)
2. If needed: use React Hook Form's `shouldUnregister: true` to remove hidden fields
3. Clear validation errors when fields become hidden
4. Store conditional logic in question definitions, not scattered in components
5. Test all conditional paths thoroughly

**Warning signs:**
- Validation errors for questions user can't see
- Required field errors after moving backward/forward
- Answers persisting for hidden questions
- User confusion about why questions disappeared

**Recommendation for Phase 4 MVP:**
```typescript
// AVOID for MVP - adds complexity
const conditionalQuestions = [
  { id: 'q1', text: 'Do you have ISO certification?', type: 'select' },
  {
    id: 'q2',
    text: 'Please upload certificate',
    type: 'file',
    showIf: (answers) => answers.q1 === 'Yes' // COMPLEX
  },
]

// PREFER for MVP - simple linear flow
const linearQuestions = [
  { id: 'q1', text: 'Do you have ISO certification?', type: 'select' },
  {
    id: 'q2',
    text: 'If yes, please describe your certifications (or write N/A)',
    type: 'textarea',
    required: false // Make it optional instead of conditional
  },
]
```

### Pitfall 5: Timezone Issues in Deadline Calculations

**What goes wrong:** Countdown shows wrong time for users in different timezones, or deadline appears passed when it hasn't, or vice versa.

**Why it happens:** Date objects use local timezone by default, server stores UTC, comparison happens in wrong timezone context.

**How to avoid:**
1. Store deadlines in UTC in database (Prisma does this by default)
2. Pass deadline as ISO string from server, parse with new Date() on client
3. Calculate countdown in user's local time (acceptable for UX)
4. For server-side validation, compare in UTC
5. Test with users in different timezones (use browser DevTools timezone emulation)

**Warning signs:**
- Countdown off by several hours for some users
- Deadline warnings appearing too early/late
- Midnight edge cases failing
- Daylight saving time transitions cause issues

**Code example:**
```typescript
// Server: deadline stored as DateTime (UTC)
const tender = await prisma.tender.findUnique({ where: { id } })
// tender.deadline is a Date object in UTC

// Server Component: pass to client as ISO string
<DeadlineTimer deadline={tender.deadline.toISOString()} />

// Client Component: parse and calculate in local time
type Props = { deadline: string }

export function DeadlineTimer({ deadline }: Props) {
  const deadlineDate = new Date(deadline) // Parses ISO string correctly
  const now = new Date() // User's local time
  const diff = deadlineDate.getTime() - now.getTime() // Compare milliseconds (timezone-safe)

  // Calculate days/hours/minutes from diff
}
```

### Pitfall 6: Lost Work on Navigation

**What goes wrong:** User navigates away from bid workspace (back button, link click) and unsaved changes are lost silently.

**Why it happens:** No warning before navigation, auto-save debounce hasn't fired yet, browser navigation doesn't trigger save.

**How to avoid:**
1. Show browser confirmation dialog if unsaved changes exist (beforeunload event)
2. Reduce debounce delay to 300ms if navigation detection needed
3. Save immediately on Ctrl+S / Cmd+S keyboard shortcut
4. Show "Saving..." indicator prominently during debounce period
5. Consider using Next.js router events to save before navigation (complex)

**Warning signs:**
- User reports losing several minutes of work
- No "unsaved changes" warning when navigating away
- Auto-save indicator shows "Saving..." but navigation happens first
- Back button causes data loss

**Code example:**
```typescript
// Warn before unload if unsaved changes
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (form.formState.isDirty) {
      e.preventDefault()
      e.returnValue = '' // Chrome requires this
    }
  }

  window.addEventListener('beforeunload', handleBeforeUnload)
  return () => window.removeEventListener('beforeunload', handleBeforeUnload)
}, [form.formState.isDirty])

// Save on Ctrl+S / Cmd+S
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      debouncedSave.flush() // Force immediate save
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [])
```

## Code Examples

Verified patterns from official sources and community best practices:

### Complete Bid Workspace Page

```typescript
// app/dashboard/tenders/[id]/bid/page.tsx
import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { generateQuestionsFromRequirements } from '@/lib/bids/questions'
import { BidWorkspace } from './components/bid-workspace'

export default async function BidWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: tenderId } = await params
  const session = await verifySession()

  // Get user's company
  const company = await prisma.company.findUnique({
    where: { ownerId: session.userId },
  })

  if (!company) {
    redirect('/dashboard/profile/wizard')
  }

  // Get tender
  const tender = await prisma.tender.findUnique({
    where: { id: tenderId },
  })

  if (!tender) {
    redirect('/dashboard/tenders')
  }

  // Get or create bid
  let bid = await prisma.bid.findFirst({
    where: {
      tenderId,
      companyId: company.id,
    },
  })

  if (!bid) {
    bid = await prisma.bid.create({
      data: {
        tenderId,
        companyId: company.id,
        status: 'DRAFT',
        content: {},
      },
    })
  }

  // Generate questions from tender requirements
  const requirements = tender.requirements
    ? JSON.parse(tender.requirements as string)
    : {}
  const questions = generateQuestionsFromRequirements(
    requirements,
    tender.title,
    tender.sector
  )

  const bidWithTender = { ...bid, tender }
  const initialAnswers = bid.content as Record<string, any> || {}

  return (
    <BidWorkspace
      bid={bidWithTender}
      questions={questions}
      initialAnswers={initialAnswers}
    />
  )
}
```

### Question Card Component

```typescript
// app/dashboard/tenders/[id]/bid/components/question-card.tsx
import { UseFormReturn } from 'react-hook-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Question } from '@/lib/bids/questions'

type QuestionCardProps = {
  question: Question
  form: UseFormReturn<any>
  onNext: () => void
  onPrevious: () => void
  isFirst: boolean
  isLast: boolean
}

export function QuestionCard({
  question,
  form,
  onNext,
  onPrevious,
  isFirst,
  isLast,
}: QuestionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{question.text}</CardTitle>
        {question.helpText && (
          <CardDescription>{question.helpText}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name={question.id}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {question.required && <span className="text-red-500">* </span>}
                Answer
              </FormLabel>
              <FormControl>
                {question.type === 'textarea' ? (
                  <Textarea
                    {...field}
                    rows={6}
                    placeholder="Type your answer here..."
                  />
                ) : question.type === 'select' ? (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {question.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : question.type === 'number' ? (
                  <Input
                    {...field}
                    type="number"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                ) : (
                  <Input {...field} type={question.type} />
                )}
              </FormControl>
              {question.helpText && (
                <FormDescription>{question.helpText}</FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={isFirst}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button type="button" onClick={onNext}>
          {isLast ? 'Review' : 'Next'}
          {!isLast && <ChevronRight className="ml-2 h-4 w-4" />}
        </Button>
      </CardFooter>
    </Card>
  )
}
```

### Start Bid Button (Tender Detail Page)

```typescript
// components/bids/bid-actions.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createBid } from '@/actions/bids'
import { toast } from 'sonner'
import { FileEdit } from 'lucide-react'

type BidActionsProps = {
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

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.bidId) {
        router.push(`/dashboard/tenders/${tenderId}/bid`)
      }
    } catch (error) {
      toast.error('Failed to create bid')
    } finally {
      setIsLoading(false)
    }
  }

  if (existingBidId) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <span className="text-muted-foreground">Your bid: </span>
          <span className="font-medium">{existingBidStatus}</span>
        </div>
        <Button
          onClick={() => router.push(`/dashboard/tenders/${tenderId}/bid`)}
          variant="outline"
        >
          <FileEdit className="mr-2 h-4 w-4" />
          Continue Bid
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={handleStartBid} disabled={isLoading}>
      <FileEdit className="mr-2 h-4 w-4" />
      {isLoading ? 'Creating...' : 'Start Bid'}
    </Button>
  )
}
```

### Toast Notifications Setup

```typescript
// app/layout.tsx (add Toaster component)
import { Toaster } from '@/components/ui/sonner'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-hot-toast for notifications | sonner (shadcn/ui recommended) | 2024-2025 | Better shadcn/ui integration, smaller bundle, better mobile UX |
| Manual debounce with setTimeout | use-debounce library | 2023+ | Handles cleanup, React 19 compatibility, better DX |
| Custom countdown components | react-countdown or date-fns calculations | Ongoing | Handles edge cases (timezone, DST), less code |
| Complex AI question generation | Template-based for MVP, AI later | 2026 | Faster MVP delivery, lower cost, sufficient for early users |
| SurveyJS for forms | React Hook Form with dynamic schema | 2024+ | Less bundle size, more control, already in stack |
| Client-only auto-save | Server Actions with revalidation | Next.js 13+ | Better server-client sync, no API routes needed |
| useState for Q&A flow | React Hook Form with controlled index | 2023+ | Better validation, error handling, less boilerplate |

**Deprecated/outdated:**
- **react-hot-toast:** Still works, but sonner is shadcn/ui's official recommendation
- **Manual timer cleanup without libraries:** Error-prone, use-debounce handles it
- **Complex question builders for MVP:** Overengineering, start with templates

## Open Questions

Things that couldn't be fully resolved:

1. **Question Template Coverage**
   - What we know: Can generate questions from tags, certifications, experience requirements
   - What's unclear: How many question templates needed to cover all tender types in IT & Construction
   - Recommendation: Start with 8-10 base questions, add templates as tender variety increases post-MVP

2. **Bid Export Format**
   - What we know: MVP is export-only (no direct submission to TED), STATE.md decision
   - What's unclear: Export as PDF, Word doc, or both? Formatting requirements?
   - Recommendation: Start with plain text/markdown export, add PDF generation if users request it

3. **Answer Character Limits**
   - What we know: Textarea questions need max lengths for UX
   - What's unclear: Optimal character limits per question type (varies by tender complexity)
   - Recommendation: Use 1000 chars for standard questions, 2000 for detailed questions, show character counter

4. **Concurrent Editing Prevention**
   - What we know: Only one company member should edit bid at a time
   - What's unclear: Whether to implement locking for MVP or show warning
   - Recommendation: For MVP, allow concurrent edits (last write wins), add locking if multi-user editing becomes issue

5. **Deadline Notification Strategy**
   - What we know: Countdown timer shows on workspace page
   - What's unclear: Should system send email notifications at 24h/1h before deadline?
   - Recommendation: Defer email notifications to Phase 5+, workspace timer sufficient for MVP

## Sources

### Primary (HIGH confidence)
- [React Hook Form - useForm](https://react-hook-form.com/docs/useform) - Official API reference for form state
- [React Hook Form - watch](https://react-hook-form.com/docs/useform/watch) - Official watch API documentation
- [React Hook Form - trigger](https://react-hook-form.com/docs/useform/trigger) - Manual validation triggering
- [shadcn/ui - Sonner](https://ui.shadcn.com/docs/components/sonner) - Official toast component
- [Next.js - Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) - Official Server Actions guide
- [date-fns Documentation](https://date-fns.org/) - Date manipulation and formatting

### Secondary (MEDIUM confidence)
- [Building a Dynamic Deadline Countdown Timer in React.js](https://dev.to/devwithshreyash/building-a-dynamic-deadline-countdown-timer-in-reactjs-with-tailwind-css-p3n) - Countdown implementation pattern
- [React Server Actions with Toast Feedback](https://www.robinwieruch.de/react-server-actions-toast/) - Toast + Server Actions pattern
- [How to Fix Memory Leaks in React Applications](https://www.freecodecamp.org/news/fix-memory-leaks-in-react-apps/) - Timer cleanup patterns
- [React useEffect Cleanup Function](https://refine.dev/blog/useeffect-cleanup/) - Cleanup best practices
- [The React Timer Trap: Refactoring a "Simple" Countdown](https://dev.to/orhalim/the-react-timer-trap-refactoring-a-simple-countdown-from-buggy-to-bulletproof-3ogj) - Timer pitfalls and solutions
- [Build a Multistep Form With React Hook Form](https://claritydev.net/blog/build-a-multistep-form-with-react-hook-form) - Multi-step patterns

### Tertiary (LOW confidence - for context only)
- WebSearch: "React multi-step questionnaire form wizard best practices 2026" - General patterns
- WebSearch: "Next.js auto-save form draft pattern" - Community approaches
- WebSearch: "dynamic questionnaire generation from JSON schema" - SurveyJS and form builders (not recommended for MVP)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All core libraries already in project, proven in Phase 2 & 3
- Architecture patterns: HIGH - Q&A workflow is variant of Phase 2 wizard, auto-save proven, timers are standard React pattern
- Mock question generation: MEDIUM - Template approach is reasonable but will need refinement based on real tender data
- Countdown timer: HIGH - Standard React pattern with well-documented cleanup requirements
- Status management: HIGH - Prisma enum already defined, Server Action pattern proven

**Research date:** 2026-02-07
**Valid until:** 2026-03-07 (30 days - stable ecosystem, patterns mature)

**Implementation notes:**
- No breaking changes expected in stack components
- sonner and use-debounce are only new dependencies (both lightweight)
- All patterns compatible with existing Phases 1-3 implementation
- Mock question generation sufficient for MVP, can be replaced with real AI later without changing architecture
