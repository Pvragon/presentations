/**
 * /api/comments — anchored comment threads for prez.prgn.ai pages.
 *
 * Storage: prgn-play Supabase project, tables prez_threads / prez_messages (see supabase/prez_comments.sql).
 * RLS is ON with no policies, so this function (service role) is the only way in or out.
 *
 * Gates (mirrors the page itself):
 *   - page access: same per-path password cookie the middleware sets → you can comment on what you can read
 *   - identity:    the shared .prgn.ai `prgn_identity` cookie {playerId, name, color} — device-level, same as play.prgn.ai
 *   - agent:       `Authorization: Bearer $PREZ_AGENT_TOKEN` → Rowan; may list across pages (?scope=all)
 *
 * GET  /api/comments?page=/cat/slug            → { page, canComment, identity, threads:[{..., messages:[...]}] }
 * GET  /api/comments?scope=all&status=open&to_agent=1   (agent only)
 * POST /api/comments  { action: create|reply|resolve|reopen|to_agent, ... }
 */
import { pageAccessGranted, parseCookies } from '../lib/protected-paths.js';

const AGENT = { playerId: 'rowan', name: 'Rowan 🤖', color: '#0a8fa0' };
const MAX_BODY = 4000;

export default async function handler(req, res) {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PREZ_AGENT_TOKEN } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return send(res, 503, { error: 'comments not configured' });

  const db = makeDb(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const cookies = parseCookies(req.headers.cookie);
  const bearer = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const isAgent = !!PREZ_AGENT_TOKEN && bearer === PREZ_AGENT_TOKEN;
  const identity = isAgent ? AGENT : readIdentity(cookies.prgn_identity);
  const canRead = (page) => isAgent || pageAccessGranted(page, req.headers.cookie, process.env);

  try {
    if (req.method === 'GET') {
      const url = new URL(req.url, 'http://x');
      if (url.searchParams.get('scope') === 'all') {
        if (!isAgent) return send(res, 403, { error: 'agent only' });
        const q = ['select=*,messages:prez_messages(*)', 'order=updated_at.desc', 'limit=200'];
        const status = url.searchParams.get('status');
        if (status && status !== 'all') q.push(`status=eq.${status}`);
        if (url.searchParams.get('to_agent') === '1') q.push('to_agent=is.true');
        return send(res, 200, { threads: await db.get(`prez_threads?${q.join('&')}`) });
      }
      const page = normPage(url.searchParams.get('page'));
      if (!page) return send(res, 400, { error: 'page required' });
      if (!canRead(page)) return send(res, 401, { error: 'page locked' });
      const threads = await db.get(`prez_threads?select=*,messages:prez_messages(*)&page=eq.${encodeURIComponent(page)}&order=created_at.asc`);
      for (const t of threads) t.messages.sort((a, b) => a.created_at.localeCompare(b.created_at));
      return send(res, 200, { page, canComment: !!identity, identity, threads });
    }

    if (req.method !== 'POST') return send(res, 405, { error: 'method' });
    const body = await readJson(req);
    if (!identity) return send(res, 401, { error: 'no identity', need: 'identity' });
    const who = { author_id: identity.playerId, author_name: identity.name, author_color: identity.color };
    const text = (body.body || '').toString().trim();

    if (body.action === 'create') {
      const page = normPage(body.page);
      if (!page) return send(res, 400, { error: 'page required' });
      if (!canRead(page)) return send(res, 401, { error: 'page locked' });
      if (!text || text.length > MAX_BODY) return send(res, 400, { error: 'body 1..4000 chars' });
      const anchor = cleanAnchor(body.anchor);
      const [thread] = await db.post('prez_threads', {
        page, quote: anchor ? anchor.exact : null, anchor, to_agent: !!body.to_agent, ...who,
      });
      const [message] = await db.post('prez_messages', { thread_id: thread.id, body: text, is_agent: isAgent, ...who });
      return send(res, 201, { thread: { ...thread, messages: [message] } });
    }

    const threadId = (body.thread_id || '').toString();
    if (!/^[0-9a-f-]{36}$/.test(threadId)) return send(res, 400, { error: 'thread_id required' });
    const [thread] = await db.get(`prez_threads?id=eq.${threadId}&select=*`);
    if (!thread) return send(res, 404, { error: 'no such thread' });
    if (!canRead(thread.page)) return send(res, 401, { error: 'page locked' });

    if (body.action === 'reply') {
      if (!text || text.length > MAX_BODY) return send(res, 400, { error: 'body 1..4000 chars' });
      const [message] = await db.post('prez_messages', { thread_id: threadId, body: text, is_agent: isAgent, ...who });
      // an agent reply clears the hand-off flag; a human reply that @mentions rowan sets it
      const patch = isAgent ? { to_agent: false } : (/@rowan\b/i.test(text) ? { to_agent: true } : null);
      if (patch) await db.patch(`prez_threads?id=eq.${threadId}`, patch);
      return send(res, 201, { message });
    }
    if (body.action === 'resolve' || body.action === 'reopen') {
      const resolving = body.action === 'resolve';
      if (text) await db.post('prez_messages', { thread_id: threadId, body: text, is_agent: isAgent, ...who });
      const [updated] = await db.patch(`prez_threads?id=eq.${threadId}`, resolving
        ? { status: 'resolved', resolved_at: new Date().toISOString(), resolved_by: identity.name, to_agent: false, updated_at: new Date().toISOString() }
        : { status: 'open', resolved_at: null, resolved_by: null, updated_at: new Date().toISOString() });
      return send(res, 200, { thread: updated });
    }
    if (body.action === 'to_agent') {
      const [updated] = await db.patch(`prez_threads?id=eq.${threadId}`, { to_agent: !!body.to_agent, updated_at: new Date().toISOString() });
      return send(res, 200, { thread: updated });
    }
    return send(res, 400, { error: 'unknown action' });
  } catch (e) {
    return send(res, 500, { error: 'comments backend error', detail: String(e.message || e).slice(0, 300) });
  }
}

