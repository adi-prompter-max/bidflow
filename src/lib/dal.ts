import 'server-only'

import { cache } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const verifySession = cache(async () => {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  return { isAuth: true, userId: session.user.id }
})

export const getUser = cache(async () => {
  const session = await verifySession()

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true
      // NEVER include password
    },
  })

  return user
})

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}
