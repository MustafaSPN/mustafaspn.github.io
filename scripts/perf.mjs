/**
 * First-load weight and paint timings per page, measured over the DevTools
 * Protocol against the production build with a cold cache.
 *
 *   node scripts/perf.mjs [baseUrl]
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = process.argv[2] ?? 'http://localhost:4330';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9335;
const PAGES = ['/', '/projects/pathfinder/', '/projects/njord/', '/projects/stm32-udp/', '/projects/pictale/', '/projects/motion-detection/'];

const profile = mkdtempSync(join(tmpdir(), 'perf-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--disable-gpu', '--no-first-run', '--hide-scrollbars', '--window-size=1440,900'], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function endpoint() {
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) return (await r.json()).webSocketDebuggerUrl; } catch {}
    await sleep(250);
  }
  throw new Error('no devtools endpoint');
}

const ws = new WebSocket(await endpoint());
await new Promise((r) => ws.addEventListener('open', r, { once: true }));

let msgId = 0;
const pending = new Map();
const events = [];
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id); pending.delete(m.id);
    m.error ? reject(new Error(m.error.message)) : resolve(m.result);
  } else if (m.method) events.push(m);
});
const raw = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
  const id = ++msgId; pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params, sessionId }));
});

const { targetId } = await raw('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await raw('Target.attachToTarget', { targetId, flatten: true });
const call = (m, p) => raw(m, p, sessionId);

await call('Page.enable');
await call('Network.enable');
await call('Runtime.enable');
await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

const kb = (n) => (n / 1024).toFixed(0).padStart(5) + ' kB';

console.log('page                              requests   transferred   by type');
console.log('-'.repeat(96));

const totals = [];
for (const path of PAGES) {
  await call('Network.clearBrowserCache');
  await call('Network.setCacheDisabled', { cacheDisabled: true });
  events.length = 0;

  await call('Page.navigate', { url: BASE + path });
  await sleep(2600);

  const finished = events.filter((e) => e.method === 'Network.loadingFinished');
  const responses = new Map(
    events.filter((e) => e.method === 'Network.responseReceived')
      .map((e) => [e.params.requestId, e.params.response])
  );

  let bytes = 0;
  const byType = {};
  for (const f of finished) {
    const res = responses.get(f.params.requestId);
    if (!res) continue;
    const len = f.params.encodedDataLength || 0;
    bytes += len;
    const url = res.url;
    const type =
      /\.(woff2?|ttf)/.test(url) ? 'font' :
      /\.(webp|png|jpe?g|svg|avif)/.test(url) ? 'image' :
      /\.mp4/.test(url) ? 'video' :
      /\.css/.test(url) ? 'css' :
      /\.js/.test(url) ? 'js' : 'html';
    byType[type] = (byType[type] ?? 0) + len;
  }

  const { result } = await call('Runtime.evaluate', {
    expression: `JSON.stringify((() => {
      const nav = performance.getEntriesByType('navigation')[0] || {};
      const fcp = performance.getEntriesByName('first-contentful-paint')[0];
      const lcp = performance.getEntriesByType('largest-contentful-paint').pop();
      return {
        dcl: Math.round(nav.domContentLoadedEventEnd || 0),
        load: Math.round(nav.loadEventEnd || 0),
        fcp: fcp ? Math.round(fcp.startTime) : null,
        lcp: lcp ? Math.round(lcp.startTime) : null,
      };
    })())`,
    returnByValue: true,
  });
  const t = JSON.parse(result.value);

  const typeStr = Object.entries(byType).sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k} ${(v / 1024).toFixed(0)}kB`).join(' · ');

  console.log(`${path.padEnd(32)} ${String(finished.length).padStart(6)}   ${kb(bytes)}   ${typeStr}`);
  totals.push({ path, bytes, requests: finished.length, ...t });
}

console.log('\npage                              FCP     LCP     DOMContentLoaded   load');
console.log('-'.repeat(96));
for (const t of totals) {
  console.log(
    `${t.path.padEnd(32)} ${String(t.fcp ?? '-').padStart(4)}ms  ${String(t.lcp ?? '-').padStart(4)}ms  ` +
    `${String(t.dcl).padStart(12)}ms   ${String(t.load).padStart(4)}ms`
  );
}
console.log(`\nheaviest first load: ${(Math.max(...totals.map(t => t.bytes)) / 1024).toFixed(0)} kB`);
console.log('(local server, cache disabled, 1440x900, video preload="metadata")');

ws.close(); chrome.kill(); await sleep(300);
rmSync(profile, { recursive: true, force: true });
