import type { APIRoute } from 'astro';
import { withBase } from '../lib/paths';

/** Generated so the sitemap URL follows SITE_URL and BASE_PATH automatically. */
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL(withBase('/sitemap-index.xml'), site).href;

  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${sitemap}`, ''].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
