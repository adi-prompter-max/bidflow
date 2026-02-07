"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function TenderFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === "" || value === undefined) {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    router.replace(`/dashboard/tenders?${params.toString()}`, {
      scroll: false,
    })
  }

  const clearAllFilters = () => {
    router.replace("/dashboard/tenders", { scroll: false })
  }

  // Calculate active filter count
  const activeFilters = Array.from(searchParams.entries()).filter(
    ([key]) => key !== "sort"
  ).length

  const sector = searchParams.get("sector") || ""
  const minValue = searchParams.get("minValue") || ""
  const maxValue = searchParams.get("maxValue") || ""
  const deadline = searchParams.get("deadline") || ""

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium">Filters</h3>
        {activeFilters > 0 && (
          <Badge variant="secondary" className="text-xs">
            {activeFilters}
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        {/* Sector filter */}
        <div className="w-[200px]">
          <Select value={sector} onValueChange={(value) => updateFilter("sector", value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Sectors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Sectors</SelectItem>
              <SelectItem value="IT">IT</SelectItem>
              <SelectItem value="Construction">Construction</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Min value filter */}
        <div className="w-[200px]">
          <Input
            type="number"
            placeholder="Min value (EUR)"
            value={minValue}
            onChange={(e) => updateFilter("minValue", e.target.value)}
            onBlur={(e) => updateFilter("minValue", e.target.value)}
          />
        </div>

        {/* Max value filter */}
        <div className="w-[200px]">
          <Input
            type="number"
            placeholder="Max value (EUR)"
            value={maxValue}
            onChange={(e) => updateFilter("maxValue", e.target.value)}
            onBlur={(e) => updateFilter("maxValue", e.target.value)}
          />
        </div>

        {/* Deadline filter */}
        <div className="w-[200px]">
          <div className="space-y-1.5">
            <label htmlFor="deadline" className="text-xs text-muted-foreground">
              Deadline after
            </label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => updateFilter("deadline", e.target.value)}
            />
          </div>
        </div>

        {/* Clear all button */}
        {activeFilters > 0 && (
          <Button
            variant="outline"
            size="default"
            onClick={clearAllFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}
