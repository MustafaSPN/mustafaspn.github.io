// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * Production target is https://sepen.dev, served from GitHub Pages with the custom
 * domain declared in public/CNAME. Both values stay overridable by environment
 * variable so the same source tree can also be published to a github.io user site
 * or to a project site under a sub-path.
 *
 *   Production      SITE_URL=https://sepen.dev                BASE_PATH=          (default)
 *   User site       SITE_URL=https://mustafaspn.github.io     BASE_PATH=
 *   Project site    SITE_URL=https://mustafaspn.github.io     BASE_PATH=/portfolio
 *
 * Every internal href and asset path is written through withBase() in src/lib/paths.ts,
 * so changing BASE_PATH is sufficient — nothing else needs editing.
 */
const SITE_URL = process.env.SITE_URL ?? 'https://sepen.dev';
const BASE_PATH = process.env.BASE_PATH ?? '';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH || undefined,
  trailingSlash: 'ignore',
  output: 'static',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  integrations: [
    // /404 and /cv are not content pages: one is an error document, the other a
    // noindex redirect to the CV PDF.
    sitemap({ filter: (page) => !/\/(404|cv)\/?$/.test(page) }),
  ],
  image: { responsiveStyles: true },
  devToolbar: { enabled: false },
  compressHTML: true,
});
