/**
 * Accessibility checks that need a real layout: colour contrast measured from
 * computed styles, touch-target sizes at a phone width, and focusability.
 *
 *   node scripts/a11y.mjs [baseUrl]
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = process.argv[2] ?? 'http://localhost:4330';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9334;
const PAGES = ['/', '/projects/pathfinder/', '/projects/njord/', '/projects/stm32-udp/', '/projects/pictale/', '/projects/motion-detection/', '/404'];

const profile = mkdtempSync(join(tmpdir(), 'a11y-'));
const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--disable-gpu', '--no-first-run', '--hide-scrollbars', '--window-size=1440,900',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function endpoint() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) return (await r.json()).webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error('no devtools endpoint');
}

const ws = new WebSocket(await endpoint());
await new Promise((r) => ws.addEventListener('open', r, { once: true }));

let msgId = 0;
const pending = new Map();
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? reject(new Error(m.error.message)) : resolve(m.result);
  }
});
const raw = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });

const { targetId } = await raw('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await raw('Target.attachToTarget', { targetId, flatten: true });
const call = (m, p) => raw(m, p, sessionId);
await call('Page.enable');
await call('Runtime.enable');

const AUDIT = `(() => {
  const lin = c => { c/=255; return c <= 0.04045 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); };
  const lum = ([r,g,b]) => 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b);
  const parse = s => (s.match(/[\\d.]+/g) || []).slice(0,4).map(Number);
  const ratio = (a,b) => { const [x,y]=[lum(a),lum(b)]; const hi=Math.max(x,y), lo=Math.min(x,y); return (hi+0.05)/(lo+0.05); };

  function bgOf(el) {
    let n = el;
    while (n && n !== document.documentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c.length === 3 || (c.length === 4 && c[3] > 0.95)) return c.slice(0,3);
      n = n.parentElement;
    }
    return [13,14,16];
  }

  const contrast = [];
  const seen = new Set();
  document.querySelectorAll('body *').forEach(el => {
    const direct = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!direct) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') return;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    if (el.closest('.visually-hidden, .skip-link')) return;
    const fg = parse(cs.color).slice(0,3);
    const bg = bgOf(el);
    const size = parseFloat(cs.fontSize);
    const weight = Number(cs.fontWeight) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;
    const got = ratio(fg, bg);
    const key = cs.color + '|' + bg.join(',') + '|' + Math.round(size) + '|' + large;
    if (seen.has(key)) return;
    seen.add(key);
    contrast.push({
      sample: el.textContent.trim().slice(0, 46),
      cls: String(el.className).slice(0, 34),
      color: cs.color, bg: 'rgb(' + bg.join(', ') + ')',
      size: Math.round(size), weight, large,
      ratio: Math.round(got * 100) / 100, need, pass: got >= need,
    });
  });

  const interactive = [...document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')];
  // WCAG 2.5.8 (Target Size, Minimum) is 24x24 CSS px, with two exceptions that
  // apply here: a target stretched by an absolutely positioned pseudo-element (the
  // whole project record is the hit area), and a link inline in a sentence.
  const stretched = el => {
    const a = getComputedStyle(el, '::after');
    return a.position === 'absolute' && a.content !== 'none' &&
           parseFloat(a.top || '9') === 0 && parseFloat(a.left || '9') === 0;
  };
  const inlineInProse = el => {
    if (getComputedStyle(el).display !== 'inline') return false;
    const p = el.parentElement;
    return !!p && /^(P|LI|TD|DD|SPAN|STRONG|EM)$/.test(p.tagName) &&
           p.textContent.trim().length > el.textContent.trim().length + 4;
  };

  const small = interactive
    .filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 24 || r.width < 24); })
    .filter(el => !el.closest('.skip-link') && !stretched(el) && !inlineInProse(el))
    .map(el => { const r = el.getBoundingClientRect(); return { text: (el.textContent||'').trim().slice(0,34), cls: String(el.className).slice(0,30), w: Math.round(r.width), h: Math.round(r.height) }; });

  // Reported separately: meets WCAG but is below the 44px comfort guideline.
  const belowComfort = interactive
    .filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 44 || r.width < 44); })
    .filter(el => !el.closest('.skip-link') && !stretched(el) && !inlineInProse(el))
    .map(el => { const r = el.getBoundingClientRect(); return { text: (el.textContent||'').trim().slice(0,30), w: Math.round(r.width), h: Math.round(r.height) }; });

  const noName = interactive.filter(el => {
    const t = (el.textContent || '').trim();
    return !t && !el.getAttribute('aria-label') && !el.getAttribute('title') && !el.querySelector('img[alt]:not([alt=""])');
  }).length;

  const landmarks = {
    header: document.querySelectorAll('header').length,
    nav: document.querySelectorAll('nav').length,
    main: document.querySelectorAll('main').length,
    footer: document.querySelectorAll('footer').length,
  };

  return JSON.stringify({
    contrast: contrast.filter(c => !c.pass),
    contrastChecked: contrast.length,
    minRatio: Math.min(...contrast.map(c => c.ratio)),
    smallTargets: small, belowComfort, interactiveCount: interactive.length, noName, landmarks,
  });
})()`;

let failures = 0;
for (const width of [1440, 390]) {
  console.log(`\n================ viewport ${width}px ================`);
  for (const path of PAGES) {
    await call('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 });
    await call('Page.navigate', { url: BASE + path });
    await sleep(900);
    await call('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 });
    await sleep(400);
    const { result } = await call('Runtime.evaluate', { expression: AUDIT, returnByValue: true });
    const r = JSON.parse(result.value);

    const bits = [];
    if (r.contrast.length) { failures += r.contrast.length; bits.push(`${r.contrast.length} CONTRAST FAIL`); }
    if (r.smallTargets.length) { failures += r.smallTargets.length; bits.push(`${r.smallTargets.length} target < 24px`); }
    if (r.belowComfort.length) bits.push(`${r.belowComfort.length} below 44px (advisory)`);
    if (r.noName) { failures += r.noName; bits.push(`${r.noName} unnamed control`); }
    if (r.landmarks.main !== 1 && path !== '/cv') { failures++; bits.push('main landmark != 1'); }

    console.log(
      `  ${path.padEnd(30)} ${String(r.contrastChecked).padStart(3)} text styles · min ${r.minRatio.toFixed(2)}:1 · ` +
      `${r.interactiveCount} controls  ${bits.length ? '⚠ ' + bits.join(', ') : 'OK'}`
    );
    r.contrast.forEach((c) => console.log(`      ✗ ${c.ratio}:1 (needs ${c.need}) ${c.size}px "${c.sample}" [.${c.cls}] ${c.color} on ${c.bg}`));
    r.smallTargets.forEach((t) => console.log(`      ✗ target ${t.w}×${t.h} "${t.text}" [.${t.cls}]`));
    r.belowComfort.forEach((t) => console.log(`      · advisory ${t.w}×${t.h} "${t.text}"`));
    await call('Emulation.clearDeviceMetricsOverride');
  }
}

console.log(`\n--- result --- ${failures === 0 ? 'PASS — no contrast, target-size or naming failures' : failures + ' issue(s)'}`);
ws.close();
chrome.kill();
await sleep(300);
rmSync(profile, { recursive: true, force: true });
if (failures) process.exitCode = 1;
