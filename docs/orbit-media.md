# Orbit Visual Media CMS

## Storage

- Metadata and placements live in PostgreSQL (`MediaAsset`, `MediaVersion`, `MediaPlacement`, `MediaFolder`).
- Original bytes are stored unchanged on disk (no automatic recompression).
- Local default path: `public/media`
- Production path: set `ORBIT_UPLOAD_DIR=/srv/marlo-media` and alias `/media/` in Nginx.

## Instant updates

Saving content or placements:

1. Writes PostgreSQL immediately
2. Calls `revalidatePath("/")` and `revalidateTag("media")`
3. Serves a new immutable media URL per version

No rebuild or PM2 restart is required for media/content changes.

## Seed

```bash
npm run media:seed
```

Imports the reception hero, logos, and page-hero fallbacks into placements.

## Smoke test

```bash
npm run test:media
```

## Hero workflow

1. Open `/orbit/media-library`
2. Upload or select an image
3. Click **Use as Hero** / **Set homepage hero**
4. Refresh `/` — the hero updates within seconds
