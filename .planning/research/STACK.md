# Stack Research

**Domain:** AI-Assisted Bid Builder for EU Public Tenders
**Project:** BidFlow
**Researched:** 2026-02-06
**Confidence:** MEDIUM

Note: Limited to knowledge-based research due to web access restrictions. Versions based on training data (January 2025) and standard Node.js/TypeScript ecosystem patterns. Recommend verifying current versions before implementation.

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Node.js | 22.x LTS | Runtime environment | Current LTS with native TypeScript support (experimental), excellent performance, stable for production. 20.x LTS also viable. |
| TypeScript | 5.7+ | Type-safe JavaScript | Industry standard for large-scale Node.js apps. Strong inference, better tooling, catches errors at compile time. |
| Next.js | 15.x | Full-stack framework | Best-in-class React framework for TypeScript, built-in API routes (no separate backend needed), server components for AI workloads, excellent DX, ISR/SSR for dashboard. |
| React | 19.x | UI library | De facto standard for web dashboards, huge ecosystem, server components for performance. |
| PostgreSQL | 16.x | Primary database | Best choice for structured tender data, company profiles, bid documents. Excellent JSON support for flexible schemas, full-text search for tender matching. |
| Prisma | 6.x | ORM/Database toolkit | Type-safe database client for TypeScript, excellent DX, migration system, works perfectly with PostgreSQL. Industry standard for TypeScript backends. |

### AI & Document Generation

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| OpenAI SDK | 4.x | LLM integration | For AI bid generation. Start with mock responses, swap to real API post-MVP. Clear API, streaming support, function calling for structured output. |
| Vercel AI SDK | 3.x | AI framework | Unified interface for multiple LLM providers (OpenAI, Anthropic, etc). Streaming UI components, easy provider switching. Better than direct OpenAI SDK for multi-provider scenarios. |
| Zod | 3.x | Schema validation | Define bid document schemas, validate AI outputs, type-safe forms. Essential for structured Q&A and content validation. |
| pdf-lib | 1.17.x | PDF creation | Low-level PDF creation for bid exports. Full control over layout, works in Node.js and browser, no external dependencies. |
| docx | 8.x | DOCX generation | Microsoft Word document creation for bid exports. Official library, comprehensive formatting support, works in Node.js. |
| @react-pdf/renderer | 3.x | PDF from React | Alternative for PDF generation using React components. Good for complex layouts, but pdf-lib better for forms. |

