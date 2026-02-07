'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useCallback, useRef } from 'react'
import { saveCompanyInfo } from '@/actions/profile'
import {
  companyInfoSchema,
  COMPANY_SIZES,
  type CompanyInfoFormValues,
} from '@/lib/validations/profile'
import {
  Form,
  FormControl,
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
import { CheckCircle2 } from 'lucide-react'
import type { Company, Certification, Project } from '@prisma/client'

type CompanyProfile = (Company & {
  certifications: Certification[]
  projects: Project[]
}) | null

interface StepCompanyInfoProps {
  initialData: CompanyProfile
}

export function StepCompanyInfo({ initialData }: StepCompanyInfoProps) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const form = useForm<CompanyInfoFormValues>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: {
      name: initialData?.name || '',
      country: initialData?.country || '',
      size: initialData?.size || '',
      website: initialData?.website || '',
      description: initialData?.description || '',
    },
  })

  // Debounced auto-save function
  const debouncedSave = useCallback(
    async (fieldName: keyof CompanyInfoFormValues) => {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      // Set new timeout
      saveTimeoutRef.current = setTimeout(async () => {
        // Trigger validation for the specific field
        const isValid = await form.trigger(fieldName)

        if (isValid) {
          setSaveStatus('saving')
          const values = form.getValues()

          const result = await saveCompanyInfo(values)

          if (result.success) {
            setSaveStatus('saved')
            // Reset to idle after 2 seconds
            setTimeout(() => setSaveStatus('idle'), 2000)
          } else {
            setSaveStatus('idle')
            // Set form errors if validation failed on server
            if (result.errors) {
              Object.entries(result.errors).forEach(([key, messages]) => {
                form.setError(key as keyof CompanyInfoFormValues, {
                  message: messages[0],
                })
              })
            }
          }
        }
      }, 500)
    },
    [form]
  )

  const handleBlur = (fieldName: keyof CompanyInfoFormValues) => {
    debouncedSave(fieldName)
  }

  const descriptionValue = form.watch('description') || ''
  const charCount = descriptionValue.length
  const isNearLimit = charCount > 270

  return (
    <div className="p-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Company Information</h2>
          <p className="text-muted-foreground">
            Tell us about your company. Changes are saved automatically.
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Company Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onBlur={() => handleBlur('name')}
                      placeholder="Enter company name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Country <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onBlur={() => handleBlur('country')}
                      placeholder="Enter country"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Company Size <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      handleBlur('size')
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COMPANY_SIZES.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size} employees
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onBlur={() => handleBlur('website')}
                      placeholder="https://example.com"
                      type="url"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brief Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      onBlur={() => handleBlur('description')}
                      placeholder="Describe your company in a few sentences"
                      rows={4}
                      maxLength={300}
                    />
                  </FormControl>
                  <div className="flex justify-between items-center">
                    <FormMessage />
                    <span
                      className={`text-xs ${
                        isNearLimit ? 'text-yellow-600' : 'text-muted-foreground'
                      }`}
                    >
                      {charCount} / 300
                    </span>
                  </div>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </div>
  )
}
