# Phase 2: Company Profiling - Research

**Researched:** 2026-02-07
**Domain:** Multi-step Forms, Profile Management, Tag Input, Modal Dialogs, Auto-save Patterns
**Confidence:** HIGH

## Summary

Phase 2 implements a comprehensive company profile creation and management system using a multi-step wizard pattern with auto-save functionality. The research confirms that the existing stack (Next.js 16.1.6, React Hook Form 7.71+, Radix UI, shadcn/ui, Prisma 6, Tailwind v4) provides all necessary capabilities for implementing the required features without additional dependencies.

**Key findings:**
- Multi-step wizards are well-supported with React Hook Form's native capabilities and controlled state management
- Auto-save on blur integrates naturally with React Hook Form's validation modes and Next.js Server Actions
- Tag input components exist as community extensions to shadcn/ui (Emblor being the most feature-complete)
- Radix UI Dialog provides robust modal functionality for table editing workflows
- Prisma's one-to-many relations and nested writes support the profile data structure efficiently
- All shadcn/ui components are fully compatible with Tailwind v4 as of 2026

**Primary recommendation:** Build the wizard using React Hook Form with controlled step state, implement auto-save via onBlur handlers calling Server Actions, use Emblor for tag inputs, leverage Radix Dialog for past projects editing, and structure profile data with one-to-many Prisma relations for certifications and projects.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Profile flow
- Multi-step wizard with 5 steps: Company Info → Industry Sectors → Capabilities & Tags → Certifications → Past Projects
- Linear but skippable: steps presented in order, user can skip ahead, skipped steps marked incomplete
- Simple progress bar at top (percentage-based, no step labels)
- Auto-save on blur: each field saves automatically when user moves to next field
- Dashboard shows a "Complete your profile" card linking to wizard (not a hard redirect on first login)
- After initial creation, editing happens on a dedicated profile page (not re-entering the wizard)

#### Company info (Step 1)
- Standard detail level: company name, country, company size (employee range), website, brief description (1-2 sentences)

#### Industry sectors (Step 2)
- Checkbox list UI (not cards)
- Only IT & Construction sectors for MVP (2 top-level options)
- Multi-select: user can pick one or both
- Each sector has 3-5 sub-categories for more precise matching (e.g., IT → Cloud Services, Cybersecurity, Software Dev)

#### Capabilities & tags (Step 3)
- One capability description + tag set per company (not per sector)
- Free-text textarea for description, plus tag input (type and press Enter, tags appear as removable chips)
- Soft limits: character counter for description (~500 chars), tag count shown but not enforced (~20 tags)

#### Past projects (Step 5)
- Standard detail per project: name, client name, description, sector, contract value range, year completed
- Displayed as a table with columns for name, client, sector, value, year
- Add/edit via modal dialog (keeps table view clean)
- Minimum 1 project required for wizard step to be considered complete

#### Profile completeness
- Dashboard shows a checklist card: which sections are done vs missing (✓ Company Info, ✗ Certifications)
- All 5 wizard steps required for profile to be considered "complete"
- Soft block on tender discovery: section visible but shows "Complete your profile to see matched tenders"
- Checklist card stays visible even at 100% (all items checked, serves as quick profile overview)

### Claude's Discretion
- Certifications step (Step 4) UI and data structure
- Exact sub-categories for IT and Construction sectors
- Profile page layout and section editing UX
- Error states and validation messaging
- Wizard navigation button styling and placement

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope

</user_constraints>

## Standard Stack

The established libraries/tools for multi-step forms and profile management in Next.js 16:

### Core (Already in Stack)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React Hook Form | 7.71+ | Form state & validation | Already in project, native multi-step support, excellent performance |
| Zod | 4.3.6 | Schema validation | Already in project, type-safe validation with RHF integration |
| Radix UI | Latest | Headless UI primitives | Already in project (@radix-ui/react-label, react-slot, react-form) |
| shadcn/ui | Latest | Pre-built components | Already in project, Tailwind v4 compatible, accessible |
| Prisma | 6.19.2 | Database ORM | Already in project, excellent relation support |
| Next.js | 16.1.6 | Framework | Already in project, Server Actions for auto-save |

