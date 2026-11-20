/**
 * Verified page authors ("writers") for prez comment threads, and @rowan mention parsing.
 *
 * Why: prez identity (`prgn_identity`) is a self-chosen name anyone can set, and a page password is shared by
 * every reader, so neither can say who the page's author is. A writer holds a server-signed cookie instead:
 *
 *   key     = HMAC-SHA256(PREZ_AGENT_TOKEN, "prez-writer-v1")   — derived, so no new secret to provision
 *   token   = "v1." + b64url(JSON payload) + "." + b64url(HMAC-SHA256(key, "v1." + b64url(payload)))
 *   claim   payload {t:"claim",  w, n, nonce, exp}   minted by the agent CLI (prez_comments.py claim), 24 h, one use
 *   cookie  payload {t:"writer", w, n, iat, exp}     minted by /api/writer when a claim is redeemed, 1 year
 *
 * Only a holder of PREZ_AGENT_TOKEN can mint either. The `t` field stops a claim ticket being replayed as a cookie.
 * Node only (node:crypto). Shared by api/comments.js, api/writer.js and scripts/test_rowan_mentions.mjs.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

export const WRITER_COOKIE = 'prez_writer';
export const WRITER_TTL_S = 60 * 60 * 24 * 365;
export const CLAIM_TTL_S = 60 * 60 * 24;

const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
const unb64url = (s) => Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

export function writerKey(agentToken) {
  if (!agentToken) return null;
  return createHmac('sha256', agentToken).update('prez-writer-v1').digest();
}

export function sign(payload, key) {
  const head = 'v1.' + b64url(JSON.stringify(payload));
  return head + '.' + b64url(createHmac('sha256', key).update(head).digest());
}

/** Payload of a valid, unexpired token of type `t`, else null. */
export function verify(token, key, t, now = Date.now() / 1000) {
  if (!token || !key || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'v1') return null;
  const want = createHmac('sha256', key).update(parts[0] + '.' + parts[1]).digest();
  let got;
  try { got = unb64url(parts[2]); } catch { return null; }
  if (got.length !== want.length || !timingSafeEqual(got, want)) return null;
  let p;
  try { p = JSON.parse(unb64url(parts[1]).toString('utf8')); } catch { return null; }
  if (!p || p.t !== t || typeof p.w !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,31}$/.test(p.w)) return null;
  if (typeof p.exp !== 'number' || p.exp < now) return null;
  return p;
}

/** The verified writer behind a request's cookies, or null. */
export function writerFromCookies(cookies, agentToken) {
  const raw = cookies && cookies[WRITER_COOKIE];
  if (!raw) return null;
  let tok;
  try { tok = decodeURIComponent(raw); } catch { return null; }
  const p = verify(tok, writerKey(agentToken), 'writer');
  return p ? { id: p.w, name: typeof p.n === 'string' ? p.n.slice(0, 24) : p.w } : null;
}

/**
 * True when `text` mentions @rowan as a word: "@rowan", "@Rowan,", "(@rowan)". Not "a@rowan.com" (an address:
 * the @ follows a word character) and not "@rowans" / "@rowan_x".
 */
export function mentionsRowan(text) {
  return /(^|[^\w.@])@rowan(?![\w-])/i.test(String(text || ''));
}
