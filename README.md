# Sonji

**The plug-and-play CRM for people tired of paying $700/month in subscriptions.**

[sonji.io](https://sonji.io)

## Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4 + CSS Variables (per-tenant theming)
- **Database:** PostgreSQL with Row-Level Security (multi-tenant isolation)
- **ORM:** Drizzle ORM
- **Auth:** Clerk (multi-tenant organizations)
- **Payments:** Stripe + Stripe Connect
- **Email:** Resend
- **SMS:** Twilio
- **AI:** Claude API (Anthropic)
- **Hosting:** Vercel
- **Cache:** Upstash Redis

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Push database schema
npm run db:push

# Run development server
npm run dev
```

## Architecture

Sonji is a multi-tenant SaaS platform. Every tenant gets:
- A branded subdomain (`clientname.sonji.io`)
- Full CRM with contacts, pipeline, forms, email, scheduling, invoicing
- Complete data isolation via PostgreSQL Row-Level Security

See `src/lib/db/schema.ts` for the full database schema.
See `src/middleware.ts` for the tenant routing logic.
See `drizzle/0001_rls_policies.sql` for the RLS migration.

## License

Proprietary. All rights reserved.
