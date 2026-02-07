# Phase 3: Tender Discovery - Research

**Researched:** 2026-02-07
**Domain:** Data table with filtering, sorting, and relevance scoring
**Confidence:** HIGH

## Summary

Phase 3 implements a tender discovery interface with list view, filtering capabilities, relevance scoring, and detail views. The standard approach in Next.js 15+ with shadcn/ui is to use TanStack Table (formerly React Table) as a headless UI library paired with shadcn/ui components, implementing server-side filtering via URL search parameters for shareable, bookmarkable views.

The architecture follows a hybrid pattern: Server Components fetch and filter initial data based on URL search params, while Client Components handle interactive UI (sorting headers, filter controls) and update the URL. This provides excellent initial load performance, SEO benefits, and smooth client-side interactivity without page reloads.

For relevance scoring, a weighted scoring algorithm matches tender attributes (sector, value, requirements) against company profile data, using simple TypeScript calculations rather than external libraries. Mock data generation uses @faker-js/faker integrated with Prisma seed scripts for realistic test data.

**Primary recommendation:** Use TanStack Table v8 with shadcn/ui Table component, implement server-side filtering via URL search params, calculate relevance scores server-side using weighted matching algorithm, and seed database with faker-generated mock tenders.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/react-table | ^8.x | Headless table logic (sorting, filtering, pagination) | Industry standard for complex tables, framework-agnostic core, excellent TypeScript support |
| shadcn/ui Table | latest | Accessible table UI primitives | Integrates seamlessly with TanStack Table, unstyled/customizable |
| date-fns | ^4.1.0 | Date formatting and manipulation | Already in project, modern alternative to moment.js, tree-shakeable |
| Zod | ^4.x | Schema validation for filters | Already in project, type-safe validation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @faker-js/faker | ^9.x | Mock data generation | Prisma seed scripts for realistic tender data |
| nuqs | ^2.x (optional) | Type-safe search param state | Advanced search param management (optional upgrade from manual URLSearchParams) |
| lucide-react | ^0.563.0 | Icons for filters, badges, empty states | Already in project |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| TanStack Table | Manual table with state | TanStack provides battle-tested sorting/filtering logic, manual approach error-prone |
| URL search params | Client-side state | URL params enable sharing/bookmarking, better for server-side rendering |
| Custom scoring | ML library | Simple weighted scoring sufficient for MVP, ML overkill and adds complexity |

**Installation:**
```bash
npm install @tanstack/react-table
npm install --save-dev @faker-js/faker
# Optional: npm install nuqs
```

## Architecture Patterns

### Recommended Project Structure
```
src/app/dashboard/tenders/
├── page.tsx                    # Server Component - fetches filtered data
├── components/
│   ├── tender-table.tsx        # Client Component - TanStack Table wrapper
│   ├── tender-filters.tsx      # Client Component - filter controls
│   ├── tender-columns.tsx      # Column definitions
│   └── tender-empty-state.tsx  # Empty state when no results
├── [id]/
│   └── page.tsx                # Tender detail page (Server Component)
src/lib/
├── tenders/
│   ├── queries.ts              # Prisma queries with filtering
│   ├── scoring.ts              # Relevance scoring algorithm
│   └── filters.ts              # Filter type definitions & validation
prisma/
├── seed.ts                     # Seed script entry point
└── seeders/
    └── tenders.ts              # Tender data generation with Faker
```

### Pattern 1: Server Component with URL Search Params
**What:** Main page receives searchParams prop, fetches filtered data server-side
**When to use:** All list pages with filtering/sorting/pagination
**Example:**
```typescript
// Source: https://nextjs.org/learn/dashboard-app/adding-search-and-pagination
// src/app/dashboard/tenders/page.tsx
import { getTenders } from '@/lib/tenders/queries';
import { TenderTable } from './components/tender-table';
import { TenderFilters } from './components/tender-filters';

export default async function TendersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const filters = {
    sector: params.sector as string | undefined,
    minValue: params.minValue ? Number(params.minValue) : undefined,
    maxValue: params.maxValue ? Number(params.maxValue) : undefined,
    deadline: params.deadline as string | undefined,
  };

  const tenders = await getTenders(filters);

  return (
    <div>
      <TenderFilters />
      <TenderTable data={tenders} />
    </div>
  );
}
```

