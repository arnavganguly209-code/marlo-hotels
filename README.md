# Marlo Hotels

A world-class five-star luxury hotel website — built from scratch as a premium white-label project.

**Stay Beyond Extraordinary.**

## Technology

| Layer     | Stack                                                        |
| --------- | ------------------------------------------------------------ |
| Framework | Next.js 15 (App Router, Server Components), TypeScript        |
| Styling   | Tailwind CSS v4, custom luxury design system                  |
| Motion    | Framer Motion (scroll & micro-interactions), GSAP (nav panel) |
| Forms     | React Hook Form + Zod                                         |
| Database  | PostgreSQL via Prisma 7 (`@prisma/adapter-pg`)                |
| Icons     | Lucide                                                        |

## Getting Started

```bash
npm install          # also runs `prisma generate`
cp .env.example .env # fill in values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The site runs fully without a database — API routes (newsletter, contact,
booking requests) persist to PostgreSQL when `DATABASE_URL` is set and
degrade gracefully when it is not.

### Database

```bash
npm run db:push      # sync schema to a dev database
npm run db:migrate   # apply migrations (production)
npm run db:studio    # browse data
```

## Project Structure

```
src/
  app/               # App Router pages, API routes, sitemap, robots
  components/
    layout/          # Header, glass nav panel, footer, logo
    home/            # Homepage sections (hero, booking widget, …)
    cards/           # Reusable content cards (room, offer, post, …)
    booking/         # Booking engine + luxury calendar
    forms/           # Contact & newsletter (RHF + Zod)
    ui/              # Primitives (button, fields, reveal animations)
  content/           # Typed content layer (async getters — swap for Prisma
                     # queries to go fully dynamic without touching the UI)
  lib/               # site config, SEO helpers, validators, db client
  types/             # Shared content types
prisma/              # PostgreSQL schema (rooms, bookings, posts, offers, …)
```

The `content/` getters are `async` by design: the admin backend can replace
them with Prisma queries against the same schema without rewriting a single
component.

## Orbit Administration

Orbit is the isolated enterprise administration system at `/orbit`.

1. Set `ORBIT_ADMIN_PASSKEY`, a random `ORBIT_SESSION_SECRET`, and
   `NEXT_PUBLIC_SITE_URL=https://…` in the **PM2 runtime** `.env`
   (not only in the build machine).
2. Optionally set `DATABASE_URL` and run `npm run db:push` (or
   `npm run db:migrate`) for CMS metrics, content, and media.
3. Open `/orbit` and enter the server-configured passkey.

Login works with only the Orbit env vars. PostgreSQL is required for CMS
data after sign-in, not for authentication itself.

Authentication is validated only on the server. Orbit uses signed
HttpOnly cookies (`SameSite=Lax`, `Secure` on HTTPS), a 30-minute
inactivity timeout, an eight-hour absolute expiry, login throttling and
an optional audit trail. No credential is stored in browser storage.
Production errors are prefixed with `[orbit]` in PM2 logs.

Uploaded media is validated, compressed and converted to WebP by Sharp.
Files are written below `public/uploads` by default and metadata is held in
PostgreSQL. Set `ORBIT_UPLOAD_DIR` when the VPS uses a dedicated persistent
media volume, and expose that directory at `/uploads`.

## Deployment — Hostinger VPS

### Continuous integration (automatic)

Pushes to `main` run `.github/workflows/ci.yml` (lint + build only).

### Production deploy (manual)

Deploy is **manual** via Actions → **Deploy to Hostinger VPS** → **Run workflow**.
It requires these GitHub secrets (Settings → Secrets and variables → Actions,
or the **production** environment):

| Secret         | Value                                  |
| -------------- | -------------------------------------- |
| `VPS_HOST`     | VPS IP or hostname                     |
| `VPS_USERNAME` | SSH user                               |
| `VPS_SSH_KEY`  | Private key with access to the VPS     |
| `VPS_PORT`     | SSH port (optional, defaults to 22)    |

Until those secrets exist, do not run the Deploy workflow — it will fail on
purpose with a clear missing-secret message. You can still deploy on the VPS:

```bash
cd /var/www/marlo-hotels
git pull origin main
npm ci && npm run build
pm2 reload marlo-hotels --update-env
```

One-time VPS setup:

```bash
# as your deploy user
sudo mkdir -p /var/www/marlo-hotels && sudo chown $USER /var/www/marlo-hotels
git clone git@github.com:arnavganguly209-code/marlo-hotels.git /var/www/marlo-hotels
cd /var/www/marlo-hotels
cp .env.example .env   # set NEXT_PUBLIC_SITE_URL + DATABASE_URL + Orbit secrets
npm ci && npm run build
pm2 start npm --name marlo-hotels -- start && pm2 save
```

Put Nginx (or Caddy) in front of `localhost:3000` with TLS.

## SEO

- Per-page metadata, OpenGraph & Twitter cards, canonical URLs
- Dynamic `sitemap.xml` and `robots.txt`
- Schema.org JSON-LD: `Hotel`, `HotelRoom`, `Restaurant`, `Article`, `BreadcrumbList`
