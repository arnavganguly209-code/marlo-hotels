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

## Homepage visual editor

- Open `/orbit/homepage`.
- Every current homepage section is loaded with its production copy, images,
  cards, links and settings. On first open, Orbit imports that complete
  snapshot into the `homepage / visual-editor` PostgreSQL content document.
- Use `?section=rooms`, `?section=gallery`, and the other sidebar section keys
  for direct section edit URLs.
- Save & Publish writes the content document and all media placements in one
  transaction, then revalidates the public homepage.
- Current media originals remain unchanged. Focal-point changes affect display
  only; crop operations create a versioned derivative in the Media Library.

## Homepage round-trip test

Run only against local or staging because it temporarily changes and restores
each section:

```bash
ORBIT_TEST_BASE_URL=http://localhost:3000 \
ORBIT_TEST_COOKIE="orbit_session=..." \
ORBIT_TEST_ALLOW_WRITE=1 \
npm run test:homepage
```

The test saves, refreshes, checks PostgreSQL, requests the public homepage, and
restores the original content for every registered section.
