# Phase 1: Foundation & Authentication - Research

**Researched:** 2026-02-06
**Domain:** Authentication, Session Management, Database Setup, Seed Data
**Confidence:** HIGH

## Summary

Phase 1 establishes the foundation for the TenderTrackr MVP with secure authentication using Auth.js v5 (NextAuth.js), Next.js 15 App Router, Prisma 6 ORM with PostgreSQL, and comprehensive seed data for immediate testing. The research confirms that the recommended stack (Next.js 15, Auth.js v5, Prisma 6, PostgreSQL 16, bcryptjs) represents the current best practice for 2026, with excellent TypeScript support and App Router integration.

**Key findings:**
- Auth.js v5 (NextAuth.js 5) is a major rewrite with unified configuration and simplified API
- Next.js 15 requires new authentication patterns due to App Router and React Server Components
- Session management must be implemented at both middleware (optimistic checks) and data access layer (secure checks)
- Prisma seeding should be idempotent, using upsert operations to enable safe re-runs
- Critical security vulnerability (CVE-2025-29927) requires Next.js >= 15.2.3 and defense-in-depth approach

**Primary recommendation:** Use credentials-based authentication with Auth.js v5, database sessions via Prisma adapter, stateless session cookies with encrypted JWT, and implement two-tier authorization (middleware + DAL). Never rely solely on middleware for security.

## Standard Stack

The established libraries/tools for Next.js 15 authentication in 2026:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.2.3+ | Full-stack React framework | App Router is the current architecture, >=15.2.3 required for CVE-2025-29927 fix |
| Auth.js (NextAuth.js) | 5.0.0-beta.25+ | Authentication framework | Official Next.js auth solution, supports credentials + OAuth, Prisma adapter |
| Prisma | 6.x | Database ORM | Type-safe queries, automatic migrations, excellent TypeScript integration |
| PostgreSQL | 16.x | Relational database | Production-grade, ACID compliance, excellent Prisma support |
| bcryptjs | 2.4.3+ | Password hashing | Industry standard for password hashing, pure JavaScript (no native deps) |
| TypeScript | 5.7+ | Type safety | Full Next.js + Prisma + Auth.js type safety, required for production apps |

**Installation:**
```bash
# Core dependencies
npm install next@latest react@latest react-dom@latest
npm install @prisma/client @auth/prisma-adapter
npm install next-auth@beta bcryptjs
npm install zod react-hook-form @hookform/resolvers

# Dev dependencies
npm install --save-dev prisma typescript @types/node @types/react @types/bcryptjs
npm install --save-dev tailwindcss postcss autoprefixer
```

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zod | 3.23+ | Schema validation | Validate all user inputs, auth forms, API requests |
| React Hook Form | 7.53+ | Form state management | Login/signup forms with validation |
| shadcn/ui | Latest | UI components | Pre-built accessible form components |
| Tailwind CSS | 3.4+ | Styling | Required for shadcn/ui, utility-first CSS |
| jose | 5.x | JWT operations | Encrypt/decrypt session tokens (alternative to iron-session) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Auth.js v5 | Clerk, Auth0 | Third-party services easier but vendor lock-in, monthly costs |
| Database sessions | Stateless-only JWT | Stateless simpler but can't force logout, track devices, or revoke tokens |
| bcryptjs | bcrypt (native) | Native bcrypt faster but requires compilation, deployment complexity |
| Prisma | Drizzle ORM | Drizzle lighter but less mature, smaller ecosystem |

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Route group for auth pages
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── dashboard/         # Protected routes
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   └── auth/             # Auth-specific components
├── lib/                   # Core utilities
│   ├── auth.ts           # Auth.js configuration
│   ├── auth.config.ts    # Edge-compatible auth config
│   ├── dal.ts            # Data Access Layer
│   ├── prisma.ts         # Prisma client singleton
│   └── session.ts        # Session helpers
├── actions/               # Server Actions
│   └── auth.ts           # Login, signup, logout actions
├── types/                 # TypeScript types
│   └── auth.ts           # Auth-related types
prisma/
├── schema.prisma          # Database schema
├── migrations/            # Migration history
└── seed.ts               # Seed script
.env.local                 # Local environment variables (gitignored)
.env.example              # Example env file (committed)
```

### Pattern 1: Auth.js v5 Configuration

**What:** Split configuration between edge-compatible config and full config with adapter
**When to use:** Always with Auth.js v5 in Next.js 15+
**Example:**

```typescript
// lib/auth.config.ts (edge-compatible)
// Source: https://authjs.dev/getting-started/migrating-to-v5
import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { getUserByEmail } from '@/lib/dal'

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    signOut: '/logout',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')

      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login
      }

      return true
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(8) })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          const user = await getUserByEmail(email)

          if (!user) return null

          const passwordsMatch = await bcrypt.compare(password, user.password)
          if (passwordsMatch) return user
        }

        return null
      }
    })
  ],
}

