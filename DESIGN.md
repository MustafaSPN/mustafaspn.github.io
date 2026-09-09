# Design System — Mustafa Sepen, Robotics Software Engineer

Version 1.0 · Design decisions, rules and rationale for the portfolio site.

---

## 1. Visual direction

**Concept: the field log.**

The site borrows its visual language from the documents that surround real robotics
work — datasheets, drawing sheets, calibration logs, instrument readouts — rather than
from product marketing sites. The reference points are technical documentation and
industrial design, not SaaS landing pages.

Three ideas carry it:

1. **The sheet.** Content sits on a ruled sheet. Full-bleed hairlines divide sections,
   and each rule carries a small monospace label the way a drawing sheet carries a
   revision block. Structure comes from lines and alignment, never from floating cards.

2. **The index rail.** Long-form content is set in two columns: a narrow left rail of
   monospace metadata (project number, year, platform, role, status) against a wide
   reading column. This is the spec-sheet posture, and it does most of the work of
   making the site feel engineered rather than generated.

3. **The record, not the card.** Projects are records in a list — numbered, ruled,
   full-bleed media, no container chrome. Nothing has a shadow. Nothing floats.

**Tone.** Restrained, quiet, dense with real detail. The page should reward reading.
Every number on the site traces to a public repository, a linked competition result, or
the CV; anything unverifiable is absent rather than softened.

---

## 2. How this avoids the generic AI-portfolio look

The default machine-generated portfolio has a recognisable signature. Each of its
markers is refused here deliberately, and something specific is put in its place.

| Generic marker | What this site does instead |
|---|---|
| Purple/blue gradient background, gradient blobs | Flat near-black sheet. Zero gradients anywhere in the stylesheet. |
| Glassmorphism, blur, glow | Opaque surfaces, 1px hairline borders, no `backdrop-filter`, no `box-shadow` in the entire codebase. |
| Giant rounded cards, uniform bento grid | Radius capped at 2px. Projects are ruled records with full-bleed media, laid out in four *different* templates. |
| Neon cyberpunk accent, multi-colour palette | One accent (`#E4572E`, hazard orange) used on roughly 2% of the surface — rules, numerals, arrows, hover states. Never a background fill for a large area. |
| "Hi, I am Mustafa" plus a waving-hand emoji, typing animation | Hero is a name, a role, a discipline line and one factual sentence. No greeting, no emoji anywhere on the site, no typing effect. |
| Skill bars, percentage rings, floating tech logos | Capability map: four named domains, plain lists, no metrics attached to skills. No logos. |
| Fake terminal windows, animated code backgrounds, particles | Real architecture diagrams exported from the repositories, real hardware photography, real measurement tables. |
| Stock robotics imagery | Every photograph and clip is Mustafa's own hardware, taken from the public repositories. |
| Uniform card grid, everything the same size | Deliberate hierarchy: the three flagship projects get 2–4× the vertical space of the secondary two. |
| Constant motion, parallax, scroll hijack, cursor effects | One 500ms entrance fade per section, one image scale on hover. ~30 lines of JavaScript on the whole site. |
| "Passionate about building the future" | Sentences about track separation, EKF frame topology, and packet loss. |

The deeper defence is **specificity**. Generic portfolios are generic because they say
nothing that could only be true of one person. This site's homepage names the yaw-priority
velocity budget on a skid-steer platform, the separation of relative gyro yaw from
absolute GNSS heading across two filters, and a 300 µs measured round-trip. Copy like
that cannot be transplanted onto another portfolio.

---

## 3. Colour system

Dark only. No light theme — the site commits to one look and paints every value
explicitly, so it never borrows a host background.

### Tokens

