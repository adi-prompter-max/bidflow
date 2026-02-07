import { verifySession, getUser } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CompletenessCard } from '@/components/profile/completeness-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, FileEdit } from 'lucide-react'

export default async function DashboardPage() {
  // Verify session - redirects to /login if not authenticated
  await verifySession()

  // Get current user details
  const user = await getUser()

  // Get user's company
  const company = await prisma.company.findUnique({
    where: { ownerId: user?.id || '' },
  })

  // Fetch summary statistics
  const [tenderCount, bidCount, activeBidsCount] = await Promise.all([
    prisma.tender.count({ where: { status: 'OPEN' } }),
    prisma.bid.count(),
    company
      ? prisma.bid.count({
          where: {
            companyId: company.id,
            status: { in: ['DRAFT', 'IN_REVIEW'] },
          },
        })
      : Promise.resolve(0),
  ])

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.name || 'User'}
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's an overview of your bidding activity
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/tenders" className="block">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Open Tenders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{tenderCount}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Available opportunities
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/tenders" className="block">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <FileEdit className="h-4 w-4" />
                Active Bids
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeBidsCount}</div>
              <p className="text-sm text-muted-foreground mt-1">
                In progress or under review
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Your Bids</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{bidCount}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Total bids created
            </p>
          </CardContent>
        </Card>

        <CompletenessCard />
      </div>

      {/* Browse Tenders CTA */}
      <div className="mt-8">
        <Button asChild size="lg">
          <Link href="/dashboard/tenders">
            Browse Tenders
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