// lib/auth.ts (full config with adapter)
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { authConfig } from './auth.config'
import { prisma } from './prisma'

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'database', // Use database sessions for security
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
})
```

### Pattern 2: Data Access Layer (DAL)

**What:** Centralized verification and data access with memoization
**When to use:** All data fetching that requires authentication
**Example:**

```typescript
// lib/dal.ts
// Source: https://nextjs.org/docs/app/guides/authentication
import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Verify session and memoize result
export const verifySession = cache(async () => {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  return { isAuth: true, userId: session.user.id }
})

// Fetch user with automatic verification
export const getUser = cache(async () => {
  const session = await verifySession()

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      // Never include password hash
    }
  })

  return user
})
```

### Pattern 3: Server Actions for Authentication

**What:** Type-safe auth operations using Next.js Server Actions
**When to use:** All authentication mutations (signup, login, logout)
**Example:**

```typescript
// actions/auth.ts
// Source: https://nextjs.org/docs/app/guides/authentication
'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { signIn, signOut } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

const SignupFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export async function signup(formData: FormData) {
  // 1. Validate fields
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, email, password } = validatedFields.data

  // 2. Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    return { errors: { email: ['Email already registered'] } }
  }

  // 3. Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // 4. Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    }
  })

  // 5. Sign in automatically
  await signIn('credentials', {
    email,
    password, // Use plaintext password for auth
    redirect: false,
  })

  redirect('/dashboard')
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  await signIn('credentials', {
    email,
    password,
    redirectTo: '/dashboard',
  })
}

export async function logout() {
  await signOut({ redirectTo: '/' })
}
```

### Pattern 4: Prisma Seed Script

**What:** Idempotent seed data using upsert operations
**When to use:** Initial database setup and demo data creation
**Example:**

```typescript
// prisma/seed.ts
// Source: https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create demo user (idempotent with upsert)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@tendertrackr.com' },
    update: {},
    create: {
      email: 'demo@tendertrackr.com',
      name: 'Demo User',
      password: await bcrypt.hash('Demo1234', 10),
    },
  })

  // Create demo company profile
  const demoCompany = await prisma.company.upsert({
    where: { id: 'demo-company-1' },
    update: {},
    create: {
      id: 'demo-company-1',
      name: 'TechBuild Solutions Ltd.',
      sector: 'IT',
      description: 'Full-service IT consulting and software development',
      capabilities: ['Software Development', 'Cloud Migration', 'Cybersecurity'],
      certifications: ['ISO 27001', 'Cyber Essentials Plus'],
      ownerId: demoUser.id,
    },
  })

  // Create sample tenders
  const tender1 = await prisma.tender.upsert({
    where: { id: 'tender-demo-1' },
    update: {},
    create: {
      id: 'tender-demo-1',
      title: 'IT Infrastructure Modernization',
      description: 'Modernize legacy IT systems for local authority',
      value: 500000,
      deadline: new Date('2026-06-30'),
      sector: 'IT',
      source: 'TED',
      status: 'OPEN',
    },
  })

  // Create example bid
  await prisma.bid.upsert({
    where: { id: 'bid-demo-1' },
    update: {},
    create: {
      id: 'bid-demo-1',
      tenderId: tender1.id,
      companyId: demoCompany.id,
      status: 'DRAFT',
      content: {
        executiveSummary: 'Our proposed approach...',
        methodology: 'We will implement...',
      },
    },
  })

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