| Token | Value | Role |
|---|---|---|
| `--bg` | `#0D0E10` | Page ground. Near-black with a trace of blue-grey. Never `#000`. |
| `--bg-raised` | `#131417` | Media wells, tables, inset blocks. |
| `--bg-sunken` | `#0A0B0C` | Footer and the deepest layer. |
| `--text` | `#E9E7E4` | Primary text. Warm off-white, reads as paper rather than screen white. |
| `--text-secondary` | `#A8A7A3` | Body prose in secondary position, table cells. |
| `--text-muted` | `#8B8A86` | Monospace metadata, captions, labels. |
| `--rule` | `#26272A` | Hairline borders and section rules. |
| `--rule-strong` | `#35363A` | Hover/active state of a rule. |
| `--accent` | `#E4572E` | The single accent. |
| `--accent-wash` | `rgba(228, 87, 46, 0.12)` | Accent at low alpha for rules and marks only. |

### Contrast (measured, WCAG 2.1)

| Pair | Ratio | Requirement |
|---|---|---|
| `--text` on `--bg` | 15.65 : 1 | AAA |
| `--text-secondary` on `--bg` | 7.44 : 1 | AAA |
| `--text-muted` on `--bg` | 5.19 : 1 | AA (all sizes) |
| `--accent` on `--bg` | 5.24 : 1 | AA (all sizes) |
| `--text` on `--bg-raised` | 14.92 : 1 | AAA |

Every colour that carries text meets AA at any size. `--rule` is decorative only and
carries no information that is not also conveyed by layout.

### Accent discipline

The accent appears in exactly six places and nowhere else:

1. The project number on a hovered/focused project record.
2. The 1px rule that grows under a link on hover.
3. The `↗` external-link glyph.
4. The active navigation marker.
5. Focus rings.
6. Measurement values in the STM32 results table.

It is never a background fill wider than 2px, never a heading colour, never a gradient
stop.

---

## 4. Typography

### Families

| Role | Family | Weights | Use |
|---|---|---|---|
| Display | **Archivo** (variable) | 500, 600, 700 | Name, section titles, project titles, large numerals. Signage-derived grotesque with a slightly condensed set width — it holds up at 100px+ and never reads as a default UI font. |
| Body | **IBM Plex Sans** | 400, 500 | All prose. Drawn for an engineering company; the distinctive `a`, `g` and `l` give paragraphs character that Inter does not. |
| Mono | **IBM Plex Mono** | 400, 500 | Metadata, labels, numbers, units, table headers, technology tags. |

All three are self-hosted via `@fontsource` (latin subset, woff2, `font-display: swap`).
No external font requests — no third-party connection, no layout shift from a CDN, and
the site keeps working offline and behind a firewall.

**Monospace is never used for running prose.** Its job is metadata, and using it for a
paragraph would read as a fake terminal.

### Scale

A fluid scale using `clamp()`, tuned so that mobile is designed rather than shrunk.

| Step | Size | Tracking | Leading | Use |
|---|---|---|---|---|
| `--fs-hero` | `clamp(2.75rem, 11vw, 8.5rem)` | `-0.04em` | 0.92 | The name in the hero |
| `--fs-display` | `clamp(2rem, 5.2vw, 3.9rem)` | `-0.03em` | 1.02 | Project titles, case-study H1 |
| `--fs-h2` | `clamp(1.5rem, 3.2vw, 2.35rem)` | `-0.02em` | 1.1 | Section headings |
| `--fs-h3` | `clamp(1.15rem, 2vw, 1.5rem)` | `-0.01em` | 1.2 | Sub-headings, vehicle titles |
| `--fs-lead` | `clamp(1.06rem, 1.55vw, 1.3rem)` | `-0.005em` | 1.55 | Standfirst paragraphs |
| `--fs-body` | `1rem` / `1.0625rem` ≥1024px | `0` | 1.68 | Prose |
| `--fs-small` | `0.875rem` | `0` | 1.55 | Captions, secondary rows |
| `--fs-label` | `0.6875rem` | `0.12em` | 1.3 | Mono section labels, uppercase |

**Measure.** Prose columns are capped at `68ch`. Lead paragraphs at `56ch`. No line of
body text ever runs the full width of a 1440px viewport.

### Mono label convention