### Frontend & UI

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui | Latest | UI components | Pre-built, customizable React components built on Radix UI and Tailwind. Industry standard for 2025/2026 TypeScript projects. Copy-paste approach, not npm package. |
| Tailwind CSS | 4.x | Styling framework | Utility-first CSS with CSS-based configuration. Editorial design system: monochrome (black/white) with yellow brand (#fbcb46), serif typography, sharp corners (0px radius). |
| Radix UI | 1.x | Headless components | Accessible, unstyled primitives (forms, dialogs, dropdowns). Foundation for shadcn/ui, use directly for custom components. |
| React Hook Form | 7.x | Form management | Best form library for React. Type-safe with Zod integration, excellent performance (uncontrolled inputs), validation support. |
| TanStack Query | 5.x | Server state management | Data fetching, caching, synchronization. Essential for tender lists, company profiles, bid documents. Formerly React Query. |
| Zustand | 4.x | Client state management | Lightweight state manager for UI state (sidebar open, selected tender). Simpler than Redux, better than Context API for complex state. |

### Backend & API

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tRPC | 11.x | Type-safe APIs | End-to-end type safety between Next.js API routes and frontend. No code generation, auto-complete everywhere. Perfect for TypeScript full-stack. |
| NextAuth.js | 5.x (Auth.js) | Authentication | Standard auth solution for Next.js. Email/password for MVP, easily extensible to OAuth later. |
| Bcrypt | 5.x | Password hashing | Industry standard for password storage. Use bcryptjs for pure JS implementation. |
| Jose | 5.x | JWT handling | Modern, lightweight JWT library for token generation/verification. Better than jsonwebtoken for TypeScript. |

### Data Processing & Validation

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zod | 3.x | Runtime validation | Define schemas for tender data, bid inputs, AI outputs. Type inference for TypeScript. Essential for data validation. |
| date-fns | 3.x | Date manipulation | Lightweight, functional date utilities. Better than moment.js (deprecated). For tender deadlines, bid timelines. |
| fuse.js | 7.x | Fuzzy search | Client-side search for tender matching by keywords, company capabilities. Better than basic string matching. |
| marked | 12.x | Markdown parsing | Parse tender descriptions, render bid previews. Simple, extensible, no dependencies. |

### Development Tools

| Tool | Version | Purpose | Notes |
|------|---------|---------|-------|
| ESLint | 9.x | Linting | TypeScript-aware linting with @typescript-eslint. Catch errors, enforce standards. |
| Prettier | 3.x | Code formatting | Consistent formatting across team. Auto-format on save. |
| Vitest | 2.x | Testing framework | Fast, Vite-powered test runner. Better than Jest for modern projects, native ESM support. |
| Playwright | 1.x | E2E testing | Test full bid creation flow. More reliable than Cypress, better TypeScript support. |
| tsx | 4.x | TypeScript execution | Run TypeScript files directly (scripts, migrations). Faster than ts-node. |
| tsup | 8.x | TypeScript bundler | Bundle backend utilities if needed. Fast, zero-config. |

## Installation

```bash
# Core framework (includes React, Next.js)
npm install next@latest react@latest react-dom@latest

# TypeScript
npm install -D typescript @types/react @types/node

# Database & ORM
npm install @prisma/client
npm install -D prisma

# AI & Document Generation
npm install ai zod
npm install pdf-lib docx
npm install @react-pdf/renderer  # Optional alternative

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod
npm install @radix-ui/react-form @radix-ui/react-dialog @radix-ui/react-select

# UI & Styling
npm install tailwindcss postcss autoprefixer
npm install -D @tailwindcss/typography @tailwindcss/forms

# shadcn/ui (copy components, don't install)
npx shadcn-ui@latest init

# Data Fetching & State
npm install @tanstack/react-query
npm install zustand

# Type-safe APIs
npm install @trpc/server @trpc/client @trpc/react-query @trpc/next

# Authentication
npm install next-auth@beta bcryptjs jose
npm install -D @types/bcryptjs

# Utilities
npm install date-fns fuse.js marked

# Development Tools
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D prettier eslint-config-prettier
npm install -D vitest @vitest/ui
npm install -D playwright @playwright/test
npm install -D tsx tsup
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js 15 | Remix | If you prefer Remix's loader pattern or need more control over streaming. Both excellent for 2026. |
| PostgreSQL | MongoDB | If tender data is extremely schemaless. But PostgreSQL's JSON support handles flexibility while keeping relational benefits. |
| Prisma | Drizzle ORM | If you want SQL-like query builder with better performance. Drizzle is gaining traction in 2026 but Prisma has better DX. |
| tRPC | REST API | If you need public API or non-TypeScript clients. tRPC only works TypeScript-to-TypeScript. |
| Vercel AI SDK | LangChain | If you need complex agent workflows, RAG, or vector stores. Overkill for simple text generation. |
| pdf-lib | Puppeteer/Playwright PDF | If you need pixel-perfect rendering from HTML. Slower, heavier, requires headless browser. |
| shadcn/ui | Material UI / Ant Design | If you need comprehensive component library out-of-box. shadcn/ui is more modern, customizable. |
| React Hook Form | Formik | If your team is already using Formik. React Hook Form has better performance and TypeScript support. |
| Vitest | Jest | If you have existing Jest config. Vitest is faster, better ESM support, Vite ecosystem. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Express.js | Unnecessary with Next.js API routes. Extra dependency, no type safety. | Next.js API routes or tRPC |
| Mongoose | Adds abstraction layer over MongoDB when PostgreSQL + Prisma better fits structured tender data. | Prisma + PostgreSQL |
| Redux Toolkit | Overkill for this app's state needs. More boilerplate, steeper learning curve. | Zustand for client state, TanStack Query for server state |
| pdfmake | Declarative API is verbose, lacks TypeScript support, harder to debug. | pdf-lib or @react-pdf/renderer |
| jsonwebtoken | Older API, worse TypeScript support, more verbose. | Jose |
| Axios | fetch() is built-in now, TanStack Query abstracts it anyway. | Native fetch() with TanStack Query |
| moment.js | Deprecated, large bundle size. | date-fns or native Intl API |
| Create React App | Deprecated, no longer maintained. | Next.js |
| ts-node | Slower than tsx, worse ESM support. | tsx |
| Lodash | Most utilities now have native JS equivalents. Large bundle. | Native JS methods, import specific functions if needed |

## Stack Patterns by Use Case

### MVP (Mock APIs)
```typescript
// Mock AI responses in API route
// app/api/generate-bid/route.ts
export async function POST(req: Request) {
  const input = await req.json();
  // Return mock response instead of calling OpenAI
  return Response.json({
    content: "Mock bid content based on " + input.question
  });
}
```

**Post-MVP (Real AI):**
```typescript
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const input = await req.json();
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: input.question }],
  });
  return Response.json({ content: completion.choices[0].message.content });
}
```

### PDF Export Pattern
```typescript
import { PDFDocument, rgb } from 'pdf-lib';

