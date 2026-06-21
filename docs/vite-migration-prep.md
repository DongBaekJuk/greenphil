# Vite Frontend Notes

The frontend has already been migrated from Create React App to Vite.

## Working directories

- Frontend app: `C:\Dev\greenphil\frontEnd`
- Supabase schema/migrations: `C:\Dev\greenphil\supabase`
- Spring Boot backend: removed

Run frontend commands from `frontEnd`.

```powershell
cd C:\Dev\greenphil\frontEnd
npm install
npm run dev
npm run build
npm run preview
npm run test
```

## Current scripts

| Purpose | Command |
| --- | --- |
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Preview build | `npm run preview` |
| Test | `npm run test` |

## Environment variables

Vite exposes only `VITE_*` variables to browser code.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

## Build output

Vite writes production output to:

```text
C:\Dev\greenphil\frontEnd\dist
```

The old CRA `build/` folders are no longer used.

