/**
 * Base-path helpers.
 *
 * Astro exposes the configured base as import.meta.env.BASE_URL. Every internal
 * href and every path to a file in public/ must go through withBase(), so that
 * moving between the production domain, a user site and a project site is a
 * config change only.
 */
const BASE = import.meta.env.BASE_URL;

/** Join the configured base path with an app-absolute path. */
export function withBase(path: string): string {
  const base = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  const rest = path.startsWith('/') ? path : `/${path}`;
  return `${base}${rest}` || '/';
}

/**
 * True for a path that names a page directory rather than a file or a fragment.
 * The build emits directory-format output, so those URLs end in a slash; linking
 * to them without one costs a redirect on every navigation.
 */
function isPageRoute(path: string): boolean {
  if (path.includes('#') || path.includes('?')) return false;
  const last = path.split('/').pop() ?? '';
  return !last.includes('.');
}

/** Internal link to a page, always with the trailing slash the build serves. */
export function pageUrl(path: string): string {
  const href = withBase(path);
  if (!isPageRoute(path) || href.endsWith('/')) return href;
  return `${href}/`;
}

/** Absolute URL, for canonical links and Open Graph tags. */
export function absoluteUrl(path: string, site: URL | undefined): string {
  return new URL(pageUrl(path), site ?? 'https://sepen.dev').href;
}
