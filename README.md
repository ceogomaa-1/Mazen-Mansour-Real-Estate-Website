# Mike Mansour Real Estate Website

## Run locally

```bash
npm install
npm run dev
```

## Stack

- Next.js (App Router) + React + TypeScript
- CSS design system with animations
- Supabase-ready environment variables

## Pages included

- Home
- Properties (list + filters)
- Property details (`/properties/:slug`)
- About
- Contact
- 404 page

## Data flow status

- Current listing source: local sample data (`src/data/properties.ts`)
- Integration point for backend data: `src/services/properties.ts`
- Supabase env template: `.env.example`

## Next backend integration

1. Create Supabase project and `properties` table.
2. Add Vercel environment variables from `.env.example`.
3. Build n8n workflow from mgcodashboard webhook/API into Supabase.
4. Replace local data fetch in `src/services/properties.ts` with Supabase query.
5. Add webhook verification to secure listing sync.

## n8n ingestion endpoint

- Endpoint path: `/api/listings` (alias: `/api/properties`)
- Files:
  - `app/api/listings/route.ts`
  - `app/api/properties/route.ts`
- Method: `POST`
- Auth header supported:
  - `x-mgco-secret: <N8N_INGEST_SECRET>`
  - or `x-ingest-secret: <N8N_INGEST_SECRET>`
  - or `Authorization: Bearer <N8N_INGEST_SECRET>`
- Behavior:
  - Upserts listing into `public.properties`
  - Logs request result into `public.sync_events`
