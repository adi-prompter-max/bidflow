'use client'

import type { Question } from '@/lib/bids/questions'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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

type QuestionCardProps = {
  question: Question
  value: unknown
  onChange: (value: unknown) => void
  onNext: () => void
  onPrevious: () => void
  isFirst: boolean
  isLast: boolean
}

export function QuestionCard({
  question,
  value,
  onChange,
  onNext,
  onPrevious,
  isFirst,
  isLast,
}: QuestionCardProps) {
  const stringValue = value !== null && value !== undefined ? String(value) : ''

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-baseline gap-2">
          {question.text}
          {question.required && <span className="text-red-500 text-sm">*</span>}
        </CardTitle>
        {question.helpText && (
          <CardDescription>{question.helpText}</CardDescription>
        )}
      </CardHeader>

      <CardContent>
        {question.type === 'textarea' && (
          <Textarea
            rows={6}
            value={stringValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter your answer..."
            className="resize-none"
          />
        )}

        {question.type === 'text' && (
          <Input
            type="text"
            value={stringValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter your answer..."
          />
        )}

        {question.type === 'number' && (
          <Input
            type="number"
            value={stringValue}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder="Enter a number..."
          />
        )}

        {question.type === 'select' && question.options && (
          <Select value={stringValue} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {question.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirst}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <Button onClick={onNext} className="gap-2">
          {isLast ? 'Review Answers' : 'Next'}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