### Pattern 2: Client-Side Filter Updates via URL
**What:** Filter controls update URL search params using useRouter and useSearchParams
**When to use:** Interactive filter controls that need to preserve state in URL
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/use-search-params
'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function TenderFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`/dashboard/tenders?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex gap-4">
      <Select onValueChange={(v) => updateFilter('sector', v)}>
        {/* sector options */}
      </Select>
      {/* other filters */}
    </div>
  );
}
```

### Pattern 3: TanStack Table with Column Definitions
**What:** Separate column definitions from table component, use flexRender for cells
**When to use:** All data tables requiring sorting, filtering, or custom cell rendering
**Example:**
```typescript
// Source: https://ui.shadcn.com/docs/components/radix/data-table
// src/app/dashboard/tenders/components/tender-columns.tsx
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export const tenderColumns: ColumnDef<Tender>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'sector',
    header: 'Sector',
    cell: ({ row }) => <Badge>{row.getValue('sector')}</Badge>,
  },
  {
    accessorKey: 'value',
    header: 'Estimated Value',
    cell: ({ row }) => {
      const value = row.getValue('value') as number;
      return `€${value.toLocaleString()}`;
    },
  },
  {
    accessorKey: 'deadline',
    header: 'Deadline',
    cell: ({ row }) => format(row.getValue('deadline'), 'MMM dd, yyyy'),
  },
  {
    accessorKey: 'relevanceScore',
    header: 'Relevance',
    cell: ({ row }) => {
      const score = row.getValue('relevanceScore') as number;
      return `${Math.round(score)}%`;
    },
  },
];
```

### Pattern 4: Prisma Filtering with Type-Safe Parameters
**What:** Build where clauses dynamically based on filter parameters
**When to use:** Server-side data fetching with optional filters
**Example:**
```typescript
// Source: https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting
// src/lib/tenders/queries.ts
import { prisma } from '@/lib/prisma';
import { calculateRelevanceScore } from './scoring';

export async function getTenders(filters: TenderFilters, userId: string) {
  const where: Prisma.TenderWhereInput = {
    status: 'OPEN',
    ...(filters.sector && { sector: filters.sector }),
    ...(filters.minValue && { value: { gte: filters.minValue } }),
    ...(filters.maxValue && { value: { lte: filters.maxValue } }),
    ...(filters.deadline && {
      deadline: { gte: new Date(filters.deadline) },
    }),
  };

  const tenders = await prisma.tender.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  // Calculate relevance scores
  const company = await prisma.company.findUnique({
    where: { ownerId: userId },
  });

  return tenders.map(tender => ({
    ...tender,
    relevanceScore: calculateRelevanceScore(tender, company),
  }));
}
```

### Pattern 5: Weighted Relevance Scoring
**What:** Calculate match percentage using weighted criteria (sector, value range, tags)
**When to use:** Matching items against user profile/preferences
**Example:**
```typescript
// Source: https://productschool.com/blog/product-fundamentals/weighted-scoring-model
// src/lib/tenders/scoring.ts
export function calculateRelevanceScore(
  tender: Tender,
  company: Company | null
): number {
  if (!company) return 0;

  let score = 0;
  const weights = {
    sector: 40,        // 40% weight
    value: 20,         // 20% weight
    tags: 40,          // 40% weight
  };

  // Sector match
  if (company.sectors.includes(tender.sector)) {
    score += weights.sector;
  }

  // Value range match (company's typical project size)
  const companyAvgValue = calculateAverageProjectValue(company);
  const valueDiff = Math.abs(tender.value - companyAvgValue) / companyAvgValue;
  if (valueDiff < 0.5) {
    score += weights.value;
  } else if (valueDiff < 1.0) {
    score += weights.value * 0.5;
  }

  // Capability tags overlap
  const tenderTags = extractTenderTags(tender);
  const matchingTags = company.capabilityTags.filter(tag =>
    tenderTags.includes(tag)
  );
  const tagMatchRatio = matchingTags.length / Math.max(tenderTags.length, 1);
  score += weights.tags * tagMatchRatio;

  return Math.min(score, 100);
}
```

### Pattern 6: Faker-Based Seed Data
**What:** Generate realistic mock tenders using Faker.js in Prisma seed script
**When to use:** Populating development/test database with realistic data
**Example:**
```typescript
// Source: https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding
// prisma/seeders/tenders.ts
import { faker } from '@faker-js/faker';
import { prisma } from '../client';

