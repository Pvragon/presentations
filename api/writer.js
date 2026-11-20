/**
 * /api/writer — turns a one-time claim link into the verified page-author cookie (`prez_writer`).
 *
 *   GET  /api/writer?ticket=<claim>&next=/path   → confirm page with a button (a GET never redeems, so link
 *                                                  scanners and previews cannot burn the ticket)
 *   POST /api/writer  ticket=<claim>&next=/path  → redeem once (nonce stored in prez_claims), set the cookie, 303 → next
 *   GET  /api/writer?status=1                    → {"writer": {"name"} | null}
 *   GET  /api/writer?signout=1                   → clears the cookie, 303 → /
 *
 * Claim tickets are minted by the agent CLI (`prez_comments.py claim`) with a key derived from PREZ_AGENT_TOKEN.
 * See lib/writer-auth.js for the token format.
 */
import { parseCookies } from '../lib/protected-paths.js';
import { writerKey, verify, sign, writerFromCookies, WRITER_COOKIE, WRITER_TTL_S } from '../lib/writer-auth.js';

export default async function handler(req, res) {
  return handle(req, res, defaultClaimStore);
}

/** `claimStore(nonce, writerId)` resolves true on first redeem, false on a replay. Injected by the tests. */
export async function handle(req, res, claimStore) {
  const { PREZ_AGENT_TOKEN } = process.env;
  const key = writerKey(PREZ_AGENT_TOKEN);
  if (!key) return page(res, 503, 'Not configured', 'Page-author sign-in is not configured on this deployment.');
  const url = new URL(req.url, 'http://x');

  if (req.method === 'GET') {
    if (url.searchParams.get('status')) {
      const w = writerFromCookies(parseCookies(req.headers.cookie), PREZ_AGENT_TOKEN);
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.statusCode = 200;
      return res.end(JSON.stringify({ writer: w ? { name: w.name } : null }));
    }
    if (url.searchParams.get('signout')) {
      res.setHeader('Set-Cookie', `${WRITER_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
      res.statusCode = 303; res.setHeader('Location', '/'); return res.end();
    }
    const ticket = url.searchParams.get('ticket') || '';
    const claim = verify(ticket, key, 'claim');
    if (!claim) return page(res, 400, 'Link not valid', 'This sign-in link is invalid or has expired. Ask for a new one.');
    const next = safeNext(url.searchParams.get('next'));
    return page(res, 200, `Sign in as ${esc(claim.n || claim.w)}`,
      `This browser will be recognised as <b>${esc(claim.n || claim.w)}</b>, the author of the prez pages published in that name. ` +
      'On those pages, a comment that mentions <b>@claude</b> (or uses <b>Send to Claude</b>) goes to your agent. The link works once.',
      `<form method="POST" action="/api/writer"><input type="hidden" name="ticket" value="${esc(ticket)}">` +
      `<input type="hidden" name="next" value="${esc(next)}"><button type="submit">Sign in on this browser</button></form>`);
  }

  if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
  const form = await readForm(req);
  const claim = verify(form.ticket || '', key, 'claim');
  if (!claim) return page(res, 400, 'Link not valid', 'This sign-in link is invalid or has expired. Ask for a new one.');
  if (typeof claim.nonce !== 'string' || claim.nonce.length < 16) return page(res, 400, 'Link not valid', 'Malformed link.');
  let first;
  try { first = await claimStore(claim.nonce, claim.w); } catch (e) {
    return page(res, 500, 'Sign-in failed', 'The claim could not be recorded. Try again in a minute.');
  }
  if (!first) return page(res, 409, 'Link already used', 'This sign-in link has already been used. Ask for a new one.');
  const now = Math.floor(Date.now() / 1000);
  const cookie = sign({ t: 'writer', w: claim.w, n: claim.n || claim.w, iat: now, exp: now + WRITER_TTL_S }, key);
  res.setHeader('Set-Cookie', `${WRITER_COOKIE}=${encodeURIComponent(cookie)}; Path=/; Max-Age=${WRITER_TTL_S}; HttpOnly; Secure; SameSite=Lax`);
  res.statusCode = 303; res.setHeader('Location', safeNext(form.next)); res.setHeader('Cache-Control', 'no-store');
  return res.end();
}

async function defaultClaimStore(nonce, writerId) {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('not configured');
  const r = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/prez_claims`, {
    method: 'POST',
    headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ nonce, writer_id: writerId }),
  });
  if (r.status === 409) return false;   // primary-key conflict: already redeemed
  if (!r.ok) throw new Error(`supabase ${r.status}`);
  return true;
}

/** Only same-site absolute paths; anything else goes home. */
function safeNext(n) {
  return typeof n === 'string' && /^\/(?![/\\])[\w\-./~%#=?&]*$/.test(n) && n.length < 300 ? n : '/';
}
async function readForm(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = typeof req.body === 'string' ? req.body : '';
  if (!raw) for await (const chunk of req) { raw += chunk; if (raw.length > 8192) break; }
  return Object.fromEntries(new URLSearchParams(raw));
}
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
function page(res, code, title, body, extra = '') {
  res.statusCode = code;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.end(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>${title} · Pvragon Presentations</title>
<style>*{box-sizing:border-box;margin:0;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
body{background:#080e10;color:#f8fafc;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px}
.card{max-width:440px;width:100%;background:#112328;border:1px solid rgba(248,250,252,.08);border-radius:20px;padding:28px}
h1{font-size:1.25rem;margin-bottom:10px}p{color:#deeaef;line-height:1.5;font-size:.95rem}
button{margin-top:18px;width:100%;padding:12px;border:0;border-radius:10px;background:#e7511f;color:#fff;font-weight:600;font-size:1rem;cursor:pointer}</style>
</head><body><div class="card"><h1>${title}</h1><p>${body}</p>${extra}</div></body></html>`);
}