### Supporting (New - Optional)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Emblor | Latest | Tag input component | For capabilities tags (Step 3) - most feature-complete option |
| react-textarea-counter | Latest | Character counter | Alternative to custom implementation (optional) |

**Note:** Most required functionality can be implemented with the existing stack. Only Emblor is strongly recommended as a new dependency.

### Installation (New Dependencies Only)

```bash
# Tag input component (recommended)
npx shadcn@latest add https://emblor.jaleelbennett.com/r/tags-input.json

# OR install Emblor manually if the above fails
npm install emblor
```

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Emblor tags | Custom tag input | Custom more control but more code, accessibility concerns |
| React Hook Form | Formik | Formik is older, larger bundle, worse performance |
| Radix Dialog | Headless UI Dialog | Headless UI less mature, smaller ecosystem |
| Server Actions auto-save | React Query mutations | More complexity, requires API routes, but better offline support |
| Prisma relations | Manual FK management | More control but lose type safety and convenience |

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── dashboard/
│   │   ├── profile/
│   │   │   ├── wizard/
│   │   │   │   └── page.tsx          # Multi-step wizard
│   │   │   └── page.tsx               # Profile view/edit page
│   │   └── page.tsx                   # Dashboard (with checklist card)
│   └── ...
├── components/
│   ├── profile/
│   │   ├── wizard/
│   │   │   ├── wizard-container.tsx   # Main wizard wrapper
│   │   │   ├── wizard-progress.tsx    # Progress bar component
│   │   │   ├── step-company-info.tsx  # Step 1
│   │   │   ├── step-sectors.tsx       # Step 2
│   │   │   ├── step-capabilities.tsx  # Step 3
│   │   │   ├── step-certifications.tsx # Step 4
│   │   │   └── step-projects.tsx      # Step 5
│   │   ├── project-dialog.tsx         # Modal for adding/editing projects
│   │   ├── tag-input.tsx              # Tag input component (or Emblor)
│   │   ├── character-counter.tsx      # Textarea with counter
│   │   └── completeness-card.tsx      # Dashboard checklist card
│   └── ui/                            # Existing shadcn components
├── actions/
│   └── profile.ts                     # Server Actions for profile CRUD
├── lib/
│   └── validations/
│       └── profile.ts                 # Zod schemas for each step
prisma/
└── schema.prisma                      # Updated with profile models
```

### Pattern 1: Multi-Step Wizard with Controlled State

**What:** Single form component with controlled step navigation and individual step components
**When to use:** Multi-step forms with validation, skippable steps, progress tracking
**Example:**

```typescript
// components/profile/wizard/wizard-container.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { WizardProgress } from './wizard-progress'
import { CompanyInfoStep } from './step-company-info'
import { SectorsStep } from './step-sectors'
// ... other steps

type WizardData = {
  companyInfo: CompanyInfoData
  sectors: SectorsData
  capabilities: CapabilitiesData
  certifications: CertificationsData
  projects: ProjectsData
}

export function ProfileWizard({ initialData }: { initialData?: Partial<WizardData> }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const form = useForm<WizardData>({
    resolver: zodResolver(wizardSchema),
    defaultValues: initialData || {},
    mode: 'onBlur', // Enable auto-save on blur
  })

  const steps = [
    { component: CompanyInfoStep, label: 'Company Info' },
    { component: SectorsStep, label: 'Industry Sectors' },
    { component: CapabilitiesStep, label: 'Capabilities' },
    { component: CertificationsStep, label: 'Certifications' },
    { component: ProjectsStep, label: 'Past Projects' },
  ]

  const CurrentStepComponent = steps[currentStep].component

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set(prev).add(currentStep))
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="max-w-3xl mx-auto">
      <WizardProgress progress={progress} />

      <Form {...form}>
        <CurrentStepComponent
          form={form}
          onNext={nextStep}
          onPrev={prevStep}
          isFirst={currentStep === 0}
          isLast={currentStep === steps.length - 1}
        />
      </Form>

      {/* Optional: Step navigation for skipping */}
      <div className="mt-8 flex justify-center gap-2">
        {steps.map((_, index) => (
          <button
            key={index}
            onClick={() => goToStep(index)}
            className={cn(
              'w-3 h-3 rounded-full',
              index === currentStep ? 'bg-primary' : 'bg-gray-300',
              completedSteps.has(index) && 'bg-green-500'
            )}
          />
        ))}
      </div>
    </div>
  )
}
```

### Pattern 2: Auto-Save on Blur with Server Actions

**What:** Individual field auto-save using React Hook Form's onBlur mode and Server Actions
**When to use:** Forms requiring automatic data persistence without explicit submit
**Example:**

```typescript
// components/profile/wizard/step-company-info.tsx
'use client'

