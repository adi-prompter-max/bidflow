'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { saveSectors } from '@/actions/profile'
import {
  IT_SUBCATEGORIES,
  CONSTRUCTION_SUBCATEGORIES,
} from '@/lib/validations/profile'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { CheckCircle2 } from 'lucide-react'
import type { Company, Certification, Project } from '@prisma/client'

type CompanyProfile = (Company & {
  certifications: Certification[]
  projects: Project[]
}) | null

interface StepSectorsProps {
  initialData: CompanyProfile
}

type SectorKey = 'IT' | 'Construction'

export function StepSectors({ initialData }: StepSectorsProps) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [error, setError] = useState<string | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Initialize state from initial data
  const [selectedSectors, setSelectedSectors] = useState<SectorKey[]>(
    (initialData?.sectors || []) as SectorKey[]
  )
  const [selectedSubcategories, setSelectedSubcategories] = useState<
    Record<string, string[]>
  >(() => {
    const subs = initialData?.sectorSubcategories
    if (subs && typeof subs === 'object' && !Array.isArray(subs)) {
      return subs as Record<string, string[]>
    }
    return {}
  })

  // Debounced auto-save function
  const debouncedSave = useCallback(() => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(async () => {
      // Validate at least 1 sector selected
      if (selectedSectors.length === 0) {
        setError('Select at least one sector')
        return
      }

      setError(null)
      setSaveStatus('saving')

      const result = await saveSectors({
        sectors: selectedSectors,
        sectorSubcategories: selectedSubcategories,
      })

      if (result.success) {
        setSaveStatus('saved')
        // Reset to idle after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        setSaveStatus('idle')
        if (result.message) {
          setError(result.message)
        }
      }
    }, 500)
  }, [selectedSectors, selectedSubcategories])

  // Trigger save when selections change
  useEffect(() => {
    debouncedSave()
  }, [selectedSectors, selectedSubcategories, debouncedSave])

  const handleSectorToggle = (sector: SectorKey) => {
    setSelectedSectors((prev) => {
      if (prev.includes(sector)) {
        // Deselecting - remove sector and its subcategories
        const newSectors = prev.filter((s) => s !== sector)
        setSelectedSubcategories((prevSubs) => {
          const newSubs = { ...prevSubs }
          delete newSubs[sector]
          return newSubs
        })
        return newSectors
      } else {
        // Selecting - add sector
        return [...prev, sector]
      }
    })
  }

  const handleSubcategoryToggle = (sector: SectorKey, subcategory: string) => {
    setSelectedSubcategories((prev) => {
      const current = prev[sector] || []
      const newSubcats = current.includes(subcategory)
        ? current.filter((s) => s !== subcategory)
        : [...current, subcategory]

      return {
        ...prev,
        [sector]: newSubcats,
      }
    })
  }

  const isSectorSelected = (sector: SectorKey) => selectedSectors.includes(sector)
  const isSubcategorySelected = (sector: SectorKey, subcategory: string) =>
    (selectedSubcategories[sector] || []).includes(subcategory)

  return (
    <div className="p-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Industry Sectors</h2>
          <p className="text-muted-foreground">
            Select the sectors your company operates in. Changes are saved automatically.
          </p>
        </div>

        {saveStatus === 'saved' && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Saved</span>
          </div>
        )}

        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}

        <div className="space-y-6">
          {/* IT Sector */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sector-it"
                checked={isSectorSelected('IT')}
                onCheckedChange={() => handleSectorToggle('IT')}
              />
              <Label
                htmlFor="sector-it"
                className="text-base font-medium cursor-pointer"
              >
                IT & Software
              </Label>
            </div>

            {isSectorSelected('IT') && (
              <div className="ml-8 space-y-3 border-l-2 border-muted pl-4">
                {IT_SUBCATEGORIES.map((subcat) => (
                  <div key={subcat} className="flex items-center space-x-2">
                    <Checkbox
                      id={`it-${subcat}`}
                      checked={isSubcategorySelected('IT', subcat)}
                      onCheckedChange={() => handleSubcategoryToggle('IT', subcat)}
                    />
                    <Label
                      htmlFor={`it-${subcat}`}
                      className="text-sm cursor-pointer"
                    >
                      {subcat}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Construction Sector */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sector-construction"
                checked={isSectorSelected('Construction')}
                onCheckedChange={() => handleSectorToggle('Construction')}
              />
              <Label
                htmlFor="sector-construction"
                className="text-base font-medium cursor-pointer"
              >
                Construction
              </Label>
            </div>

            {isSectorSelected('Construction') && (
              <div className="ml-8 space-y-3 border-l-2 border-muted pl-4">
                {CONSTRUCTION_SUBCATEGORIES.map((subcat) => (
                  <div key={subcat} className="flex items-center space-x-2">
                    <Checkbox
                      id={`construction-${subcat}`}
                      checked={isSubcategorySelected('Construction', subcat)}
                      onCheckedChange={() =>
                        handleSubcategoryToggle('Construction', subcat)
                      }
                    />
                    <Label
                      htmlFor={`construction-${subcat}`}
                      className="text-sm cursor-pointer"
                    >
                      {subcat}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
