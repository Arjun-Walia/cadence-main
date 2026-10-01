# Proofline

Proofline ranks the deals, stages, and notes a team already has, then asks who to contact first. It does not invent leads. Approve, snooze, or skip. Nothing is sent until someone on the account says so.

The app is a WhatsApp CRM around that decision: inbox, pipelines, broadcasts, automations, flows, and an assistant that uses a key you bring yourself.

## Stack

- Next.js 16 and React 19
- TypeScript
- Supabase Auth and Postgres
- next-intl (`en`, `es`, `pt`, `ko`)
- Vitest

Node 20 or newer. The repo uses npm.

## Local setup

```bash
npm ci
cp .env.local.example .env.local
npm run dev
```

The dev server listens on [http://localhost:3000](http://localhost:3000). `NEXT_PUBLIC_*` values are read when the dev server starts, so restart it after changing them.

Fill `.env.local` from the example. Do not commit that file. The names that have to be set before login and data routes work:

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key used in the browser |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only secret key. Never expose it to the client |
| `ENCRYPTION_KEY` | 64 hex characters. Encrypts WhatsApp tokens and AI keys |
| `META_APP_SECRET` | Verifies inbound WhatsApp webhooks. Without it, webhooks are rejected |

Generate an encryption key with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Rotating `ENCRYPTION_KEY` makes previously saved tokens unreadable. People have to save WhatsApp settings and AI keys again.

Optional names are documented in `.env.local.example`, including `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_LOCALE`, and `AUTOMATION_CRON_SECRET`.

There is no platform AI key. Each account adds its own provider key under Settings.

## Database

SQL migrations live in `supabase/migrations` and are written to be safe to re-run. `supabase/ci/verify-schema.sql` checks the shape the app expects.

Apply them to the Supabase project behind `NEXT_PUBLIC_SUPABASE_URL` before signing up. New users get an account from the `handle_new_user` trigger.

Hosted Auth still needs a manual URL configuration so confirmation and reset emails return to this app:

- Site URL: the public origin, for example `https://your-domain.example`
- Redirect URLs: `https://your-domain.example/**`

Email confirmation is controlled in the Supabase project. When it is on, a new account cannot sign in until the inbox link is opened.

Direct database hosts on Supabase can be IPv6-only. If this machine cannot reach that host, use the session pooler from the project’s connection settings (user `postgres.<project-ref>`, port 5432).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build (`output: "standalone"`) |
| `npm start` | Serve the production build |
| `npm test` | Vitest |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

## AI assistant

Settings → Agent setup is ordered on purpose:

1. Choose the provider (OpenAI, Anthropic, DeepSeek, Groq, or Gemini).
2. Enter that provider’s API key.
3. Test the key. The test loads the models the provider returns for that key.
4. Choose a model, then save.

The key is stored with AES-256-GCM under `ENCRYPTION_KEY` and is not shown again. A stored key is only reused for the provider it was saved with. Changing provider means entering that provider’s key and testing again.

Auto-reply stays off until an admin turns it on. Drafts and auto-replies use the saved model.

## WhatsApp

WhatsApp credentials are per account and encrypted the same way. Inbound webhooks require `META_APP_SECRET`. Leave it unset and every webhook is rejected. `WHATSAPP_TEMPLATES_DRY_RUN=true` is for local template experiments only. Do not set it on a deployment that should submit real templates.

## Deployment

The production app is a Next.js project on Vercel, production branch `main`, public site [https://proofline-dun.vercel.app](https://proofline-dun.vercel.app). Set the same environment names there. `NEXT_PUBLIC_SITE_URL` should be that origin.

`src/middleware.ts` sends anonymous visitors from the product routes to `/login`. The marketing home, `/login`, and `/signup` stay public.

Do not commit `.env.local`, service-role keys, the encryption key, Meta secrets, or provider keys.

## Repository map

| Path | What it holds |
| --- | --- |
| `src/app` | Routes, API handlers, icons, sitemap, robots |
| `src/components` | UI, including the marketing page and settings |
| `src/lib` | Auth, WhatsApp, decisions, AI, public API |
| `messages` | UI copy for each locale |
| `supabase/migrations` | Postgres schema |
| `public/brand` | Logo, mark, and icon files |
| `mcp-server` | Optional MCP server for the public API |

## License

Proofline is proprietary. See `LICENSE`. The name and mark are a trademark of Arjun-Walia (https://github.com/Arjun-Walia) and Abhishek (https://github.com/itsawesomeabhishek). Nothing in this repository grants permission to copy or use them.

## Brand files

The dark-theme logo is `public/brand/logo-dark.png` (blue mark and white wordmark). The app mark is `public/brand/mark-blue.png`. Favicon, apple touch icon, `og.png`, and the PWA icons are made from that mark.

The landing page is at `/` for signed-out visitors and at `/home` for anyone, including a signed-in session.