import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { saveCompanyInfo } from '@/actions/profile'
import { useEffect } from 'react'

export function CompanyInfoStep({ form, onNext, onPrev, isFirst, isLast }) {
  const { watch } = form

  // Watch for changes and auto-save
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      // Only save on blur events
      if (type === 'change') return

      // Debounce could be added here if needed
      saveCompanyInfo(value.companyInfo)
    })
    return () => subscription.unsubscribe()
  }, [watch])

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="companyInfo.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Name *</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Acme Corp" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="companyInfo.description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Brief Description</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="1-2 sentences about your company"
                maxLength={200}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button onClick={onPrev} disabled={isFirst} variant="outline">
          Previous
        </Button>
        <Button onClick={onNext}>
          {isLast ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  )
}

// actions/profile.ts
'use server'

import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function saveCompanyInfo(data: CompanyInfoData) {
  const session = await verifySession()

  await prisma.company.upsert({
    where: { ownerId: session.userId },
    update: {
      name: data.name,
      country: data.country,
      size: data.size,
      website: data.website,
      description: data.description,
    },
    create: {
      name: data.name,
      country: data.country,
      size: data.size,
      website: data.website,
      description: data.description,
      ownerId: session.userId,
    },
  })

  revalidatePath('/dashboard/profile')
  return { success: true }
}
```

### Pattern 3: Tag Input with Emblor

**What:** Accessible tag input component with autocomplete, validation, and keyboard support
**When to use:** Capabilities tags, skill tags, any multi-value chip-based input
**Example:**

```typescript
// components/profile/wizard/step-capabilities.tsx
import { TagsInput } from 'emblor'

export function CapabilitiesStep({ form }) {
  const [tags, setTags] = useState<Tag[]>([])
  const { setValue } = form

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="capabilities.description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Capabilities Description</FormLabel>
            <FormControl>
              <div className="relative">
                <Textarea
                  {...field}
                  maxLength={500}
                  placeholder="Describe your company's key capabilities..."
                />
                <CharacterCounter current={field.value?.length || 0} max={500} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="capabilities.tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Capability Tags</FormLabel>
            <FormControl>
              <TagsInput
                tags={tags}
                setTags={(newTags) => {
                  setTags(newTags)
                  setValue('capabilities.tags', newTags.map(t => t.text))
                }}
                placeholder="Type and press Enter to add tags"
                maxTags={20}
                styleClasses={{
                  input: 'w-full',
                  tag: {
                    body: 'bg-primary text-primary-foreground',
                  },
                }}
              />
            </FormControl>
            <p className="text-sm text-muted-foreground">
              {tags.length} / 20 tags (soft limit)
            </p>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

// components/profile/character-counter.tsx
export function CharacterCounter({ current, max }: { current: number; max: number }) {
  const percentage = (current / max) * 100
  const isNearLimit = percentage > 80

  return (
    <div className="absolute bottom-2 right-2 text-sm">
      <span className={cn(
        'text-muted-foreground',
        isNearLimit && 'text-orange-500',
        current >= max && 'text-red-500'
      )}>
        {current} / {max}
      </span>
    </div>
  )
}
```

### Pattern 4: Modal Dialog for Table Editing

**What:** Radix Dialog with form for adding/editing table rows
**When to use:** Past projects, certifications, any tabular data with CRUD operations
**Example:**

```typescript
// components/profile/project-dialog.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { saveProject } from '@/actions/profile'

export function ProjectDialog({ project, onSave }: { project?: Project; onSave: () => void }) {
  const [open, setOpen] = useState(false)

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: project || {
      name: '',
      clientName: '',
      description: '',
      sector: '',
      valueRange: '',
      yearCompleted: new Date().getFullYear(),
    },
  })

  async function onSubmit(data: ProjectData) {
    await saveProject(data)
    setOpen(false)
    onSave() // Refresh parent table
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{project ? 'Edit' : 'Add Project'}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{project ? 'Edit Project' : 'Add Past Project'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Other fields... */}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// components/profile/wizard/step-projects.tsx
export function ProjectsStep({ form }) {
  const [projects, setProjects] = useState<Project[]>([])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Past Projects</h3>
        <ProjectDialog onSave={() => {
          // Refresh projects list
        }} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project Name</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Sector</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Year</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell>{project.name}</TableCell>
              <TableCell>{project.clientName}</TableCell>
              <TableCell>{project.sector}</TableCell>
              <TableCell>{project.valueRange}</TableCell>
              <TableCell>{project.yearCompleted}</TableCell>
              <TableCell>
                <ProjectDialog project={project} onSave={() => {}} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {projects.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No projects added yet. Add at least one project to complete this step.
        </p>
      )}
    </div>
  )
}
```

### Pattern 5: Checkbox List with Multi-Select

**What:** Checkbox group for industry sectors with sub-categories
**When to use:** Multi-select options, hierarchical selections
**Example:**

```typescript
// components/profile/wizard/step-sectors.tsx
import { Checkbox } from '@/components/ui/checkbox'

