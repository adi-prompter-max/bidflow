import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isOnAuth = nextUrl.pathname === '/login' || nextUrl.pathname === '/signup'

      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isOnAuth) {
        if (isLoggedIn) return Response.redirect(new URL('/dashboard', nextUrl))
        return true
      }
      return true // Allow public routes
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(8)
          })
          .safeParse(credentials)

        if (!parsedCredentials.success) return null

        const { email, password } = parsedCredentials.data

        // Look up user by email using Prisma directly
        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user) return null

        // Compare password with bcryptjs
        const passwordsMatch = await bcrypt.compare(password, user.password)

        if (!passwordsMatch) return null

        // Return user object (id, name, email) on success
        return {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      },
    }),
  ],
} satisfies NextAuthConfig
