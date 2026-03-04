<img width="1917" height="917" alt="image" src="https://github.com/user-attachments/assets/9d9c1cf3-5816-4155-bac3-1fb0c48003dc" />
# VistaraIQ
<img width="1918" height="913" alt="image" src="https://github.com/user-attachments/assets/3ee7256b-7deb-4b93-a6ae-4a94f7e5d118" />

VistaraIQ is a SaaS platform for creating, managing, and analyzing business blueprints with secure authentication, role-aware APIs, and an investor insights engine.

## About The Project

VistaraIQ helps founders, operators, and product teams turn early ideas into structured business blueprints and continuously improve them with AI-assisted feedback.

The platform now includes:

- Full blueprint workspace in dashboard (create, select, edit, save, delete)
- Explore mode (no-login product walkthrough) for quick demo and testing
- Threaded AI assistant with per-blueprint chat history
- One-click "apply assistant notes" into blueprint draft content
- Analytics snapshots based on blueprint freshness and content depth
- Secure auth flows with route protection and role-aware APIs

## Product Vision

- **Vistara** = expansion/growth
- **IQ** = intelligence

VistaraIQ is designed to help founders and teams expand intelligently by turning ideas into structured, versioned, and investment-ready blueprints.

## Core Capabilities

- JWT auth with secure HTTP-only cookie flow
- Email/password registration and login
- Role model (`ADMIN`, `USER`, `HOSTER`)
- Protected dashboard routes with middleware JWT verification
- Explore dashboard access option for product preview (`/dashboard?explore=1`)
- Blueprint CRUD with ownership validation
- Automatic version snapshots on blueprint updates
- Interactive dashboard sections: Overview, Blueprints, Analytics, Settings
- Threaded AI chat per blueprint with local persistence in browser storage
- Investor engine endpoint for:
  - executive summary
  - ROI forecast
  - risk assessment
  - funding breakdown
- Modern SaaS frontend:
  - cinematic splash screen
  - login/register UI
  - actionable dashboard workspace + overview stats
  - premium logo system (horizontal, icon-only, monochrome, favicon-ready)

## Role of AI in VistaraIQ

AI is the decision-intelligence layer of VistaraIQ.

Instead of being used as a chat-only feature, AI is integrated into the product workflow through the Investor Engine:

- Generates an **Executive Summary** from blueprint context
- Produces an **ROI Forecast** for planning scenarios
- Creates a **Risk Assessment** to surface key execution concerns
- Builds a **Funding Breakdown** to support investment discussions

This allows teams to move from raw ideas to structured, investor-ready insights faster and with better clarity.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL (Supabase)
- bcrypt
- jsonwebtoken
- jose (middleware JWT verification)

## Project Structure

```text
.
|-- app
|   |-- api
|   |   |-- admin/route.ts
|   |   |-- auth
|   |   |   |-- login/route.ts
|   |   |   |-- register/route.ts
|   |   |   `-- oauth/[provider]/route.ts
|   |   |-- blueprint
|   |   |   |-- [id]/route.ts
|   |   |   `-- route.ts
|   |   `-- investor/[blueprintId]/route.ts
|   |-- dashboard
|   |   |-- layout.tsx
|   |   `-- page.tsx
|   |-- login/page.tsx
|   |-- register/page.tsx
|   |-- globals.css
|   |-- icon.svg
|   |-- layout.tsx
|   `-- page.tsx
|-- components
|   `-- Logo.tsx
|-- lib
|   |-- ai/investor.engine.ts
|   |-- auth
|   |   |-- jwt.ts
|   |   |-- middleware.ts
|   |   `-- password.ts
|   |-- db/prisma.ts
|   `-- services/blueprint.service.ts
|-- prisma
|   `-- schema.prisma
|-- public
|   `-- logos
|       |-- vistaraiq-premium.svg
|       |-- vistaraiq-horizontal.svg
|       |-- vistaraiq-icon.svg
|       `-- vistaraiq-monochrome.svg
|-- middleware.ts
|-- .env.example
|-- .gitignore
|-- package.json
|-- tailwind.config.ts
`-- postcss.config.js
```

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/oauth/google`
- `GET /api/auth/oauth/github`

### Admin / Blueprints / Investor

- `GET /api/admin` (ADMIN only)
- `POST /api/blueprint`
- `GET /api/blueprint`
- `GET /api/blueprint/:id`
- `PUT /api/blueprint/:id`
- `DELETE /api/blueprint/:id`
- `GET /api/investor/:blueprintId`

## Local Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Copy `.env.example` into `.env.local` (or `.env`) and provide real values:

```bash
DATABASE_URL="..."
DIRECT_URL="..."
JWT_SECRET="..."
GOOGLE_OAUTH_URL="..."
GITHUB_OAUTH_URL="..."
```

### 3) Prisma setup

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4) Run app

```bash
npm run dev
```

## Security Notes

- `.env` and `.env.local` are git-ignored by default.
- JWT token is set as `httpOnly` cookie.
- Dashboard routes are protected in `middleware.ts`.
- Use URL-encoded DB passwords when special characters are present.
- For Supabase pooler usage, keep `pgbouncer=true&connection_limit=1` on runtime connection URL.

## Collaboration Workflow

Recommended for contributors:

1. Create feature branch: `feat/<scope>`
2. Keep PRs focused and small
3. Validate with:
   - `npm run dev`
   - `npx tsc --noEmit`
   - API smoke tests for modified endpoints
4. Use clear PR template:
   - What changed
   - Why
   - How to test
   - Risks and rollback notes

## Upcoming Roadmap

- OAuth callback handling with provider token exchange
- Refresh token/session rotation strategy
- Email verification + password reset flows
- Rate limiting + brute-force protection on auth endpoints
- Audit logging (auth + blueprint actions)
- Full analytics charts in dashboard
- Blueprint collaboration and team workspaces
- CI pipeline (typecheck, lint, tests, build)
- Deployment guides for Vercel + Supabase production

## License

Private/internal until explicitly licensed by repository owner.
