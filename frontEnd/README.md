# GreenPhil Frontend

React SPA powered by Vite.

## Working directory

Run frontend commands from this folder:

```powershell
cd C:\Dev\greenphil\frontEnd
```

## Scripts

```powershell
npm run dev
npm run build
npm run preview
npm run test
```

- `npm run dev`: start the Vite development server.
- `npm run build`: create a production build in `dist/`.
- `npm run preview`: serve the production build locally.
- `npm run test`: run Vitest.

## Environment variables

Create `.env.local` in this folder when local values are needed.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```
