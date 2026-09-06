# Forge AI

Describe a site in plain language → get real HTML/CSS/JS, a suggested database schema,
login, and a Stripe test-payment button, all in one pass. Runs entirely on free tiers.

## What it actually does

- **Frontend**: the AI writes `index.html` / `styles.css` / `script.js` and you get an
  instant live preview (no build step — it's inlined into an iframe).
- **Iterative editing**: after the first build, keep typing changes — "make the header
  sticky," "add a pricing table" — and it edits the existing site instead of starting
  over, the way Hercules' chat does.
- **Backend**: for anything needing server logic, it writes Next.js API route files
  under `server/`. In local dev, hit "Activate backend" and they're written straight
  into `app/api/generated/...` and go live immediately — no manual copying. (This only
  works in `npm run dev`; production hosts run on a read-only filesystem, so there you
  download the zip and commit the files instead.)
- **Database**: it suggests table names/columns for whatever the site needs to store.
  Run `supabase/schema.sql` once, then adapt it to match.
- **Auth**: built into this app already — magic-link sign-in via Supabase, so you can
  save projects to your account.
- **Payments**: a "Test checkout" button in the builder creates a real Stripe Checkout
  session in test mode — no money moves until you swap in live keys.
- **"Mobile app"**: check "Installable (PWA)" and the generated site gets a manifest +
  service worker, so visitors can add it to their phone's home screen and it opens
  full-screen like an app. This is the honest free substitute for a native app — it
  skips the App Store / Play Store entirely, which also means no $99/yr developer fee,
  but also no store listing.
- **Hosting**: deploy the whole thing to Vercel's free tier in a couple of clicks.

## 1. Install

```
npm install
```

## 2. Get free keys (all no-credit-card, free-tier)

| Service  | For              | Link                                            |
|----------|------------------|--------------------------------------------------|
| Groq     | AI code generation | https://console.groq.com/keys                  |
| Supabase | Database + auth  | https://supabase.com → New project              |
| Stripe   | Test payments    | https://dashboard.stripe.com/test/apikeys       |

Copy `.env.example` to `.env.local` and fill in the values.

## 3. Set up the database

In your Supabase project → SQL Editor, paste and run `supabase/schema.sql`.
This creates a `projects` table with row-level security so each user only sees
their own saved sites.

## 4. Run it locally

```
npm run dev
```

Open http://localhost:3000, click "Start building", and describe a site.

## 5. Deploy for free

1. Push this folder to a GitHub repo.
2. Go to https://vercel.com → New Project → import the repo.
3. Add the same environment variables from `.env.local` in Vercel's project settings.
4. Deploy. You get a free `*.vercel.app` URL immediately; you can attach a custom
   domain later if you want one.

## Notes and honest limits

- The free Groq model is very capable for landing pages, forms, dashboards, and small
  tools — it's not going to one-shot a large multi-page app with real-time features
  perfectly every time. Keep iterating with follow-up prompts rather than expecting
  one perfect pass.
- The live preview only runs the frontend files, even after "Activate backend" writes
  the server files to disk — restart `npm run dev` to pick up new API routes.
- Stripe test mode is free forever for testing. If you later want to accept real
  payments on a site you build, that's Stripe's standard processing fee — same as
  any payment provider — not something this app adds.
- No compiled native iOS/Android app. The PWA option gets you an installable,
  app-like icon and offline support without app-store fees or review, but it's not
  a listing in the App Store or Play Store.
- This is a personal-scale clone, not a company. Hercules has a team refining prompt
  quality, model choice, and infra reliability full-time — expect this to need more
  prompt-nudging and occasional manual fixes than a polished commercial product.