Small labels are uppercase, `0.12em` tracked, `--text-muted`, and where they sit on a
section rule they are preceded by a two-digit index (`01 / SELECTED WORK`). This is the
single most load-bearing typographic device on the site: it reads as a document section
marker, not as a web heading.

---

## 5. Spacing and grid

### Spacing scale

An 8px base with a small set of steps. No arbitrary values in components.

`--s1 4px` · `--s2 8px` · `--s3 12px` · `--s4 16px` · `--s5 24px` · `--s6 32px`
· `--s7 48px` · `--s8 64px` · `--s9 96px` · `--s10 128px` · `--s11 160px`

Section rhythm uses a fluid step: `--section-y: clamp(64px, 9vw, 144px)`.
Generous whitespace is a requirement, not a side effect — sections are separated by more
space than feels comfortable at first, which is what makes the hairlines readable as
structure.

### Grid

- **Shell:** `max-width: 1440px`, centred, with `--gutter: clamp(20px, 5vw, 72px)`.
- **Column system:** a 12-column CSS grid, `column-gap: clamp(16px, 2.4vw, 40px)`.
- **Index rail layout:** `grid-template-columns: minmax(0, 3fr) minmax(0, 9fr)` above
  1024px, collapsing to a single column below. The rail holds mono metadata and becomes
  `position: sticky` on case-study pages.
- **Full-bleed:** media in project records breaks the shell using a
  `grid-column: 1 / -1` full-bleed utility, so photographs run edge to edge while text
  stays on the measure.

---

## 6. Component system

Deliberately small. Nine components, each with one job.

| Component | Responsibility |
|---|---|
| `BaseLayout` | `<head>`, metadata, fonts, skip link, header, footer, global CSS. |
| `SiteHeader` | Sticky hairline nav. Responsive without JavaScript. |
| `SiteFooter` | Contact block, external links, colophon. |
| `SectionRule` | The ruled section header: `NN / LABEL` sitting on a full-bleed hairline. |
| `ProjectRecord` | A homepage project entry. Takes a `variant` prop selecting one of four layouts. |
| `MetaRail` | The mono metadata rail (`term`/`value` pairs), sticky on case-study pages. |
| `Figure` | Media + caption, handling `<img>` and `<video>` with poster and reduced-motion pausing. |
| `SpecTable` | Bordered data table with mono headers, horizontally scrollable on small screens. |
| `ExternalLink` | Anchor with `↗`, `rel="noopener noreferrer"`, and an accessible name. |

**Content is data-driven.** All project facts live in `src/data/projects.ts` as typed
objects. Homepage ordering, numbering, navigation and the sitemap are all derived from
that array, so publishing or withholding a project is a one-field change and the
numbering re-flows automatically.

---

## 7. Page architecture

```
/                              Home
/projects/pathfinder           Case study — flagship
/projects/njord                Case study
/projects/stm32-udp            Case study
/projects/pictale              Case study
/projects/motion-detection     Case study
/cv                            Stable CV URL — forwards to the PDF (a page, not an
                               astro.config redirect, so the target passes through
                               withBase() and stays correct under a base path)
/404                           Not found
robots.txt · sitemap-index.xml · og image · favicon
```

### Home

1. **Nav** — sticky, 56px, hairline bottom border.
2. **Hero** — name at display scale, role, discipline line in mono, one factual sentence,
   primary CTA plus external links. No illustration.
3. **Selected work** — the load-bearing section. Five records, four layouts.
4. **Experience** — four ruled rows, role / organisation / period / two lines of scope.
5. **Engineering focus** — four capability domains in a 4-column ruled grid.
6. **About** — two short paragraphs on the boundary between software and vehicle.
7. **Contact** — one line, three links.

### Case study template

Fixed section order, so a reader who has read one can navigate the next by memory:

```
Header        number · title · one-line description · MetaRail (role, year, platform, stack)
Hero media    full-bleed photograph or diagram
The problem   what was actually hard
The system    how it fits together
Architecture  exported diagram from the repository
Engineering work   what Mustafa implemented, specifically
Key challenge      the technically interesting part, in depth
Result             measured where measurements exist; scope limits stated where they do not
Field / media      photographs and clips
Tech stack         SpecTable
Source             repository link
```