// For form-based bids (structured data)
async function generateFormPDF(bidData: BidData) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  page.drawText(bidData.companyName, { x: 50, y: 750 });
  // ... fill form fields
  return pdfDoc.save();
}
```

### DOCX Export Pattern
```typescript
import { Document, Packer, Paragraph, TextRun } from 'docx';

// For narrative bids (written proposals)
async function generateProposalDocx(bidData: BidData) {
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          children: [
            new TextRun({ text: bidData.companyName, bold: true }),
          ],
        }),
        // ... narrative sections
      ],
    }],
  });
  return Packer.toBuffer(doc);
}
```

### Tender Matching Pattern
```typescript
import Fuse from 'fuse.js';

// Match tenders to company profile
const fuse = new Fuse(tenders, {
  keys: ['description', 'requirements', 'sector'],
  threshold: 0.4,
});

const matches = fuse.search(companyProfile.capabilities.join(' '));
```

## Architecture Implications

### Monorepo Not Needed
Next.js handles both frontend and backend in single codebase. No need for separate client/server repos or monorepo tooling (Turborepo, Nx).

### Database-First Schema
Use Prisma schema as source of truth. Generate TypeScript types from schema, not the reverse. Migration workflow:
1. Edit `prisma/schema.prisma`
2. `npx prisma migrate dev`
3. TypeScript types auto-generated

### Type Safety Chain
```
Database Schema (Prisma)
  → Prisma Client (auto-generated types)
  → tRPC Procedures (backend)
  → tRPC Client (frontend)
  → React Components
```

Full type safety from database to UI with zero manual type definitions.

### Server Components Strategy
- Use React Server Components for data-heavy pages (tender lists, company profile)
- Use Client Components for interactive elements (forms, dialogs, bid editor)
- Co-locate server and client components in `app/` directory

### API Layer Strategy
Use tRPC for internal frontend-backend communication. If you later need public API for third parties, add REST endpoints alongside tRPC.

## Version Compatibility Notes

### Critical Compatibilities
- **Next.js 15 + React 19**: Requires React 19. Don't use Next.js 15 with React 18.
- **Prisma 6 + PostgreSQL 16**: Fully compatible. Prisma 6 added native TypeScript mode.
- **tRPC 11 + Next.js 15**: tRPC 11 has first-class Next.js 15 App Router support.
- **shadcn/ui + Radix UI**: shadcn/ui components are built on specific Radix versions. Use `npx shadcn-ui@latest add` to ensure compatibility.

### Node.js Version Requirement
- **Minimum**: Node.js 18.17+ (for Next.js 15)
- **Recommended**: Node.js 22.x LTS (current LTS as of this research)
- **Package manager**: npm 10+ or pnpm 9+ (pnpm faster for monorepos, not needed here)

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Core Stack (Next.js, TypeScript, PostgreSQL, Prisma) | HIGH | Industry standard for TypeScript full-stack in 2026. Aligned with user constraint (Node.js/TypeScript). |
| AI Integration (Vercel AI SDK, OpenAI) | HIGH | Standard approach for LLM integration in Node.js. Mock-first strategy is correct for MVP. |
| Document Generation (pdf-lib, docx) | MEDIUM | These are established libraries, but alternatives exist. May need evaluation based on specific tender format requirements. |
| UI Stack (shadcn/ui, Tailwind, Radix) | HIGH | Current best practice for TypeScript + React projects in 2026. Excellent DX and customization. |
| Version Numbers | MEDIUM | Based on training data through January 2025. Recommend verifying current versions before installation. |

## Sources

**Limitations:** Research conducted without web access. Based on:
- Training data through January 2025
- Standard TypeScript/Node.js ecosystem patterns
- Next.js/React best practices as of training cutoff
- Common patterns for document generation and AI integration

**Recommended Verification:**
1. Check npm for current versions: `npm view <package> version`
2. Verify Next.js compatibility matrix: https://nextjs.org/docs
3. Check Prisma compatibility: https://www.prisma.io/docs/reference/system-requirements
4. Review Vercel AI SDK docs: https://sdk.vercel.ai/docs

**Not Verified:**
- Specific version numbers for 2026 (recommend checking npm)
- Recent breaking changes or deprecations
- New alternatives that emerged after January 2025

---
*Stack research for: BidFlow — AI-Assisted Bid Builder*
*Researched: 2026-02-06*
*Confidence: MEDIUM (knowledge-based, web verification unavailable)*