const SECTORS = ['IT', 'Construction'];
const IT_TAGS = ['Cloud Services', 'Cybersecurity', 'Software Development'];
const CONSTRUCTION_TAGS = ['Renovation', 'New Build', 'Infrastructure'];

export async function seedTenders(count: number = 50) {
  const tenders = [];

  for (let i = 0; i < count; i++) {
    const sector = faker.helpers.arrayElement(SECTORS);
    const tags = sector === 'IT' ? IT_TAGS : CONSTRUCTION_TAGS;

    tenders.push({
      title: faker.company.catchPhrase(),
      description: faker.lorem.paragraphs(3),
      sector,
      value: faker.number.int({ min: 10000, max: 5000000 }),
      deadline: faker.date.future({ years: 1 }),
      source: 'TED',
      status: 'OPEN',
      requirements: JSON.stringify({
        tags: faker.helpers.arrayElements(tags, { min: 1, max: 3 }),
        experience: faker.number.int({ min: 1, max: 10 }),
      }),
    });
  }

  await prisma.tender.createMany({
    data: tenders,
    skipDuplicates: true,
  });
}
```

### Anti-Patterns to Avoid
- **Client-side filtering of large datasets:** Fetches all data then filters in browser, slow and breaks pagination
- **Hardcoded filter values in components:** Makes filters brittle, use URL as single source of truth
- **Mutating table data in place:** Causes infinite re-renders with TanStack Table, always use stable references
- **Blocking database queries in seed scripts:** Use createMany() instead of individual create() calls for performance
- **Over-engineering relevance scoring:** Simple weighted scoring beats complex ML for MVP, avoid premature optimization

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Table sorting/filtering logic | Custom useState with sort functions | TanStack Table | Handles edge cases (multi-column sort, type-aware sorting, stable sort), battle-tested |
| URL search param management | Manual URLSearchParams manipulation | Next.js useSearchParams + useRouter (or nuqs for advanced) | Handles encoding, arrays, type coercion, hydration issues |
| Date range filtering UI | Custom date inputs | shadcn/ui Input with date-fns parsing | Accessibility, keyboard navigation, validation built-in |
| Mock data generation | Hardcoded fixtures | @faker-js/faker | Generates realistic, varied data with localization support |
| Relevance scoring | String similarity algorithms | Simple weighted scoring | For MVP, weighted criteria (sector match, tag overlap) sufficient and transparent |
| Empty state components | Div with centered text | shadcn/ui Empty component | Consistent styling, accessibility, icon support |

**Key insight:** Data tables have numerous edge cases (empty states, loading states, sorting stability, filter combinations, pagination boundaries). TanStack Table + shadcn/ui handle these professionally, letting you focus on business logic (relevance scoring, filter criteria) rather than table plumbing.

## Common Pitfalls

### Pitfall 1: Unstable Data/Column References in TanStack Table
**What goes wrong:** Defining data or columns inside component scope causes infinite re-render loop
**Why it happens:** React re-creates arrays on every render, TanStack Table detects change, triggers re-render
**How to avoid:** Use useMemo for columns and data, or define columns outside component
**Warning signs:** Browser freezes, React DevTools shows hundreds of renders, useReactTable hook in call stack

```typescript
// BAD: Causes infinite loop
function TenderTable({ tenders }: { tenders: Tender[] }) {
  const columns = [/* column defs */]; // Re-created every render!
  const table = useReactTable({ data: tenders, columns });
  // ...
}