Pathfinder additionally nests three vehicle sub-sections (Tracked / 4×4 / RC Crawler),
each with its own hero clip, spec table and challenge — sharing the template one level
down.

---

## 8. Responsive behaviour

Breakpoints: `560px`, `768px`, `1024px`, `1280px`.

Mobile is designed, not stacked. The specific decisions:

- **Navigation.** No hamburger, no JavaScript. Below 768px the nav shows the wordmark,
  `Work` and `CV`; `Experience`, `About`, GitHub and LinkedIn are reachable from the
  footer, which is always one scroll away. Above 768px the full set appears.
- **Hero.** Type scales to `11vw`, the discipline line wraps to two lines with `·`
  separators preserved, and the CTA row becomes full-width stacked buttons at ≥44px
  touch height.
- **Project records.** The four desktop variants collapse to one mobile pattern —
  *number and title, then the photograph, then the text* — so the reader knows what they
  are looking at before the image arrives. Text never sits beside media below 1024px.
- **The flagship photograph runs edge to edge on a phone,** breaking the gutter with a
  negative margin and dropping its side borders, so the vehicle is not squeezed into a
  350px column.
- **Media proportions change by breakpoint,** they do not letterbox: a photograph's own
  aspect on desktop becomes a `4:3` crop on mobile, so the vehicle stays large.
- **The index rail** stops being sticky and becomes a horizontal ruled metadata block
  above the prose.
- **Tables** scroll horizontally inside `overflow-x: auto` with a hairline edge
  indicator; the page body never scrolls sideways.
- **Touch targets** are ≥44×44px throughout.

---

## 9. Interaction rules

The site has approximately 30 lines of JavaScript in total: one IntersectionObserver for
entrance reveals and one reduced-motion video guard. There is no framework, no hydration,
no client-side routing.

**Allowed**

| Interaction | Specification |
|---|---|
| Section entrance | `opacity 0→1`, `translateY(14px→0)`, 520ms `cubic-bezier(.22,.61,.36,1)`, fires once at 12% visibility. |
| Project media hover | `scale(1 → 1.03)`, 640ms, inside `overflow: hidden`. Desktop pointer only. |
| Link underline | 1px rule grows left→right, 240ms, via `background-size`. Never a colour flash. |
| Project record hover | Its rule lifts `--rule` → `--rule-strong`; the number turns accent. |
| Sticky metadata | Pure CSS `position: sticky` on case-study rails. |

**Forbidden**

Scroll hijacking · parallax · cursor effects · loading screens · 3D transforms ·
animated backgrounds · anything that moves without user input after first paint.

**Reduced motion.** Under `prefers-reduced-motion: reduce`, all transitions and
animations are reduced to `0.01ms`, entrance reveals resolve to their final state
immediately, and demo videos are paused with controls exposed so the user can start them
deliberately.

**Focus.** A 2px `--accent` outline with a 2px offset on every interactive element, never
removed. A skip link precedes the header. Focus order follows source order.

---

## 10. Media policy

- Every photograph and clip is Mustafa's own hardware, sourced from the public
  repositories. No stock imagery.
- Repository GIFs (17 MB in total) are transcoded to MP4/H.264 with light denoising to
  remove GIF dithering, plus a JPEG poster frame — 17 MB of demo media becomes 4.2 MB
  with no loss of content. A single codec is used rather than an MP4/WebM pair, because
  H.264 is universally supported and the second encode would double the deployed weight
  for no reach.
- **Clips are not downloaded until they are needed.** Each `<video>` ships with
  `preload="none"` and its URL in `data-src`; an IntersectionObserver attaches the source
  and starts playback 300px before the clip enters the viewport, and pauses it when it
  leaves. Without this the Pathfinder page's four clips cost 3.5 MB on first load; with
  it the page costs 539 kB and the clips arrive as they are reached.
