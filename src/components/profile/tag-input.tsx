'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
}

export function TagInput({
  value,
  onChange,
  placeholder = 'Type and press Enter to add tags',
  maxTags = 20,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase()

    // Ignore empty or duplicate tags
    if (!trimmed || value.includes(trimmed)) {
      setInputValue('')
      return
    }

    // Add tag to array
    onChange([...value, trimmed])
    setInputValue('')
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (inputValue) {
        addTag(inputValue)
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      const newTags = [...value]
      newTags.pop()
      onChange(newTags)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-background min-h-[100px]">
        {value.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-1"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 hover:bg-secondary-foreground/20 rounded-sm"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[200px] border-none shadow-none focus-visible:ring-0 px-0"
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Press Enter or comma to add. Backspace to remove last tag.</span>
        <span className={value.length >= maxTags ? 'text-yellow-600' : ''}>
          {value.length} / {maxTags} tags
        </span>
      </div>
    </div>
  )
}
