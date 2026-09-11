/**
 * Single owner of the "which prez paths are password-gated" fact.
 * Imported by middleware.js (Edge) AND api/comments.js (Node) — keep it dependency-free.
 *
 * To add a protected category: add the prefix → env-var mapping here, add the prefix to
 * MATCHER below, set the env var in Vercel, redeploy.
 */
export const PROTECTED_PATHS = {
  '/echo1': 'PREZ_PW_ECHO1',
  '/echo1-exec': 'PREZ_PW_ECHO1_EXEC',
  '/one-mahjong': 'PREZ_PW_ONE_MAHJONG',
};

export const MATCHER = Object.keys(PROTECTED_PATHS).flatMap((p) => [p, `${p}/:path*`]);

/** Longest protected prefix that covers `path`, or null. */
export function protectedPrefixFor(path) {
  let best = null;
  for (const prefix of Object.keys(PROTECTED_PATHS)) {
    if ((path === prefix || path.startsWith(prefix + '/')) && (!best || prefix.length > best.length)) best = prefix;
  }
  return best;
}

/** Cookie the middleware sets after a correct password: prez_auth_<prefix with / → _>. */
export function authCookieName(prefix) {
  return `prez_auth${prefix.replace(/\//g, '_')}`;
}

export function parseCookies(header) {
  const out = {};
  for (const part of (header || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}

/** True when the request may read `path`: unprotected, or carries the matching password cookie. */
export function pageAccessGranted(path, cookieHeader, env) {
  const prefix = protectedPrefixFor(path);
  if (!prefix) return true;
  const expected = env[PROTECTED_PATHS[prefix]];
  if (!expected) return true; // no password configured → not actually gated
  const raw = parseCookies(cookieHeader)[authCookieName(prefix)];
  if (!raw) return false;
  try { return decodeURIComponent(raw) === expected; } catch { return false; }
}
