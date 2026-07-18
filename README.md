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

1. Configure `DATABASE_URL`, `ORBIT_ADMIN_PASSKEY` and a random
   `ORBIT_SESSION_SECRET` in the server `.env`.
2. Apply the committed Prisma migration with `npm run db:migrate`.
3. Open `/orbit` and enter the server-configured passkey.

Authentication is validated only on the server. Orbit uses opaque,
database-backed HttpOnly cookies, strict same-site policy, a 30-minute
inactivity timeout, an eight-hour absolute expiry, persistent login
throttling and an audit trail. No credential or session token is stored in
browser storage.

Uploaded media is validated, compressed and converted to WebP by Sharp.
Files are written below `public/uploads` by default and metadata is held in
PostgreSQL. Set `ORBIT_UPLOAD_DIR` when the VPS uses a dedicated persistent
media volume, and expose that directory at `/uploads`.

## Deployment — Hostinger VPS

Pushes to `main` trigger `.github/workflows/deploy.yml`: lint + build on CI,
then SSH into the VPS, pull, install, migrate, build and reload PM2.

One-time VPS setup:

```bash
# as your deploy user
sudo mkdir -p /var/www/marlo-hotels && sudo chown $USER /var/www/marlo-hotels
git clone git@github.com:arnavganguly209-code/marlo-hotels.git /var/www/marlo-hotels
cd /var/www/marlo-hotels
cp .env.example .env   # set NEXT_PUBLIC_SITE_URL + DATABASE_URL
npm ci && npm run build
pm2 start npm --name marlo-hotels -- start && pm2 save
```

GitHub repository secrets required:

| Secret         | Value                                  |
| -------------- | -------------------------------------- |
| `VPS_HOST`     | VPS IP or hostname                     |
| `VPS_USERNAME` | SSH user                               |
| `VPS_SSH_KEY`  | Private key with access to the VPS     |
| `VPS_PORT`     | SSH port (optional, defaults to 22)    |

Put Nginx (or Caddy) in front of `localhost:3000` with TLS.

## SEO

- Per-page metadata, OpenGraph & Twitter cards, canonical URLs
- Dynamic `sitemap.xml` and `robots.txt`
- Schema.org JSON-LD: `Hotel`, `HotelRoom`, `Restaurant`, `Article`, `BreadcrumbList`