// GOOD: Stable reference
const tenderColumns = [/* column defs */]; // Outside component

function TenderTable({ tenders }: { tenders: Tender[] }) {
  const table = useReactTable({ data: tenders, columns: tenderColumns });
  // ...
}
```

### Pitfall 2: useSearchParams Without Suspense Boundary
**What goes wrong:** "useSearchParams() should be wrapped in a Suspense boundary" error in production
**Why it happens:** Search params only available client-side during static rendering, causes hydration mismatch
**How to avoid:** Wrap components using useSearchParams in Suspense boundary, or use in deeply nested client components
**Warning signs:** Error in production but not development, hydration mismatch warnings

```typescript
// BAD: Direct use in layout/page
export default function TendersPage() {
  return <TenderFilters />; // Uses useSearchParams internally
}

// GOOD: Suspense boundary
import { Suspense } from 'react';

export default function TendersPage() {
  return (
    <Suspense fallback={<div>Loading filters...</div>}>
      <TenderFilters />
    </Suspense>
  );
}
```

### Pitfall 3: Forgetting to Revalidate After Mutations
**What goes wrong:** Tender list doesn't update after user saves a bid or marks tender as favorite
**Why it happens:** Next.js caches server component data, mutations don't auto-invalidate cache
**How to avoid:** Call revalidatePath() in server actions after mutations
**Warning signs:** Users report stale data, refresh fixes issue, cache headers show long TTL

```typescript
// src/app/actions/bids.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function saveBid(formData: FormData) {
  // ... save bid logic
  revalidatePath('/dashboard/tenders'); // Refresh tender list
  revalidatePath(`/dashboard/tenders/${tenderId}`); // Refresh detail page
}
```

### Pitfall 4: Date Filtering Timezone Issues
**What goes wrong:** Deadline filter shows wrong tenders (off by one day) for some users
**Why it happens:** Date parsing assumes local timezone, database stores UTC, comparison mismatched
**How to avoid:** Parse dates in UTC, compare apples-to-apples, use date-fns/utc or explicit timezone handling
**Warning signs:** Bug reports from users in different timezones, edge-case failures at midnight

```typescript
// BAD: Timezone ambiguity
const deadline = new Date(params.deadline); // Parses in local timezone
where: { deadline: { gte: deadline } }

// GOOD: Explicit UTC handling
import { startOfDay, endOfDay } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

const deadlineDate = startOfDay(new Date(params.deadline));
where: { deadline: { gte: deadlineDate } }
```

### Pitfall 5: Exposing Sensitive Data to Client Components
**What goes wrong:** Server-side relevance scoring logic or company financial data leaks to client bundle
**Why it happens:** Importing server-only code in client component, Next.js bundles it for browser
**How to avoid:** Keep scoring logic in separate server-only file, only pass final score to client
**Warning signs:** Large client bundle size, console errors about server-only modules, secrets in browser devtools

```typescript
// BAD: Imports scoring logic in client component
'use client';
import { calculateRelevanceScore } from '@/lib/tenders/scoring'; // Bundles for client!

// GOOD: Server component calculates, client receives result
// Server Component (page.tsx)
const tenders = await getTenders(); // Includes pre-calculated relevanceScore
return <TenderTable data={tenders} />;

// Client Component (tender-table.tsx)
'use client';
export function TenderTable({ data }: { data: TenderWithScore[] }) {
  // Only renders score, doesn't calculate
}
```

### Pitfall 6: Poor Empty State UX
**What goes wrong:** Users see blank page when filters return no results, think app is broken
**Why it happens:** Conditional rendering shows table only when data exists, no feedback otherwise
**How to avoid:** Always render table structure, show Empty component when no data
**Warning signs:** Support tickets about "broken search", users don't realize filters are too restrictive

```typescript
// BAD: Disappearing table
{tenders.length > 0 && <TenderTable data={tenders} />}

