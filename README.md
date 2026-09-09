# mustafa-sepen-portfolio

Personal portfolio site — Mustafa Sepen, Robotics Software Engineer.

Static site built with Astro, TypeScript and plain CSS. No UI framework, no client-side
router, roughly 30 lines of JavaScript in total (entrance reveals and a reduced-motion
guard for the demo clips).

See [DESIGN.md](DESIGN.md) for the design system and the reasoning behind it.

## Requirements

Node 20 or newer.

## Commands

```bash
npm install        # install dependencies
npm run dev        # local dev server on http://localhost:4321
npm run build      # production build into dist/
npm run preview    # serve the built site
npm run check      # TypeScript and Astro diagnostics
```

## Deployment targets

The deployment target is set by two environment variables, read in
[`astro.config.mjs`](astro.config.mjs). Every internal link and asset path goes through
`withBase()` in [`src/lib/paths.ts`](src/lib/paths.ts), so changing the base is the only
change required.

| Target | `SITE_URL` | `BASE_PATH` | Extra |
|---|---|---|---|
| **Production — `sepen.dev`** | `https://sepen.dev` | *(empty)* | `public/CNAME` (present) |
| User site — `mustafaspn.github.io` | `https://mustafaspn.github.io` | *(empty)* | remove `public/CNAME` |
| Project site — `mustafaspn.github.io/portfolio/` | `https://mustafaspn.github.io` | `/portfolio` | remove `public/CNAME` |

Production is the default: `astro.config.mjs` falls back to `https://sepen.dev`, and
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) sets the same value
explicitly. `public/CNAME` declares the custom domain to GitHub Pages and has no effect
until Pages is enabled.

Nothing is published yet. To publish: push the repository, set
**Settings → Pages → Build and deployment → Source** to **GitHub Actions**, then point
`sepen.dev` at GitHub Pages in DNS (four `A` records for the apex, or a `CNAME` for
`www`), and enable *Enforce HTTPS* once the certificate is issued.

## Layout

```
src/
  assets/media/     photography and diagrams, processed by the Astro image pipeline
  components/       nine components, one job each
  data/
    site.ts         identity, contact links, navigation
    projects.ts     project records — ordering, numbering and routing derive from here
  layouts/          BaseLayout, CaseStudyLayout
  lib/paths.ts      withBase() / absoluteUrl()
  pages/            routes
  styles/global.css design tokens and the shared system
public/
  media/            demo clips (MP4) and poster frames
  mustafa-sepen-cv.pdf   sanitized public CV — see scripts/build-public-cv.py
  CNAME             custom domain for GitHub Pages
scripts/
  generate-images.mjs   favicon raster and Open Graph card
  shoot.mjs             full-page screenshots over the DevTools Protocol
```

## Content

Project ordering, display numbering, the homepage records and the sitemap all derive from
the `projects` array in [`src/data/projects.ts`](src/data/projects.ts). Setting a project's
`published` field to `false` removes it from the site entirely — page, card, navigation and
sitemap — and renumbers the rest automatically.

Long-form case-study prose lives in the page files under `src/pages/projects/`.

## Regenerating assets

```bash
node scripts/generate-images.mjs                       # favicon PNG + og.png
node scripts/shoot.mjs http://localhost:4330 ./shots   # screenshots (needs `npm run preview`)
```

The public CV is generated from the private source CV rather than edited by hand, so the
sanitization is repeatable:

```bash
python3 scripts/build-public-cv.py <private-cv.pdf> public/mustafa-sepen-cv.pdf
```

It rewrites exactly one text run — the header contact line — to drop the personal phone
number and add sepen.dev, GitHub and LinkedIn as clickable links. Every other text run,
font, position and page is copied through unchanged, and the source file is opened
read-only.

Demo clips were transcoded from the source repositories' GIFs with ffmpeg:

```bash
ffmpeg -i demo.gif -movflags +faststart -pix_fmt yuv420p \
  -vf "hqdn3d=3:3:6:6,scale=trunc(iw/2)*2:trunc(ih/2)*2" \
  -c:v libx264 -preset veryslow -crf 26 -an demo.mp4
```
