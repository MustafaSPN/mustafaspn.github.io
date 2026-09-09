/**
 * Astro emits the original of every processed image alongside its optimized
 * variants. Nothing references those originals, so they are removed from the
 * build — each one is checked against the generated HTML and CSS first.
 */
import { readdirSync, readFileSync, statSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const DIST = process.argv[2] ?? 'dist';

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    e.isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}

const files = walk(DIST);
const text = files
  .filter((f) => /\.(html|css|js|xml|txt)$/.test(f))
  .map((f) => readFileSync(f, 'utf8'))
  .join('\n');

let freed = 0;
let removed = 0;

for (const f of files) {
  if (!/\/_astro\/.+\.(jpe?g|png)$/i.test(f.split('\\').join('/'))) continue;
  const name = f.split('/').pop();
  if (text.includes(name)) continue;
  freed += statSync(f).size;
  unlinkSync(f);
  removed++;
}

console.log(
  removed
    ? `pruned ${removed} unreferenced image original(s), ${(freed / 1024).toFixed(0)} kB`
    : 'no unreferenced image originals'
);