const SECTORS = {
  IT: {
    label: 'IT & Software',
    subcategories: ['Cloud Services', 'Cybersecurity', 'Software Development', 'Data Analytics', 'IT Consulting']
  },
  Construction: {
    label: 'Construction',
    subcategories: ['Residential', 'Commercial', 'Infrastructure', 'Renovation', 'Project Management']
  },
}

export function SectorsStep({ form }) {
  const [selectedSectors, setSelectedSectors] = useState<string[]>([])
  const [selectedSubcategories, setSelectedSubcategories] = useState<Record<string, string[]>>({})

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="sectors"
        render={() => (
          <FormItem>
            <FormLabel>Select Industry Sectors *</FormLabel>
            <div className="space-y-4">
              {Object.entries(SECTORS).map(([key, { label, subcategories }]) => (
                <div key={key} className="border rounded-lg p-4">
                  <FormField
                    control={form.control}
                    name="sectors"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(key)}
                            onCheckedChange={(checked) => {
                              const updated = checked
                                ? [...(field.value || []), key]
                                : field.value?.filter(v => v !== key)
                              field.onChange(updated)
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-semibold">{label}</FormLabel>
                      </FormItem>
                    )}
                  />

                  {selectedSectors.includes(key) && (
                    <div className="mt-4 ml-6 space-y-2">
                      <p className="text-sm text-muted-foreground">Select sub-categories:</p>
                      {subcategories.map((sub) => (
                        <FormItem key={sub} className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={selectedSubcategories[key]?.includes(sub)}
                              onCheckedChange={(checked) => {
                                // Handle subcategory selection
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{sub}</FormLabel>
                        </FormItem>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
```

### Pattern 6: Profile Completeness Tracking

**What:** Calculate and display profile completion status on dashboard
**When to use:** Onboarding flows, profile completion incentives
**Example:**

```typescript
// lib/profile-completeness.ts
export type ProfileSection = 'companyInfo' | 'sectors' | 'capabilities' | 'certifications' | 'projects'

export function calculateCompleteness(company: Company): {
  sections: Record<ProfileSection, boolean>
  percentage: number
  isComplete: boolean
} {
  const sections = {
    companyInfo: !!(company.name && company.country && company.size),
    sectors: !!(company.sectors && company.sectors.length > 0),
    capabilities: !!(company.capabilityDescription && company.capabilityTags?.length > 0),
    certifications: !!(company.certifications && company.certifications.length > 0),
    projects: !!(company.projects && company.projects.length >= 1),
  }

  const completed = Object.values(sections).filter(Boolean).length
  const total = Object.keys(sections).length
  const percentage = Math.round((completed / total) * 100)

  return {
    sections,
    percentage,
    isComplete: percentage === 100,
  }
}

// components/profile/completeness-card.tsx
import { calculateCompleteness } from '@/lib/profile-completeness'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { CheckCircle2, Circle } from 'lucide-react'

export async function CompletenessCard() {
  const company = await getCompanyProfile()
  const { sections, percentage, isComplete } = calculateCompleteness(company)

  const sectionLabels = {
    companyInfo: 'Company Information',
    sectors: 'Industry Sectors',
    capabilities: 'Capabilities & Tags',
    certifications: 'Certifications',
    projects: 'Past Projects',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Completion</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm font-medium">{percentage}%</span>
          </div>

          <ul className="space-y-2">
            {Object.entries(sections).map(([key, completed]) => (
              <li key={key} className="flex items-center gap-2">
                {completed ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={cn(
                  'text-sm',
                  completed ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {sectionLabels[key as ProfileSection]}
                </span>
              </li>
            ))}
          </ul>

          {!isComplete && (
            <Button asChild className="w-full">
              <Link href="/dashboard/profile/wizard">
                Complete Your Profile
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

### Anti-Patterns to Avoid

- **Single Giant Form:** Don't put all 5 steps in one massive form component—split into separate step components for maintainability
- **Optimistic Updates Without Validation:** Don't save invalid data—validate before auto-saving
- **Page Reloads Between Steps:** Don't use separate routes for each step—use client-side state management
- **Ignoring field.id in useFieldArray:** Always use `key={field.id}`, never `key={index}` for dynamic arrays
- **Missing Accessibility:** Don't forget ARIA labels, focus management, and keyboard navigation in custom components
- **Hardcoded Sector Data:** Store sector definitions in database or config file, not hardcoded in components
- **No Loading States:** Always show loading/saving indicators during async operations

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tag input component | Custom input with chip UI | Emblor or shadcn community components | Accessibility (keyboard nav, screen readers), validation, autocomplete, edge cases |
| Multi-select checkboxes | Custom checkbox logic | React Hook Form Controller + Checkbox | Type safety, validation integration, proper form state management |
| Character counter | Custom onChange tracking | Controlled input with useState | Simple enough, but watch for performance with large text |
| Progress bar | Custom percentage calculation | shadcn Progress component | Accessibility, consistent styling, responsive |
| Modal forms | Custom overlay components | Radix Dialog | Focus trapping, escape key, click outside, scroll lock, accessibility |
| Form validation | Manual validation logic | Zod schemas | Type inference, reusable schemas, consistent error messages |

**Key insight:** Form UX has decades of established patterns. Libraries like React Hook Form, Radix UI, and Emblor handle edge cases (keyboard navigation, screen readers, focus management, validation timing, error messaging) that custom solutions miss. The time saved is worth the dependency.

## Common Pitfalls

### Pitfall 1: Auto-Save Race Conditions

**What goes wrong:** Multiple auto-save requests fire simultaneously, creating race conditions where older data overwrites newer data, or duplicate database writes cause conflicts.

**Why it happens:** React Hook Form's watch() fires on every change, and onBlur events can overlap with onChange events if not properly controlled.

**How to avoid:**
1. Use debouncing for auto-save (200-500ms typical)
2. Implement request deduplication or cancellation
3. Use optimistic UI updates with rollback on error
4. Add loading states to prevent user confusion
5. Consider using `mode: 'onBlur'` instead of watching all changes

**Warning signs:**
- Data reverting to old values after edits
- Multiple database writes in network tab
- Spinner constantly showing during typing
- Form fields jumping or losing focus

**Code example:**
```typescript
import { useDebouncedCallback } from 'use-debounce'

const debouncedSave = useDebouncedCallback(
  async (data) => {
    await saveCompanyInfo(data)
  },
  500 // Wait 500ms after last change
)

useEffect(() => {
  const subscription = watch((value) => {
    debouncedSave(value.companyInfo)
  })
  return () => subscription.unsubscribe()
}, [watch, debouncedSave])
```

### Pitfall 2: Wizard State Loss on Refresh

**What goes wrong:** User refreshes browser mid-wizard and loses all progress, or navigates away and data is gone.

**Why it happens:** Wizard state (currentStep, form data) only exists in React state, not persisted to database or localStorage.

**How to avoid:**
1. Auto-save each step's data to database on blur/change
2. Store currentStep in URL query param or localStorage
3. Load existing data on mount to resume wizard
4. Show "draft saved" indicators for user confidence
5. Consider adding a "Save & Exit" button explicitly

**Warning signs:**
- Users complaining about lost data
- No way to resume wizard from where they left off
- Empty form after browser refresh

**Code example:**
```typescript
// Persist step in URL
const router = useRouter()
const searchParams = useSearchParams()
const [currentStep, setCurrentStep] = useState(
  Number(searchParams.get('step')) || 0
)

useEffect(() => {
  router.push(`?step=${currentStep}`, { scroll: false })
}, [currentStep])

// Load existing data on mount
useEffect(() => {
  async function loadProfile() {
    const profile = await getCompanyProfile()
    if (profile) {
      form.reset(profile) // Populate form with existing data
    }
  }
  loadProfile()
}, [])
```

### Pitfall 3: Checkbox Group Validation Issues

**What goes wrong:** Validation doesn't work correctly for checkbox groups—either doesn't validate at all, or shows errors incorrectly, or doesn't clear errors after selection.

**Why it happens:** React Hook Form handles checkbox groups differently than other inputs, requiring special Controller usage or custom validation logic.

**How to avoid:**
1. Use Controller component for checkbox groups, not register
2. Validate the array value, not individual checkboxes
3. Use Zod's `.min(1)` for "at least one required" validation
4. Set validation mode to 'onChange' for immediate feedback
5. Use field arrays for dynamic checkbox lists

**Warning signs:**
- "Select at least one" validation not firing
- Error message not clearing after selection
- TypeScript errors with checkbox field types

**Code example:**
```typescript
// Zod schema
const sectorSchema = z.object({
  sectors: z.array(z.string()).min(1, 'Select at least one sector'),
})

// Component
<FormField
  control={form.control}
  name="sectors"
  render={({ field }) => (
    <FormItem>
      {SECTOR_OPTIONS.map((sector) => (
        <FormItem key={sector.value}>
          <FormControl>
            <Checkbox
              checked={field.value?.includes(sector.value)}
              onCheckedChange={(checked) => {
                return checked
                  ? field.onChange([...field.value, sector.value])
                  : field.onChange(field.value?.filter((value) => value !== sector.value))
              }}
            />
          </FormControl>
          <FormLabel>{sector.label}</FormLabel>
        </FormItem>
      ))}
      <FormMessage />
    </FormItem>
  )}
/>
```

### Pitfall 4: useFieldArray Key Prop Issues

**What goes wrong:** Adding or removing items from dynamic lists causes React rendering errors, lost input focus, or form state corruption.

**Why it happens:** Using array index as key instead of field.id causes React to incorrectly reconcile components when items are added/removed.

**How to avoid:**
1. Always use `key={field.id}` for field array items
2. Never use `key={index}` even though it's tempting
3. Don't stack append/remove operations in same handler
4. Use useFieldArray's built-in methods (append, remove, insert)

**Warning signs:**
- Input focus jumping to wrong field
- Data appearing in wrong inputs after add/remove
- React warnings about duplicate keys
- Form values not updating correctly

**Code example:**
```typescript
const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: 'projects',
})

return (
  <div>
    {fields.map((field, index) => (
      // ✅ CORRECT: Use field.id
      <div key={field.id}>
        <Input {...form.register(`projects.${index}.name`)} />
        <Button onClick={() => remove(index)}>Remove</Button>
      </div>

      // ❌ WRONG: Don't use index as key
      // <div key={index}>
    ))}
  </div>
)
```

### Pitfall 5: Prisma Relation Cascading Mistakes

**What goes wrong:** Deleting a company doesn't delete related projects/certifications, or orphaned records remain in database, or cascade deletes remove too much data.

**Why it happens:** Missing or incorrect `onDelete` behavior in Prisma schema relations.

**How to avoid:**
1. Define explicit `onDelete` behavior for all relations
2. Use `onDelete: Cascade` for owned children (projects, certifications)
3. Use `onDelete: SetNull` for optional references
4. Use `onDelete: Restrict` to prevent accidental deletion
5. Test deletion flows thoroughly

**Warning signs:**
- Orphaned records in database
- Foreign key constraint errors
- Data remaining after user deletion
- Accidental data loss

**Code example:**
```prisma
model Company {
  id             String          @id @default(cuid())
  name           String
  ownerId        String
  owner          User            @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  projects       Project[]       // Cascade handled on Project side
  certifications Certification[]
}

model Project {
  id        String  @id @default(cuid())
  name      String
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Cascade) // ✅ Delete projects when company deleted
}

model Certification {
  id        String  @id @default(cuid())
  name      String
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Cascade) // ✅ Delete certs when company deleted
}
```

## Code Examples

Verified patterns from official sources and community best practices:

### Server Action with Validation

```typescript
// actions/profile.ts
'use server'

import { z } from 'zod'
import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const companyInfoSchema = z.object({
  name: z.string().min(2, 'Company name required'),
  country: z.string().min(2, 'Country required'),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '501+']),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().max(200).optional(),
})

export async function saveCompanyInfo(data: unknown) {
  // 1. Verify authentication
  const session = await verifySession()

  // 2. Validate input
  const validatedFields = companyInfoSchema.safeParse(data)
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // 3. Save to database
  try {
    await prisma.company.upsert({
      where: { ownerId: session.userId },
      update: validatedFields.data,
      create: {
        ...validatedFields.data,
        ownerId: session.userId,
      },
    })

    revalidatePath('/dashboard/profile')
    return { success: true }
  } catch (error) {
    return { error: 'Failed to save company information' }
  }
}
```

### Prisma Schema for Profile Data

```prisma
// prisma/schema.prisma

model Company {
  id                    String          @id @default(cuid())
  name                  String
  country               String
  size                  String          // Employee range: "1-10", "11-50", etc.
  website               String?
  description           String?         @db.Text

  // Industry sectors (multi-select)
  sectors               String[]        // ["IT", "Construction"]
  sectorSubcategories   Json?           // { "IT": ["Cloud", "Security"], "Construction": ["Residential"] }

  // Capabilities
  capabilityDescription String?         @db.Text
  capabilityTags        String[]

  // Relations
  ownerId               String          @unique
  owner                 User            @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  certifications        Certification[]
  projects              Project[]
  bids                  Bid[]

  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt
}

model Certification {
  id          String   @id @default(cuid())
  name        String
  issuingBody String
  issueDate   DateTime
  expiryDate  DateTime?
  companyId   String
  company     Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
}

model Project {
  id             String   @id @default(cuid())
  name           String
  clientName     String
  description    String   @db.Text
  sector         String   // "IT" or "Construction"
  valueRange     String   // "€50k-€100k", "€100k-€500k", etc.
  yearCompleted  Int
  companyId      String
  company        Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  createdAt      DateTime @default(now())
}
```

### Loading Existing Profile Data

```typescript
// lib/dal.ts
import 'server-only'
import { cache } from 'react'
import { prisma } from './prisma'
import { verifySession } from './dal'

export const getCompanyProfile = cache(async () => {
  const session = await verifySession()

  const company = await prisma.company.findUnique({
    where: { ownerId: session.userId },
    include: {
      certifications: true,
      projects: {
        orderBy: { yearCompleted: 'desc' },
      },
    },
  })

  return company
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Multi-page wizards (separate routes) | Single-page with client state | ~2020 | Better UX, no page reloads, simpler state management |
| Manual tag input | Emblor/shadcn community components | 2024+ | Accessibility, keyboard support, autocomplete |
| Formik + Yup | React Hook Form + Zod | 2021+ | Better performance, smaller bundle, TypeScript inference |
| Custom modal implementations | Radix Dialog primitives | 2022+ | Accessibility, focus management, escape/overlay handling |
| API routes for forms | Server Actions | Next.js 13+ | Less boilerplate, type safety, better DX |
| Manual character counting | Controlled inputs with live updates | Ongoing | Real-time feedback, better UX |
| localStorage for drafts | Database auto-save | 2023+ | Cross-device access, data integrity, no storage limits |

**Deprecated/outdated:**
- **Separate routes per wizard step:** Use client-side state with single route
- **Uncontrolled forms:** Use React Hook Form's controlled components
- **Custom validation logic:** Use Zod schemas for type safety
- **Manual focus management:** Use Radix UI primitives for automatic handling
- **CSS-in-JS for form styling:** Use Tailwind v4 with @theme directive

## Open Questions

Things that couldn't be fully resolved:

1. **Certification Data Structure**
   - What we know: Should store name, issuing body, dates, but structure is Claude's discretion
   - What's unclear: Whether to use separate table (more normalized) vs JSON field (simpler for MVP)
   - Recommendation: Use separate Certification model for better queryability and validation, JSON field acceptable for quick MVP

2. **Sub-category Storage Format**
   - What we know: IT and Construction each have 3-5 sub-categories, user can multi-select
   - What's unclear: Store as JSON object `{"IT": ["Cloud", "Security"]}` or flat array with prefixes `["IT:Cloud", "IT:Security"]`
   - Recommendation: JSON object for easier querying and display grouping, matches hierarchical nature

3. **Wizard Resume Behavior**
   - What we know: Wizard should be skippable and resumable, but exact UX is unclear
   - What's unclear: Should wizard auto-advance to first incomplete step, or always start at step 1?
   - Recommendation: Start at first incomplete step for better UX, with breadcrumb navigation to jump around

4. **Profile Edit Flow**
   - What we know: After initial creation, editing happens on profile page (not wizard)
   - What's unclear: Should profile page show all sections at once, or accordion-style collapsible sections?
   - Recommendation: Accordion or tabs for better organization, all-at-once gets overwhelming with 5 sections

## Sources

### Primary (HIGH confidence)

- [React Hook Form Documentation](https://react-hook-form.com/docs/useform) - Official API documentation
- [React Hook Form useFieldArray](https://react-hook-form.com/docs/usefieldarray) - Official field array guide
- [Radix UI Dialog Documentation](https://www.radix-ui.com/primitives/docs/components/dialog) - Official Radix primitives
- [Prisma One-to-Many Relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/one-to-many-relations) - Official Prisma docs
- [Prisma Relation Queries](https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries) - Official nested writes guide
- [Next.js Forms Guide](https://nextjs.org/docs/app/guides/forms) - Official Next.js form patterns
- [Next.js Server Actions Guide](https://nextjs.org/docs/app/getting-started/updating-data) - Official Server Actions documentation
- [shadcn/ui Tailwind v4 Migration](https://ui.shadcn.com/docs/tailwind-v4) - Official Tailwind v4 compatibility

### Secondary (MEDIUM confidence)

- [Build a Multistep Form With React Hook Form | ClarityDev](https://claritydev.net/blog/build-a-multistep-form-with-react-hook-form) - Community tutorial
- [Emblor - Tag Input Component](https://github.com/JaleelB/emblor) - Community component library
- [Building an Enterprise-Grade Tags Input Component with ShadCN UI](https://dev.to/muhammadaqib86/building-an-enterprise-grade-tags-input-component-with-shadcn-ui-react-39la) - Community guide
- [Using react-hook-form with React 19 and Next.js 15](https://markus.oberlehner.net/blog/using-react-hook-form-with-react-19-use-action-state-and-next-js-15-app-router/) - Community integration guide
- [Submitting a form in Next.js 14 with onBlur, server actions, and validation](https://dev.to/orionseven/submitting-a-form-in-nextjs-14-with-onblur-server-actions-and-validation-55dl) - Community auto-save pattern
- [How to Build Multi-Step Form with Progress Stepper in React](https://www.flexyui.com/blogs/react-multi-step-form) - Community tutorial

### Tertiary (LOW confidence)

- Various Medium articles on multi-step forms (patterns vary, verify against official docs)
- WebSearch results for character counters (simple enough to verify through implementation)
- Community discussions on checkbox validation (pre-2023, patterns may have evolved)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project, verified compatibility with Tailwind v4 and Next.js 16
- Architecture: HIGH - Patterns from official React Hook Form, Radix UI, and Next.js documentation
- Pitfalls: HIGH - Common issues documented in GitHub issues, official warnings, and community articles
- Code examples: HIGH - Synthesized from official docs and verified community patterns

**Research date:** 2026-02-07
**Valid until:** 2026-04-07 (60 days - stable ecosystem, established patterns)

**Implementation notes:**
- No breaking changes expected in stack components
- Emblor is the only recommended new dependency
- All patterns compatible with existing Phase 1 implementation
- Tailwind v4 fully supported by shadcn/ui as of 2026