// GOOD: Always visible with empty state
<TenderTable
  data={tenders}
  emptyState={
    <Empty>
      <EmptyTitle>No tenders found</EmptyTitle>
      <EmptyDescription>
        Try adjusting your filters or check back later for new opportunities.
      </EmptyDescription>
    </Empty>
  }
/>
```

## Code Examples

Verified patterns from official sources:

### Server Component with Filtering
```typescript
// Source: https://nextjs.org/learn/dashboard-app/adding-search-and-pagination
// src/app/dashboard/tenders/page.tsx
import { Suspense } from 'react';
import { getTenders } from '@/lib/tenders/queries';
import { verifySession } from '@/lib/dal';
import { TenderTable } from './components/tender-table';
import { TenderFilters } from './components/tender-filters';
import { TenderTableSkeleton } from './components/tender-table-skeleton';

export default async function TendersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await verifySession();
  const params = await searchParams;

  const filters = {
    sector: params.sector as string | undefined,
    minValue: params.minValue ? Number(params.minValue) : undefined,
    maxValue: params.maxValue ? Number(params.maxValue) : undefined,
    deadline: params.deadline as string | undefined,
  };

  const tenders = await getTenders(filters, session.userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tender Opportunities</h1>
        <p className="text-muted-foreground">
          Discover tenders matched to your company profile
        </p>
      </div>

      <Suspense fallback={<div>Loading filters...</div>}>
        <TenderFilters />
      </Suspense>

      <Suspense fallback={<TenderTableSkeleton />}>
        <TenderTable data={tenders} />
      </Suspense>
    </div>
  );
}
```

### Prisma Query with Filters
```typescript
// Source: https://www.basedash.com/blog/how-to-filter-on-date-ranges-in-prisma
// src/lib/tenders/queries.ts
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { calculateRelevanceScore } from './scoring';

export type TenderFilters = {
  sector?: string;
  minValue?: number;
  maxValue?: number;
  deadline?: string;
};

export async function getTenders(
  filters: TenderFilters,
  userId: string
) {
  // Build where clause dynamically
  const where: Prisma.TenderWhereInput = {
    status: 'OPEN',
  };

  if (filters.sector) {
    where.sector = filters.sector;
  }

  if (filters.minValue || filters.maxValue) {
    where.value = {
      ...(filters.minValue && { gte: filters.minValue }),
      ...(filters.maxValue && { lte: filters.maxValue }),
    };
  }

  if (filters.deadline) {
    where.deadline = {
      gte: new Date(filters.deadline),
    };
  }

  // Fetch tenders
  const tenders = await prisma.tender.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  // Get user's company for relevance scoring
  const company = await prisma.company.findUnique({
    where: { ownerId: userId },
    include: {
      projects: true,
      certifications: true,
    },
  });

  // Add relevance scores
  return tenders.map(tender => ({
    ...tender,
    relevanceScore: calculateRelevanceScore(tender, company),
  }));
}
```

### TanStack Table Implementation
```typescript
// Source: https://ui.shadcn.com/docs/components/radix/data-table
// src/app/dashboard/tenders/components/tender-table.tsx
'use client';

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { tenderColumns } from './tender-columns';

