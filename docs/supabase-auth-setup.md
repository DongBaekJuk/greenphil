# GreenPhil Supabase Setup

## Goal

GreenPhil now uses Supabase as the primary backend:

- Supabase Auth handles Google/Naver login.
- Supabase Postgres stores profiles, posts, comments, likes, reports, and scraps.
- Row Level Security limits writes to authenticated users and owner-owned data.
- The React app reads and writes through `@supabase/supabase-js`.

## User-owned setup

These values must be configured directly in Supabase and OAuth provider dashboards.

- Create a Supabase project.
- Add Google and Naver OAuth provider credentials.
- Register redirect URLs.
- Put the project URL and publishable key in `frontEnd/.env.local`.
- Never put the service role key in frontend code.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

## Redirect URLs

For local Vite development, register:

```text
http://127.0.0.1:5173
http://localhost:5173
```

For production, also register the real service domain.

## Database setup

Apply this migration in the Supabase SQL editor or through Supabase CLI:

```text
supabase/migrations/0001_community_schema.sql
```

## Login and data flow

1. User clicks Google or Naver login.
2. Supabase completes OAuth redirect.
3. The frontend receives a Supabase session.
4. `ensureProfile(user)` creates or updates `public.profiles`.
5. Board actions write directly to Supabase tables.
6. RLS policies enforce authenticated writes and owner-only edits.

## Privacy notes

Collect only the minimum login data needed for the service.

- Required: Supabase user id, provider, email, display name
- Optional: profile image
- Do not store provider access tokens or refresh tokens in app tables

