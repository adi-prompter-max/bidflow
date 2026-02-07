'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useCallback, useRef } from 'react'
import { saveCapabilities } from '@/actions/profile'
import {
  capabilitiesSchema,
  type CapabilitiesFormValues,
} from '@/lib/validations/profile'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { TagInput } from '@/components/profile/tag-input'
import { CheckCircle2 } from 'lucide-react'
import type { Company, Certification, Project } from '@prisma/client'

type CompanyProfile = (Company & {
  certifications: Certification[]
  projects: Project[]
}) | null

interface StepCapabilitiesProps {
  initialData: CompanyProfile
}

export function StepCapabilities({ initialData }: StepCapabilitiesProps) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const form = useForm<CapabilitiesFormValues>({
    resolver: zodResolver(capabilitiesSchema),
    defaultValues: {
      capabilityDescription: initialData?.capabilityDescription || '',
      capabilityTags: initialData?.capabilityTags || [],
    },
  })

  // Debounced auto-save function
  const debouncedSave = useCallback(async () => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(async () => {
      const values = form.getValues()

      // Validate
      const isValid = await form.trigger()

      if (isValid) {
        setSaveStatus('saving')
        const result = await saveCapabilities(values)

        if (result.success) {
          setSaveStatus('saved')
          // Reset to idle after 2 seconds
          setTimeout(() => setSaveStatus('idle'), 2000)
        } else {
          setSaveStatus('idle')
          // Set form errors if validation failed on server
          if (result.errors) {
            Object.entries(result.errors).forEach(([key, messages]) => {
              form.setError(key as keyof CapabilitiesFormValues, {
                message: messages[0],
              })
            })
          }
        }
      }
    }, 500)
  }, [form])

  const handleDescriptionBlur = () => {
    debouncedSave()
  }

  const handleTagsChange = (tags: string[]) => {
    form.setValue('capabilityTags', tags)
    debouncedSave()
  }

  const descriptionValue = form.watch('capabilityDescription') || ''
  const charCount = descriptionValue.length
  const isNearLimit = charCount > 450

  return (
    <div className="p-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Capabilities & Expertise</h2>
          <p className="text-muted-foreground">
            Describe your core capabilities and add tags that highlight your expertise.
          </p>
        </div>

        {saveStatus === 'saved' && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Saved</span>
          </div>
        )}

        <Form {...form}>
          <form className="space-y-6">
            <FormField
              control={form.control}
              name="capabilityDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capability Description</FormLabel>
                  <p className="text-sm text-muted-foreground mb-2">
                    Describe your core capabilities and services
                  </p>
                  <FormControl>
                    <Textarea
                      {...field}
                      onBlur={handleDescriptionBlur}
                      placeholder="E.g., We specialize in cloud infrastructure, cybersecurity consulting, and enterprise software development with 15+ years experience..."
                      rows={5}
                      maxLength={500}
                    />
                  </FormControl>
                  <div className="flex justify-between items-center">
                    <FormMessage />
                    <span
                      className={`text-xs ${
                        isNearLimit ? 'text-yellow-600' : 'text-muted-foreground'
                      }`}
                    >
                      {charCount} / 500
                    </span>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capabilityTags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capability Tags</FormLabel>
                  <p className="text-sm text-muted-foreground mb-2">
                    Add tags that describe your expertise (e.g., cloud, cybersecurity, agile)
                  </p>
                  <FormControl>
                    <TagInput
                      value={field.value}
                      onChange={handleTagsChange}
                      maxTags={20}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </div>
  )
}