export function TenderTable({ data }: { data: TenderWithScore[] }) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'relevanceScore', desc: true }, // Default sort by relevance
  ]);

  const table = useReactTable({
    data,
    columns: tenderColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={tenderColumns.length} className="h-24 text-center">
                No tenders found matching your criteria.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-side filtering with useEffect | Server-side filtering via URL search params | Next.js 13+ App Router (2023) | Better SEO, faster initial load, shareable URLs |
| React Table v7 | TanStack Table v8 | 2022 | Full TypeScript rewrite, framework-agnostic, better performance |
| Manual table state management | TanStack Table headless hooks | 2020+ | Abstracts complex logic (sorting, filtering), fewer bugs |
| Moment.js for dates | date-fns | 2020+ | Tree-shakeable, smaller bundle, immutable by default |
| Hardcoded seed data | Faker.js generated data | Ongoing best practice | More realistic testing, less maintenance |

**Deprecated/outdated:**
- **React Table v7:** Replaced by TanStack Table v8 (rebranded), use @tanstack/react-table package
- **Pages Router data fetching patterns:** getServerSideProps replaced by async Server Components in App Router
- **Client-side filter state (useState):** URL search params now standard for shareable state

## Open Questions

Things that couldn't be fully resolved:

1. **Multi-select filter UI library**
   - What we know: shadcn/ui doesn't include multi-select by default, multiple community implementations exist
   - What's unclear: Which implementation is most stable/maintained, whether to use Combobox pattern or custom Select extension
   - Recommendation: Start with single-select filters for MVP, evaluate shadcn-multi-select-component or native Combobox if multi-select needed

2. **Optimal relevance scoring weights**
   - What we know: Weighted scoring works (sector, value, tags), weights should sum to 100%
   - What's unclear: Ideal weight distribution without user testing
   - Recommendation: Start with 40/20/40 (sector/value/tags), track user engagement, adjust based on which tenders users bid on

3. **Date range picker component**
   - What we know: shadcn/ui has Calendar component, no built-in date range picker
   - What's unclear: Whether to build custom range picker or use third-party
   - Recommendation: For MVP, use two separate date inputs (deadline from/to), defer fancy range picker to Phase 4+ if needed

4. **Pagination strategy**
   - What we know: TanStack Table supports pagination, can be client-side or server-side
   - What's unclear: Expected tender volume, whether to implement pagination in Phase 3
   - Recommendation: Seed 50 tenders initially, use client-side pagination (simpler), migrate to server-side if volume exceeds 200+

## Sources

### Primary (HIGH confidence)
- TanStack Table v8 Official Docs - https://tanstack.com/table/v8/docs/framework/react/react-table (table setup, API reference)
- shadcn/ui Data Table Guide - https://ui.shadcn.com/docs/components/radix/data-table (integration pattern with TanStack Table)
- Next.js Official Tutorial - https://nextjs.org/learn/dashboard-app/adding-search-and-pagination (search params pattern)
- Prisma Filtering Documentation - https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting (where clause syntax)
- Prisma Seeding Documentation - https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding (seed script setup)
- Next.js useSearchParams Docs - https://nextjs.org/docs/app/api-reference/functions/use-search-params (API reference)

### Secondary (MEDIUM confidence)
- Vercel Blog: Common App Router Mistakes - https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them (verified patterns)
- TanStack Table FAQ - https://tanstack.com/table/latest/docs/faq (unstable reference pitfall)
- Basedash: Date Range Filtering in Prisma - https://www.basedash.com/blog/how-to-filter-on-date-ranges-in-prisma (date filter examples)
- ProductSchool: Weighted Scoring Model - https://productschool.com/blog/product-fundamentals/weighted-scoring-model (scoring algorithm approach)

### Tertiary (LOW confidence)
- WebSearch: "shadcn/ui table filter sort pagination 2026" - Community implementations and patterns
- WebSearch: "TanStack Table React common mistakes pitfalls 2026" - Community-reported issues
- WebSearch: "relevance scoring algorithm user profile matching 2026" - General algorithmic approaches

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - TanStack Table and shadcn/ui are industry standard, verified with official docs
- Architecture: HIGH - Server Component + URL search params pattern is official Next.js recommendation
- Pitfalls: HIGH - All pitfalls sourced from official FAQs, Vercel blog, or documented GitHub issues
- Relevance scoring: MEDIUM - Weighted approach is standard, but specific weights need validation
- Multi-select filters: LOW - No official shadcn/ui component, community solutions vary in quality

**Research date:** 2026-02-07
**Valid until:** 2026-03-07 (30 days - stable ecosystem, Next.js 16 and TanStack Table v8 mature)
