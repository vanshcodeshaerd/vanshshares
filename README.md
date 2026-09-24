# Campus Leader Sign-up

Students confirm their AWS Builder Center sign-up (full name, alias, `@nuv.ac.in` email). Each submission is stored in Supabase. An admin portal at `/admin` lists the entries, with search, delete and CSV export.

Built with Next.js 15 (App Router), Tailwind CSS 4, and Supabase. It deploys to Vercel.

| URL | Who |
|---|---|
| `/` | Students (point your bit.ly link here) |
| `/admin` | You (username and password from env vars) |

## Live setup

- Vercel project: `nuv-campus-leader` (team `vansh20072006-gmailcom's projects`), production branch `claude/admiring-maxwell-b0orph`
- Supabase project: `campus-leader-signups` (`qeomdzexohmsfobguurq`, ap-south-1), with the migration applied

## Setup

1. **Supabase**: create a project and run both files in `supabase/migrations/` in the SQL editor. Then store the admin token hash (the command is at the bottom of `0002_rpc_access.sql`). The app connects with the publishable key. The table is locked by RLS and is only reachable through database functions: anyone can add a validated sign-up, and listing or deleting requires `ADMIN_SESSION_SECRET`.
2. **Environment variables**: copy `.env.example` to `.env.local` and fill it in. Set the same variables in Vercel under Project → Settings → Environment Variables.
   - `ADMIN_SESSION_SECRET`: at least 32 random characters (`openssl rand -hex 32`).

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint     # TypeScript type check
npm run build
```

## Deploy (Vercel)

Import this GitHub repo in Vercel (the framework preset is Next.js), add the environment variables above and deploy. Redeploy after you change any environment variable.

## Notes

- Emails are lowercased before they're saved, and a unique index on `lower(college_email)` blocks duplicate sign-ups.
- The allowed college domain is set in `lib/validation.ts`.
- The admin session is a signed, httpOnly cookie that lasts 12 hours. `ADMIN_SESSION_SECRET` is also the database admin token. If you change it, update its SHA-256 in `private.app_config` too, or the admin page won't load entries.
