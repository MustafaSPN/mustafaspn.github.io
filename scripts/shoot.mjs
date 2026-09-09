/**
 * Full-page screenshots at an exact CSS viewport width, driven over the Chrome
 * DevTools Protocol. Headless Chrome clamps --window-size to a 500px minimum, so
 * phone widths have to come from Emulation.setDeviceMetricsOverride.
 *
 *   node scripts/shoot.mjs <baseUrl> <outDir>
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = process.argv[2] ?? 'http://localhost:4330';
const OUT = process.argv[3] ?? './shots';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9333;

const SHOTS = [
  ['home-desktop', '/', 1440, 900, 1],
  ['home-laptop', '/', 1280, 800, 1],
  ['home-tablet', '/', 834, 1112, 1],
  ['home-mobile', '/', 390, 844, 2],
  ['pathfinder-desktop', '/projects/pathfinder/', 1440, 900, 1],
  ['pathfinder-mobile', '/projects/pathfinder/', 390, 844, 2],
  ['njord-desktop', '/projects/njord/', 1440, 900, 1],
  ['stm32-desktop', '/projects/stm32-udp/', 1440, 900, 1],
  ['stm32-mobile', '/projects/stm32-udp/', 390, 844, 2],
  ['pictale-desktop', '/projects/pictale/', 1440, 900, 1],
  ['motion-desktop', '/projects/motion-detection/', 1440, 900, 1],
  ['notfound-desktop', '/404', 1440, 900, 1],
];

mkdirSync(OUT, { recursive: true });
const profile = join(tmpdir(), `shoot-profile-${Date.now()}`);

const chrome = spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  '--disable-gpu',
  '--no-first-run',
  '--hide-scrollbars',
  '--window-size=1600,1000',
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
  throw new Error('Chrome did not expose a debugging endpoint');
}

class Session {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
      }
    });
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params, sessionId }));
    });
  }
}

const wsUrl = await endpoint();
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
const cdp = new Session(ws);

const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
const call = (m, p) => cdp.send(m, p, sessionId);

await call('Page.enable');
await call('Runtime.enable');

for (const [name, path, width, height, dsf] of SHOTS) {
  const metrics = { width, height, deviceScaleFactor: dsf, mobile: width < 768 };

  // Start every shot from a clean renderer: a very tall captureBeyondViewport on the
  // previous page can otherwise leave the emulation override partially applied.
  await call('Page.navigate', { url: 'about:blank' });
  await sleep(250);
  await call('Emulation.clearDeviceMetricsOverride');
  await sleep(150);
  await call('Emulation.setDeviceMetricsOverride', metrics);
  await call('Page.navigate', { url: BASE + path });
  await sleep(1000);
  // Re-assert after navigation: the override does not always survive a commit.
  await call('Emulation.setDeviceMetricsOverride', metrics);
  await sleep(700);

  // Force every reveal to resolve and every lazy image to be requested, then settle.
  await call('Runtime.evaluate', {
    expression: `
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
      document.querySelectorAll('img[loading="lazy"]').forEach(el => el.loading = 'eager');
      window.scrollTo(0, document.body.scrollHeight);
    `,
  });
  await sleep(900);
  await call('Runtime.evaluate', { expression: 'window.scrollTo(0,0)' });
  await sleep(500);

  const { result } = await call('Runtime.evaluate', {
    expression: 'JSON.stringify({w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight,iw:innerWidth})',
    returnByValue: true,
  });
  const dims = JSON.parse(result.value);

  const { data } = await call('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: dims.w, height: dims.h, scale: 1 },
  });

  writeFileSync(join(OUT, `${name}.png`), Buffer.from(data, 'base64'));
  await call('Emulation.clearDeviceMetricsOverride');
  const overflow = dims.w > dims.iw ? `  ⚠ OVERFLOW (scrollWidth ${dims.w} > viewport ${dims.iw})` : '';
  console.log(`${name.padEnd(22)} ${dims.iw}px viewport · ${dims.w}×${dims.h}${overflow}`);
}

ws.close();
chrome.kill();
await sleep(300);
rmSync(profile, { recursive: true, force: true });
console.log('done');
