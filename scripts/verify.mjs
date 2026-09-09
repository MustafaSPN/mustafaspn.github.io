/**
 * Post-build verification: internal links, assets, media, and a set of
 * accessibility checks over the generated HTML.
 *
 *   node scripts/verify.mjs [distDir]
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative, posix } from 'node:path';

const DIST = process.argv[2] ?? 'dist';
const problems = [];
const notes = [];
const fail = (m) => problems.push(m);

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    e.isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}

const files = walk(DIST);
const html = files.filter((f) => f.endsWith('.html'));
const assets = new Set(files.map((f) => '/' + relative(DIST, f).split('\\').join('/')));

const attrs = (tag) => {
  const o = {};
  for (const m of tag.matchAll(/([a-zA-Z-]+)\s*=\s*"([^"]*)"/g)) o[m[1]] = m[2];
  for (const m of tag.matchAll(/([a-zA-Z-]+)\s*=\s*'([^']*)'/g)) if (!(m[1] in o)) o[m[1]] = m[2];
  return o;
};

const externals = new Set();
let imgCount = 0;
let videoCount = 0;

for (const file of html) {
  const rel = '/' + relative(DIST, file).split('\\').join('/');
  const page = rel.replace(/index\.html$/, '').replace(/\.html$/, '');
  const doc = readFileSync(file, 'utf8');

  // A redirect stub is a meta-refresh plus a single fallback link (see src/pages/cv.astro).
  // It is not a document a reader lands on, so the document-level requirements below
  // do not apply to it.
  if (/<meta http-equiv="refresh"/i.test(doc)) {
    notes.push(`${page}: redirect stub (skipped document checks)`);
    continue;
  }

  // ---------- document-level ----------
  if (!/<html[^>]+lang="/.test(doc)) fail(`${page}: <html> has no lang attribute`);
  if (!/<title>[^<]+<\/title>/.test(doc)) fail(`${page}: missing or empty <title>`);
  if (!/<meta name="description" content="[^"]+"/.test(doc)) fail(`${page}: missing meta description`);
  if (!/rel="canonical"/.test(doc)) fail(`${page}: missing canonical link`);
  if (!/property="og:image"/.test(doc)) fail(`${page}: missing og:image`);
  if (!/class="skip-link"/.test(doc)) fail(`${page}: missing skip link`);

  const h1s = [...doc.matchAll(/<h1[\s>]/g)].length;
  if (h1s !== 1) fail(`${page}: expected exactly one <h1>, found ${h1s}`);

  // ---------- heading order ----------
  const levels = [...doc.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] - levels[i - 1] > 1) {
      fail(`${page}: heading level jumps from h${levels[i - 1]} to h${levels[i]}`);
      break;
    }
  }

  // ---------- duplicate ids ----------
  const ids = [...doc.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dupes = ids.filter((v, i) => ids.indexOf(v) !== i);
  if (dupes.length) fail(`${page}: duplicate id(s): ${[...new Set(dupes)].join(', ')}`);

  // ---------- images ----------
  for (const m of doc.matchAll(/<img\b[^>]*>/g)) {
    imgCount++;
    const a = attrs(m[0]);
    if (a.alt === undefined) fail(`${page}: <img src="${a.src}"> has no alt attribute`);
    if (!a.width || !a.height) fail(`${page}: <img src="${a.src}"> has no intrinsic width/height`);
    for (const src of [a.src, ...(a.srcset ?? '').split(',').map((s) => s.trim().split(/\s+/)[0])]) {
      if (!src || src.startsWith('http') || src.startsWith('data:')) continue;
      if (!assets.has(src.split('?')[0])) fail(`${page}: missing image asset ${src}`);
    }
  }

  // ---------- video ----------
  for (const m of doc.matchAll(/<video\b[^>]*>/g)) {
    videoCount++;
    const a = attrs(m[0]);
    if (!a.poster) fail(`${page}: <video> without a poster frame`);
    if (a.poster && !assets.has(a.poster.split('?')[0])) fail(`${page}: missing poster ${a.poster}`);
    if (!('aria-label' in a) && !('title' in a)) fail(`${page}: <video> has no accessible name`);
  }
  for (const m of doc.matchAll(/<source\b[^>]*>/g)) {
    const a = attrs(m[0]);
    if (a.src && !a.src.startsWith('http') && !assets.has(a.src.split('?')[0])) {
      fail(`${page}: missing video source ${a.src}`);
    }
  }

  // ---------- links ----------
  for (const m of doc.matchAll(/<a\b[^>]*>/g)) {
    const a = attrs(m[0]);
    const href = a.href;
    if (!href) { fail(`${page}: <a> without href`); continue; }

    if (/^https?:\/\//.test(href)) {
      externals.add(href);
      if (a.target === '_blank' && !/noopener/.test(a.rel ?? '')) {
        fail(`${page}: target="_blank" without rel="noopener": ${href}`);
      }
      continue;
    }
    if (href.startsWith('mailto:') || href.startsWith('#')) continue;

    const clean = href.split('#')[0].split('?')[0];
    if (!clean) continue;
    const candidates = [clean, posix.join(clean, 'index.html'), clean + '.html', clean + '/index.html'];
    const ok = candidates.some((c) => assets.has(c) || existsSync(join(DIST, c)));
    if (!ok) fail(`${page}: broken internal link ${href}`);
  }

  // ---------- fragment targets ----------
  for (const m of doc.matchAll(/href="(#[^"]+)"/g)) {
    const id = m[1].slice(1);
    if (id && !ids.includes(id)) fail(`${page}: fragment ${m[1]} has no matching id`);
  }

  // ---------- design invariants ----------
  const css = doc.match(/<style>([\s\S]*?)<\/style>/g)?.join('') ?? '';
  if (/backdrop-filter/.test(css)) fail(`${page}: backdrop-filter present (glassmorphism)`);
  if (/box-shadow\s*:\s*(?!none)/.test(css)) fail(`${page}: box-shadow present`);
  if (/linear-gradient|radial-gradient/.test(css)) fail(`${page}: gradient present`);
}

// ---------- stylesheet invariants ----------
for (const css of files.filter((f) => f.endsWith('.css'))) {
  const t = readFileSync(css, 'utf8');
  if (/backdrop-filter/.test(t)) fail(`${css}: backdrop-filter`);
  if (/box-shadow\s*:\s*(?!none)/.test(t)) fail(`${css}: box-shadow`);
  if (/(linear|radial)-gradient/.test(t)) fail(`${css}: gradient`);
  const radii = [...t.matchAll(/border-radius:\s*([0-9.]+)px/g)].map((m) => Number(m[1]));
  const big = radii.filter((r) => r > 2);
  if (big.length) fail(`${css}: border-radius above 2px: ${[...new Set(big)].join(', ')}px`);
}

// ---------- payload ----------
const total = files.reduce((n, f) => n + statSync(f).size, 0);
const byExt = {};
for (const f of files) {
  const ext = f.split('.').pop();
  byExt[ext] = (byExt[ext] ?? 0) + statSync(f).size;
}

notes.push(`${html.length} pages · ${imgCount} <img> · ${videoCount} <video>`);
notes.push(`build size ${(total / 1e6).toFixed(2)} MB total`);
notes.push(
  'by type: ' +
    Object.entries(byExt)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([e, s]) => `${e} ${(s / 1024).toFixed(0)}kB`)
      .join(' · ')
);

console.log('--- notes ---');
notes.forEach((n) => console.log('  ' + n));
console.log('\n--- external links referenced ---');
[...externals].sort().forEach((u) => console.log('  ' + u));
console.log('\n--- result ---');
if (problems.length === 0) {
  console.log('  PASS — no problems found');
} else {
  problems.forEach((p) => console.log('  ✗ ' + p));
  console.log(`\n  ${problems.length} problem(s)`);
  process.exitCode = 1;
}
