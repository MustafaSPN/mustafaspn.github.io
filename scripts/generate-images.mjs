/**
 * Generates the two raster assets the site cannot author as SVG-in-HTML:
 * the apple-touch icon and the Open Graph card. Run with `node scripts/generate-images.mjs`.
 */
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const BG = '#0d0e10';
const ACCENT = '#e4572e';
const TEXT = '#e9e7e4';
const MUTED = '#8b8a86';
const RULE = '#26272a';

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "'SF Mono', Menlo, Consolas, monospace";

// --- apple touch icon -------------------------------------------------------
const icon = readFileSync('public/favicon.svg');
await sharp(icon, { density: 720 })
  .resize(180, 180)
  .png()
  .toFile('public/apple-touch-icon.png');

// --- open graph card --------------------------------------------------------
const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${BG}"/>
  <rect x="0" y="0" width="1200" height="1" fill="${RULE}"/>
  <rect x="80" y="104" width="1040" height="1" fill="${RULE}"/>

  <rect x="80" y="76" width="20" height="2" fill="${ACCENT}"/>
  <text x="118" y="88" font-family="${MONO}" font-size="17" letter-spacing="2.4" fill="${MUTED}">ROBOTICS SOFTWARE ENGINEER</text>

  <text x="80" y="290" font-family="${SANS}" font-size="118" font-weight="700" letter-spacing="-5" fill="${TEXT}">Mustafa</text>
  <text x="80" y="400" font-family="${SANS}" font-size="118" font-weight="700" letter-spacing="-5" fill="${TEXT}">Sepen</text>

  <rect x="80" y="462" width="1040" height="1" fill="${RULE}"/>

  <text x="80" y="512" font-family="${MONO}" font-size="21" letter-spacing="0.4" fill="${MUTED}">Autonomous Navigation · Localization · ROS 2</text>
  <text x="80" y="548" font-family="${MONO}" font-size="21" letter-spacing="0.4" fill="${MUTED}">GNSS/RTK · Sensor Fusion · Embedded Systems</text>

  <rect x="80" y="586" width="34" height="2" fill="${ACCENT}"/>
</svg>`;

await sharp(Buffer.from(og)).png({ compressionLevel: 9 }).toFile('public/og.png');

console.log('generated public/apple-touch-icon.png and public/og.png');