// ── helpers ────────────────────────────────────────────────────────────────────────────────
function send(res, code, obj) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}
function normPage(p) {
  if (!p || typeof p !== 'string') return null;
  let path;
  try { path = p.startsWith('/') ? p : new URL(p).pathname; } catch { return null; }
  path = path.replace(/\.html$/, '').replace(/\/index$/, '/').replace(/\/+$/, '') || '/';
  return path.length > 300 || /[^\w\-./~%]/.test(path) ? null : path;
}
function readIdentity(raw) {
  if (!raw) return null;
  try {
    const o = JSON.parse(decodeURIComponent(raw));
    if (typeof o.playerId !== 'string' || typeof o.name !== 'string') return null;
    return { playerId: o.playerId.slice(0, 64), name: o.name.trim().slice(0, 24) || 'Someone', color: typeof o.color === 'string' ? o.color.slice(0, 16) : null };
  } catch { return null; }
}
function cleanAnchor(a) {
  if (!a || typeof a !== 'object' || typeof a.exact !== 'string' || !a.exact.trim()) return null;
  const s = (v) => (typeof v === 'string' ? v.slice(0, 200) : '');
  return { type: 'TextQuoteSelector', exact: a.exact.slice(0, 2000), prefix: s(a.prefix), suffix: s(a.suffix) };
}
async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = typeof req.body === 'string' ? req.body : '';
  if (!raw) for await (const chunk of req) raw += chunk;
  if (raw.length > 64 * 1024) throw new Error('payload too large');
  return raw ? JSON.parse(raw) : {};
}
function makeDb(url, key) {
  const base = `${url.replace(/\/$/, '')}/rest/v1/`;
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' };
  const call = async (method, path, body) => {
    const r = await fetch(base + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
    if (!r.ok) throw new Error(`supabase ${method} ${path.split('?')[0]} → ${r.status} ${(await r.text()).slice(0, 200)}`);
    return r.status === 204 ? [] : r.json();
  };
  return { get: (p) => call('GET', p), post: (p, b) => call('POST', p, b), patch: (p, b) => call('PATCH', p, b) };
}
