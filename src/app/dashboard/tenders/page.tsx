import { Suspense } from "react"
import { verifySession } from "@/lib/dal"
import { getTenders } from "@/lib/tenders/queries"
import { parseFilters } from "@/lib/tenders/filters"
import { TenderTable } from "./components/tender-table"
import { TenderFilters } from "./components/tender-filters"

export default async function TendersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Await searchParams (Next.js 16 async searchParams)
  const params = await searchParams

  // Parse filters from URL
  const filters = parseFilters(params)

  // Verify session
  const session = await verifySession()

  // Fetch tenders with filters
  const tenders = await getTenders(filters, session.userId)

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tender Opportunities
          </h1>
          <p className="text-muted-foreground mt-2">
            Discover tenders matched to your company profile
          </p>
        </div>

        {/* Filters */}
        <Suspense fallback={<div className="h-24 animate-pulse bg-muted rounded-lg" />}>
          <TenderFilters />
        </Suspense>

        {/* Table */}
        <TenderTable data={tenders} />
      </div>
    </div>
  )
}
