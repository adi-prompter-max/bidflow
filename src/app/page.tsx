import { auth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function Home() {
  const session = await auth()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            BidFlow
          </h1>
          <p className="text-xl text-muted-foreground">
            Win more tenders. Spend less time on paperwork.
          </p>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            AI-powered bid generation platform for SMEs competing in EU public procurement.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {session?.user ? (
            <Button asChild size="lg">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg">
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Sign In</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
