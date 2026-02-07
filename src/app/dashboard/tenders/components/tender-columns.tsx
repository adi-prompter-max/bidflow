"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format, differenceInDays } from "date-fns"
import { ArrowUpDown } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TenderWithScore } from "@/lib/tenders/scoring"

// Define columns OUTSIDE component to avoid infinite re-render loop
export const tenderColumns: ColumnDef<TenderWithScore>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <Link
          href={`/dashboard/tenders/${row.original.id}`}
          className="hover:underline font-medium"
        >
          {row.getValue("title")}
        </Link>
      )
    },
  },
  {
    accessorKey: "sector",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Sector
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.getValue("sector")}</Badge>
    },
  },
  {
    accessorKey: "value",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Est. Value
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const value = row.getValue("value") as number
      return <span>EUR {value.toLocaleString()}</span>
    },
  },
  {
    accessorKey: "deadline",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Deadline
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const deadline = row.getValue("deadline") as Date
      const daysUntilDeadline = differenceInDays(deadline, new Date())

      let textColor = "text-foreground"
      if (daysUntilDeadline < 14) {
        textColor = "text-red-600"
      } else if (daysUntilDeadline < 30) {
        textColor = "text-amber-600"
      }

      return (
        <span className={textColor}>
          {format(deadline, "MMM dd, yyyy")}
        </span>
      )
    },
  },
  {
    accessorKey: "relevanceScore",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Match
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const score = row.getValue("relevanceScore") as number

      let textColor = "text-gray-600"
      if (score >= 70) {
        textColor = "text-green-600"
      } else if (score >= 40) {
        textColor = "text-amber-600"
      }

      return (
        <span className={`font-medium ${textColor}`}>
          {Math.round(score)}%
        </span>
      )
    },
  },
]
