import { auth } from '@/lib/auth'
import { logout } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export async function Header() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-10 border-b bg-white px-6 py-3">
      <div className="flex items-center justify-between">
        <Link
          href={session?.user ? '/dashboard' : '/'}
          className="text-xl font-bold text-primary hover:opacity-80 transition-opacity"
        >
          BidFlow
        </Link>

        {session?.user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session.user.name || session.user.email}
            </span>
            <form action={logout}>
              <Button variant="ghost" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        )}
      </div>
    </header>
  )
}