// Configure in prisma.config.ts:
// export default defineConfig({
//   migrations: {
//     path: "prisma/migrations",
//     seed: "tsx prisma/seed.ts"
//   }
// })
```

### Pattern 5: Form Components with shadcn/ui

**What:** Type-safe forms with React Hook Form, Zod, and shadcn/ui
**When to use:** Login, signup, and all user input forms
**Example:**

```typescript
// components/auth/login-form.tsx
// Source: https://ui.shadcn.com/docs/forms/react-hook-form
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { login } from '@/actions/auth'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export function LoginForm() {
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof LoginSchema>) {
    const formData = new FormData()
    formData.append('email', values.email)
    formData.append('password', values.password)

    await login(formData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Log in
        </Button>
      </form>
    </Form>
  )
}
```

### Anti-Patterns to Avoid

- **Layout Authentication Checks:** Don't verify auth in layouts—they don't re-render on navigation due to Partial Rendering. Check in page components and DAL instead.
- **Middleware-Only Security:** Never rely solely on middleware for authorization (CVE-2025-29927 allows bypass). Always verify in DAL and Server Actions.
- **Client-Side Session Checks:** UI restrictions are not security. Always verify server-side.
- **Exposing Password Hash:** Never return password field from database queries, even in Server Components.
- **Non-Idempotent Seeds:** Seed scripts should use upsert, not create, to enable safe re-runs.
- **Hardcoded Secrets:** Never commit AUTH_SECRET or DATABASE_URL. Use .env.local and .env.example.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JWT encryption | Custom crypto library | jose or iron-session | Secure defaults, handles edge cases (timing attacks, key rotation) |
| Password hashing | Custom hash function | bcryptjs | Industry-vetted, salting built-in, cost factor for future-proofing |
| Form validation | Manual validation | Zod + React Hook Form | Type inference, async validation, error messages |
| Session management | Custom session store | Auth.js with Prisma adapter | Handles edge cases (token rotation, concurrent sessions, expiry) |
| Cookie configuration | Manual cookie settings | Auth.js defaults | Secure flags (HttpOnly, Secure, SameSite) configured correctly |
| Input sanitization | String replacement | Zod schemas + Prisma | Prevents SQL injection, XSS, type coercion attacks |

**Key insight:** Authentication has decades of security research. Libraries like Auth.js, bcryptjs, and Zod incorporate this knowledge. Custom solutions miss edge cases (timing attacks, token fixation, session fixation, rainbow tables) that lead to vulnerabilities.

## Common Pitfalls

### Pitfall 1: Middleware Authorization Bypass (CVE-2025-29927)

**What goes wrong:** Attackers bypass middleware auth checks using the `x-middleware-subrequest` header, accessing protected routes without authentication.

**Why it happens:** Middleware runs at the edge and can be bypassed by request header manipulation. Versions before Next.js 15.2.3 don't validate this header.

**How to avoid:**
1. Upgrade to Next.js >= 15.2.3 immediately
2. Implement defense-in-depth: verify auth in DAL, not just middleware
3. Use middleware only for optimistic redirects (UX), not security
4. Always call `verifySession()` in Server Components and Server Actions

**Warning signs:**
- Protected routes accessible when unauthenticated
- Session checks passing in middleware but failing in components
- Using middleware as the only auth gate

**Sources:**
- [CVE-2025-29927 Technical Analysis](https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass)
- [Understanding Next.js Middleware Vulnerability](https://blog.logrocket.com/understanding-next-js-middleware-vulnerability/)

### Pitfall 2: Session Persistence Issues

**What goes wrong:** Users logged out on page refresh, sessions not persisting across browser restarts, or race conditions with session updates.

**Why it happens:** Incorrect cookie settings (missing HttpOnly/Secure/SameSite), JWT strategy mismatches, or middleware conflicts.

**How to avoid:**
1. Use database sessions (`strategy: 'database'`) for critical apps
2. Configure cookies correctly:
   ```typescript
   cookies: {
     sessionToken: {
       name: 'next-auth.session-token',
       options: {
         httpOnly: true,
         sameSite: 'lax',
         path: '/',
         secure: process.env.NODE_ENV === 'production'
       }
     }
   }
   ```
3. Set appropriate `maxAge` (30 days standard)
4. Test session persistence across browser restart

**Warning signs:**
- "Session expired" on refresh
- Users logged out when closing browser
- Inconsistent auth state between pages

**Sources:**
- [Next.js Session Management: Solving NextAuth Persistence Issues](https://clerk.com/articles/nextjs-session-management-solving-nextauth-persistence-issues)

### Pitfall 3: Prisma Schema Migration Conflicts

**What goes wrong:** Schema changes fail to apply, database state out of sync with schema, or duplicate migrations created.

**Why it happens:** Skipping migration workflow, editing database directly, or conflicting migrations in team environments.

**How to avoid:**
1. Always use `prisma migrate dev` for schema changes in development
2. Never edit the database directly—always update schema.prisma first
3. Use `prisma db push` only for prototyping, not production workflows
4. Commit migrations to version control
5. Use `prisma migrate reset` to reset dev database to clean state

**Warning signs:**
- "Migration already applied" errors
- Schema drift warnings
- Database columns missing after deployment

**Sources:**
- [Prisma Migrate Workflows](https://www.prisma.io/docs/orm/prisma-migrate/workflows)

### Pitfall 4: Environment Variable Exposure

**What goes wrong:** Secret keys (AUTH_SECRET, DATABASE_URL) committed to git, exposed in client bundles, or missing in production.

**Why it happens:** Confusion between .env.local (gitignored) vs .env (committed), or using NEXT_PUBLIC_ prefix incorrectly.

**How to avoid:**
1. Use .env.local for all secrets (automatically gitignored)
2. Commit .env.example with placeholder values
3. Never prefix secrets with NEXT_PUBLIC_ (exposes to browser)
4. Validate required env vars at startup:
   ```typescript
   const envSchema = z.object({
     DATABASE_URL: z.string().url(),
     AUTH_SECRET: z.string().min(32),
   })
   envSchema.parse(process.env)
   ```
5. Use platform env var management in production (Vercel, Railway, etc.)

**Warning signs:**
- "AUTH_SECRET not found" in production
- Secrets visible in browser DevTools
- Git commits showing DATABASE_URL

**Sources:**
- [Next.js Environment Variables Guide](https://nextjs.org/docs/pages/guides/environment-variables)
- [Best Practices for Environment Variables](https://arnab-k.medium.com/best-practices-for-using-environment-variables-in-next-js-projects-ccf35647e361)

### Pitfall 5: TypeScript Strict Mode Compatibility

**What goes wrong:** Prisma-generated types fail strict null checks, or bcryptjs types conflict with strict mode.

**Why it happens:** Generated Prisma types may include null assertions that fail with `strictNullChecks: true`.

**How to avoid:**
1. Use TypeScript 5.7+ (best Prisma compatibility)
2. Enable strict mode incrementally:
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "skipLibCheck": true // Skip type checking for .d.ts files
     }
   }
   ```
