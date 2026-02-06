import { verifySession, getUser } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  // Verify session - redirects to /login if not authenticated
  await verifySession()

  // Get current user details
  const user = await getUser()

  // Fetch summary statistics
  const [tenderCount, bidCount] = await Promise.all([
    prisma.tender.count({ where: { status: 'OPEN' } }),
    prisma.bid.count(),
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
        <Card>
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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Company Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Complete your company profile to start bidding
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Coming in Phase 2
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
