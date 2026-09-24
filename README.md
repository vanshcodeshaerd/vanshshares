# Campus Leader Sign-up

Students confirm their AWS Builder Center sign-up (full name, alias, `@nuv.ac.in` email). Each submission is checked with Cloudflare Turnstile and stored in Supabase. An admin portal at `/admin` lists the entries, with search, delete and CSV export.

Built with Next.js 15 (App Router), Tailwind CSS 4, Supabase and Cloudflare Turnstile. It deploys to Vercel.

| URL | Who |
|---|---|
| `/` | Students (point your bit.ly link here) |
| `/admin` | You (username and password from env vars) |

## Live setup

- Vercel project: `nuv-campus-leader` (team `vansh20072006-gmailcom's projects`), production branch `claude/admiring-maxwell-b0orph`
- Supabase project: `campus-leader-signups` (`qeomdzexohmsfobguurq`, ap-south-1), with the migration applied

## Setup

1. **Supabase**: create a project, then run `supabase/migrations/0001_signups.sql` in the SQL editor. The table has RLS on with no policies, so only the server (service-role key) can access it.
2. **Cloudflare Turnstile**: in the Cloudflare dashboard, go to Turnstile and add a widget. Add your Vercel domain (and `localhost` for dev) to the widget's hostnames, then copy the site key and secret key.
3. **Environment variables**: copy `.env.example` to `.env.local` and fill it in. Set the same variables in Vercel under Project → Settings → Environment Variables.
   - `ADMIN_SESSION_SECRET`: at least 32 random characters (`openssl rand -hex 32`).

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build
```

## Deploy (Vercel)

Import this GitHub repo in Vercel (the framework preset is Next.js), add the environment variables above and deploy. Redeploy after you change any environment variable.

## Notes

- Emails are lowercased before they're saved, and a unique index on `lower(college_email)` blocks duplicate sign-ups.
- The allowed college domain is set in `lib/validation.ts`.
- The admin session is a signed, httpOnly cookie that lasts 12 hours. Changing `ADMIN_SESSION_SECRET` logs everyone out.