3. Use non-null assertions carefully with Prisma:
   ```typescript
   const user = await prisma.user.findUnique({ where: { id } })
   if (!user) throw new Error('User not found')
   // TypeScript now knows user is non-null
   ```

**Warning signs:**
- "Object is possibly 'null'" errors on Prisma queries
- Type errors in generated Prisma Client

**Sources:**
- [TypeScript Strict Mode Compatibility Discussion](https://github.com/prisma/prisma/discussions/11805)

## Code Examples

Verified patterns from official sources:

### Middleware Configuration

```typescript
// middleware.ts
// Source: https://nextjs.org/docs/app/guides/authentication
export { auth as middleware } from '@/lib/auth'

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

### Prisma Schema for Auth.js

```prisma
// prisma/schema.prisma
// Source: https://authjs.dev/getting-started/adapters/prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  password      String    // For credentials auth
  image         String?
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

### Environment Variables Template

```bash
# .env.example
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tendertrackr?schema=public"

# Auth.js v5
AUTH_SECRET="" # Generate with: openssl rand -base64 32
AUTH_URL="http://localhost:3000"

# Node Environment
NODE_ENV="development"
```

### Password Hashing with bcryptjs

```typescript
// Source: https://auth0.com/blog/hashing-in-action-understanding-bcrypt/
import bcrypt from 'bcryptjs'

// Hashing (signup)
const SALT_ROUNDS = 10 // 2^10 iterations, good balance for 2026
const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS)

// Verification (login)
const isValid = await bcrypt.compare(plainPassword, hashedPassword)

// For high-security apps, use 12 rounds (4x slower, 4x more secure)
const hashedPasswordSecure = await bcrypt.hash(plainPassword, 12)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| NextAuth.js v4 | Auth.js v5 | Q4 2023 | Unified config, edge-compatible, simpler API |
| `getServerSession` | `auth()` function | Auth.js v5 | Single method for all server-side auth checks |
| Pages Router | App Router | Next.js 13+ | Server Components, streaming, better performance |
| `NEXTAUTH_*` env vars | `AUTH_*` env vars | Auth.js v5 | Consistent naming, auto-discovery |
| Prisma 5 | Prisma 6 | Q4 2024 | Better performance, more flexibility, type-safe SQL |
| bcrypt (native) | bcryptjs | Ongoing | Pure JS, easier deployment, no build issues |
| JWT-only sessions | Database sessions | 2025+ | Revocable sessions, audit trail, multi-device management |

**Deprecated/outdated:**
- **`next-auth/next` imports:** Use direct imports from `@/lib/auth` instead
- **`getServerSession()`:** Replaced by unified `auth()` function
- **`NEXTAUTH_URL`:** Auto-detected in most environments, use `AUTH_URL` if needed
- **OAuth 1.0 providers:** No longer supported in Auth.js v5
- **Middleware-only auth:** Security vulnerability, use DAL pattern instead

## Open Questions

Things that couldn't be fully resolved:

1. **Prisma 7 Migration Timing**
   - What we know: Prisma 7 released in 2026 with "Rust-free" architecture and mandatory driver adapters
   - What's unclear: Stability for production use, migration path from Prisma 6, performance implications
   - Recommendation: Use Prisma 6.x for Phase 1, evaluate Prisma 7 in later phases

2. **Auth.js v5 Stable Release**
   - What we know: v5 is in beta (5.0.0-beta.25+), widely used in production
   - What's unclear: Exact stable release date, breaking changes before stable
   - Recommendation: Use latest beta, expect minor API changes, test thoroughly

3. **Session Storage Strategy**
   - What we know: Database sessions more secure, stateless JWT simpler
   - What's unclear: Performance impact at scale, best practice for MVP
   - Recommendation: Start with database sessions for security, migrate to hybrid approach if performance needed

## Sources

### Primary (HIGH confidence)

- [Auth.js v5 Migration Guide](https://authjs.dev/getting-started/migrating-to-v5) - Official migration documentation
- [Auth.js Prisma Adapter](https://authjs.dev/getting-started/adapters/prisma) - Official adapter setup
- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication) - Official Next.js patterns
- [Prisma Seeding Documentation](https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding) - Official seeding guide
- [Next.js Environment Variables](https://nextjs.org/docs/pages/guides/environment-variables) - Official env var guide

### Secondary (MEDIUM confidence)

- [Stop Crying Over Auth: Senior Dev's Guide](https://javascript.plainenglish.io/stop-crying-over-auth-a-senior-devs-guide-to-next-js-15-auth-js-v5-42a57bc5b4ce) - Comprehensive Auth.js v5 tutorial
- [Auth.js Credentials Authentication Guide](https://medium.com/@vetriselvan_11/auth-js-nextauth-v5-credentials-authentication-in-next-js-app-router-complete-guide-ef77aaae7fdf) - Complete implementation example
- [CVE-2025-29927 Technical Analysis](https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass) - Security vulnerability details
- [bcrypt Hashing Guide](https://auth0.com/blog/hashing-in-action-understanding-bcrypt/) - Password hashing best practices
- [shadcn/ui Form Documentation](https://ui.shadcn.com/docs/forms/react-hook-form) - React Hook Form + Zod integration

### Tertiary (LOW confidence)

- Various Medium articles and blog posts on Next.js authentication patterns
- Community discussions on session management strategies
- WebSearch results for 2026 best practices (verified against official docs)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries officially recommended, widely adopted, verified in official docs
- Architecture: HIGH - Patterns from official Next.js and Auth.js documentation
- Pitfalls: HIGH - Security vulnerabilities documented in CVEs, persistence issues verified in official sources
- Code examples: HIGH - All examples sourced from official documentation or verified tutorials

**Research date:** 2026-02-06
**Valid until:** 2026-04-06 (60 days - stable ecosystem, slow-moving best practices)

**Critical security note:** Next.js < 15.2.3 has critical auth bypass vulnerability (CVE-2025-29927, CVSS 9.1). Upgrade immediately. Never rely solely on middleware for security.