- Video is `muted loop playsinline`. Under reduced motion nothing plays: the clips are
  paused at frame zero and native controls are exposed so the reader can start one
  deliberately.
- Every clip carries an `aria-label` describing what the vehicle is doing, and a poster
  frame so the layout never reflows.
- Raster photographs are processed by Astro's built-in image pipeline to AVIF/WebP at
  multiple widths, with explicit `width`/`height` to reserve layout space.
- Architecture diagrams use each repository's exported **dark** variant, which matches
  the site ground.
- Every image has a real alt description of what the hardware is doing. Decorative rules
  and glyphs are `aria-hidden`.

---

## 11. Content rules

Binding constraints, enforced in review:

1. No invented numbers, dates, responsibilities, hardware, results or capabilities.
   Every claim traces to a public repository, the linked competition result page, or
   the CV.
2. Repository scope limitations are carried across verbatim in substance — in
   particular: Pathfinder performs no SLAM, no simulation and no autonomous obstacle
   avoidance, and its LiDAR is a visualisation feed only.
3. Njord is described as team work. Individual contributions are stated only where the
   repository's own contribution evidence supports them, and the competition placing is
   not used to imply that any subsystem ran successfully.
4. Motion Detection carries no CPU-vs-GPU speed claim; its metrics are labelled as
   recorded, not reproduced.
5. Pictale is framed as evidence of shipping a complete product, not as professional
   direction. It is placed after the robotics work and given less space.
6. No marketing register: no "passionate", "crafting", "building the future", no emoji,
   no exclamation marks.
7. No AI or tooling attribution anywhere in source, metadata, documentation or commits.

---

## 12. Deployment posture

Static output, built for GitHub Pages. Production is the custom domain **sepen.dev**;
the base path stays parameterised so the same source also deploys to a user site or a
project site by changing two environment variables:

| Target | `SITE_URL` | `BASE_PATH` |
|---|---|---|
| **Production — `sepen.dev`** | `https://sepen.dev` | *(empty)*, with `public/CNAME` |
| User site | `https://mustafaspn.github.io` | *(empty)* |
| Project site | `https://mustafaspn.github.io` | `/portfolio` |

Every internal link and asset path goes through a `withBase()` helper, so no hard-coded
absolute path can break when the base changes. This is verified, not assumed: a build
with `BASE_PATH=/portfolio` prefixes every `href`, `src`, `poster`, canonical URL,
Open Graph image, sitemap entry and the CV redirect target.

---

## 13. Verification

Four scripts under `scripts/` check that the rules above actually hold in the build,
rather than only in this document.

| Script | Checks |
|---|---|
| `verify.mjs` | Internal links and fragments resolve · every image and video asset exists · every `<img>` has an alt and intrinsic dimensions · every `<video>` has a poster and an accessible name · one `<h1>` per page · no heading-level skips · no duplicate ids · `lang`, title, description, canonical, `og:image` and skip link present · `target="_blank"` always paired with `rel="noopener"` · **and the design invariants: no gradient, no `box-shadow`, no `backdrop-filter`, no `border-radius` above 2px anywhere in the emitted CSS.** |
| `a11y.mjs` | Colour contrast computed from real rendered styles for every distinct text style on every page, at 1440px and 390px, against the actual painted background · target sizes against WCAG 2.5.8, modelling both relevant exceptions (a target stretched by an absolutely positioned pseudo-element, and a link inline in a sentence) · accessible names on every control · landmark structure. |
| `perf.mjs` | First-load request count, transferred bytes by type, and paint timings per page with the cache disabled. |
| `shoot.mjs` | Full-page screenshots at an exact CSS viewport width over the DevTools Protocol, and reports any page whose `scrollWidth` exceeds its viewport. |

Measured results at the time of writing: contrast passes on every page at both widths
with a minimum ratio of 5.00:1; no WCAG target-size failures; no horizontal overflow at
any tested width; heaviest first load 897 kB.
