/**
 * /api/comments — anchored comment threads for prez.prgn.ai pages.
 *
 * Storage: prgn-play Supabase project, tables prez_threads / prez_messages (see supabase/prez_comments.sql).
 * RLS is ON with no policies, so this function (service role) is the only way in or out.
 *
 * Gates (mirrors the page itself):
 *   - page access: same per-path password cookie the middleware sets → you can comment on what you can read
 *   - identity:    the shared .prgn.ai `prgn_identity` cookie {playerId, name, color} — device-level, same as play.prgn.ai
 *   - agent:       `Authorization: Bearer $PREZ_AGENT_TOKEN` → Rowan's terminal tooling; may list across pages (?scope=all)
 *   - writer:      the server-signed `prez_writer` cookie (lib/writer-auth.js) → a verified page author
 *
 * @rowan (2026-11-20, Jaime: "it needs to only respond to the document's author"): a create/reply whose text mentions
 * @rowan, or that sets send_to_agent, marks the thread to_agent ONLY when the poster is the verified writer who
 * authored the page (prez_pages, default DEFAULT_AUTHOR). From anyone else a mention is an ordinary comment. Any
 * agent message clears to_agent; resolving clears it too.
 *
 * GET  /api/comments?page=/cat/slug            → { page, canComment, identity, threads:[{..., messages:[...]}] }
 * GET  /api/comments?scope=all&status=open[&sent=1]   (agent only; sent=1 → only threads sent to Rowan)
 * POST /api/comments  { action: create|reply|resolve|reopen|send, ..., send_to_agent? }
 * POST /api/comments  { action: set_author, page, author_id, author_name }   (agent only)
 */
import { pageAccessGranted, parseCookies } from '../lib/protected-paths.js';
import { writerFromCookies, mentionsRowan } from '../lib/writer-auth.js';

const AGENT = { playerId: 'rowan', name: 'Rowan 🤖', color: '#0a8fa0' };
// Pages published before the author registry (and any page nobody registered) belong to Jaime: every prez page so far
// was published from his repo. Pages git shows another person adding were registered to them on 2026-11-20.
const DEFAULT_AUTHOR = { author_id: 'jaime', author_name: 'Jaime', registered: false };
const MAX_BODY = 4000;

export default async function handler(req, res) {
  return handle(req, res, makeDb);
}

/** Exported for scripts/test_rowan_mentions.mjs, which passes an in-memory db. */
export async function handle(req, res, dbFactory) {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PREZ_AGENT_TOKEN } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return send(res, 503, { error: 'comments not configured' });

  const db = dbFactory(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const cookies = parseCookies(req.headers.cookie);
  const bearer = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const isAgent = !!PREZ_AGENT_TOKEN && bearer === PREZ_AGENT_TOKEN;
  const writer = isAgent ? null : writerFromCookies(cookies, PREZ_AGENT_TOKEN);
  const identity = isAgent ? AGENT
    : readIdentity(cookies.prgn_identity) || (writer ? { playerId: 'writer:' + writer.id, name: writer.name, color: null } : null);
  const pageAuthor = async (page) => {
    const [row] = await db.get(`prez_pages?page=eq.${encodeURIComponent(page)}&select=author_id,author_name`);
    return row ? { ...row, registered: true } : DEFAULT_AUTHOR;
  };
  const isPageAuthor = async (page) => !!writer && writer.id === (await pageAuthor(page)).author_id;
  const canRead = (page) => isAgent || pageAccessGranted(page, req.headers.cookie, process.env);

  try {
    if (req.method === 'GET') {
      const url = new URL(req.url, 'http://x');
      if (url.searchParams.get('scope') === 'all') {
        if (!isAgent) return send(res, 403, { error: 'agent only' });
        const q = ['select=*,messages:prez_messages(*)', 'order=updated_at.desc', 'limit=200'];
        const status = url.searchParams.get('status');
        if (status && status !== 'all') q.push(`status=eq.${status}`);
        if (url.searchParams.get('sent') === '1') q.push('to_agent=is.true');
        const threads = await db.get(`prez_threads?${q.join('&')}`);
        const pages = [...new Set(threads.map((t) => t.page))];
        const rows = pages.length ? await db.get(`prez_pages?select=page,author_id,author_name&page=in.${encodeURIComponent(`(${pages.map((p) => `"${p}"`).join(',')})`)}`) : [];
        const byPage = Object.fromEntries(rows.map((r) => [r.page, r]));
        for (const t of threads) {
          t.messages.sort((a, b) => a.created_at.localeCompare(b.created_at));
          const a = byPage[t.page] || DEFAULT_AUTHOR;
          t.page_author = { id: a.author_id, name: a.author_name, registered: !!byPage[t.page] };
        }
        return send(res, 200, { threads });
      }
      const page = normPage(url.searchParams.get('page'));
      if (!page) return send(res, 400, { error: 'page required' });
      if (!canRead(page)) return send(res, 401, { error: 'page locked' });
      const threads = await db.get(`prez_threads?select=*,messages:prez_messages(*)&page=eq.${encodeURIComponent(page)}&order=created_at.asc`);
      for (const t of threads) t.messages.sort((a, b) => a.created_at.localeCompare(b.created_at));
      const author = await pageAuthor(page);
      return send(res, 200, {
        page, canComment: !!identity, identity, threads,
        author: { name: author.author_name },
        isAuthor: !!writer && writer.id === author.author_id,   // shows "Send to Rowan" to the verified author only
        writer: writer ? { name: writer.name } : null,
      });
    }

    if (req.method !== 'POST') return send(res, 405, { error: 'method' });
    const body = await readJson(req);
    if (body.action === 'set_author') {
      if (!isAgent) return send(res, 403, { error: 'agent only' });
      const page = normPage(body.page);
      const id = (body.author_id || '').toString();
      const name = (body.author_name || '').toString().trim().slice(0, 24);
      if (!page || !/^[a-z0-9][a-z0-9_-]{0,31}$/.test(id) || !name) return send(res, 400, { error: 'page, author_id (a-z0-9_-), author_name required' });
      const [row] = await db.upsert('prez_pages', { page, author_id: id, author_name: name, updated_at: new Date().toISOString() });
      return send(res, 200, { page: row });
    }
    if (!identity) return send(res, 401, { error: 'no identity', need: 'identity' });
    const who = { author_id: identity.playerId, author_name: identity.name, author_color: identity.color };
    const text = (body.body || '').toString().trim();
    const msg = (thread_id) => ({ thread_id, body: text, is_agent: isAgent, writer_id: writer ? writer.id : null, ...who });
    // Does this post send the thread to Rowan? Only from the verified page author; a mention from anyone else is a comment.
    const wantsSend = !isAgent && (body.send_to_agent === true || mentionsRowan(text));
    const sendCheck = async (page) => {
      if (!wantsSend) return { sent: false };
      if (await isPageAuthor(page)) return { sent: true };
      if (body.send_to_agent === true) return { refuse: true };
      return { sent: false, mention_ignored: true };
    };
    const sentFields = () => ({ to_agent: true, sent_at: new Date().toISOString(), sent_by: writer.id });

    if (body.action === 'create') {
      const page = normPage(body.page);
      if (!page) return send(res, 400, { error: 'page required' });
      if (!canRead(page)) return send(res, 401, { error: 'page locked' });
      if (!text || text.length > MAX_BODY) return send(res, 400, { error: 'body 1..4000 chars' });
      const anchor = cleanAnchor(body.anchor);
      const chk = await sendCheck(page);
      if (chk.refuse) return send(res, 403, { error: 'only the page author can send to Rowan' });
      const [thread] = await db.post('prez_threads', {
        page, quote: anchor ? anchor.exact : null, anchor, ...who, ...(chk.sent ? sentFields() : {}),
      });
      const [message] = await db.post('prez_messages', msg(thread.id));
      return send(res, 201, { thread: { ...thread, messages: [message] }, sent: !!chk.sent, mention_ignored: !!chk.mention_ignored });
    }

    const threadId = (body.thread_id || '').toString();
    if (!/^[0-9a-f-]{36}$/.test(threadId)) return send(res, 400, { error: 'thread_id required' });
    const [thread] = await db.get(`prez_threads?id=eq.${threadId}&select=*`);
    if (!thread) return send(res, 404, { error: 'no such thread' });
    if (!canRead(thread.page)) return send(res, 401, { error: 'page locked' });

    if (body.action === 'send') {   // "Send to Rowan" on a thread with nothing new to say
      if (isAgent || !(await isPageAuthor(thread.page))) return send(res, 403, { error: 'only the page author can send to Rowan' });
      const [updated] = await db.patch(`prez_threads?id=eq.${threadId}`, { ...sentFields(), status: 'open', resolved_at: null, resolved_by: null });
      return send(res, 200, { thread: updated, sent: true });
    }
    if (body.action === 'reply') {
      if (!text || text.length > MAX_BODY) return send(res, 400, { error: 'body 1..4000 chars' });
      const chk = await sendCheck(thread.page);
      if (chk.refuse) return send(res, 403, { error: 'only the page author can send to Rowan' });
      const [message] = await db.post('prez_messages', msg(threadId));
      if (chk.sent) await db.patch(`prez_threads?id=eq.${threadId}`, { ...sentFields(), status: 'open', resolved_at: null, resolved_by: null });
      else if (isAgent && thread.to_agent) await db.patch(`prez_threads?id=eq.${threadId}`, { to_agent: false });
      return send(res, 201, { message, sent: !!chk.sent, mention_ignored: !!chk.mention_ignored });
    }
    if (body.action === 'resolve' || body.action === 'reopen') {
      const resolving = body.action === 'resolve';
      if (text) await db.post('prez_messages', msg(threadId));
      // Resolving takes a thread off Rowan's queue; so does any agent message (the agent answered).
      const clear = resolving || (isAgent && text) ? { to_agent: false } : {};
      const [updated] = await db.patch(`prez_threads?id=eq.${threadId}`, resolving
        ? { status: 'resolved', resolved_at: new Date().toISOString(), resolved_by: identity.name, updated_at: new Date().toISOString(), ...clear }
        : { status: 'open', resolved_at: null, resolved_by: null, updated_at: new Date().toISOString(), ...clear });
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
  const call = async (method, path, body, extra) => {
    const r = await fetch(base + path, { method, headers: { ...headers, ...extra }, body: body ? JSON.stringify(body) : undefined });
    if (!r.ok) throw new Error(`supabase ${method} ${path.split('?')[0]} → ${r.status} ${(await r.text()).slice(0, 200)}`);
    return r.status === 204 ? [] : r.json();
  };
  return {
    get: (p) => call('GET', p), post: (p, b) => call('POST', p, b), patch: (p, b) => call('PATCH', p, b),
    upsert: (p, b) => call('POST', p, b, { Prefer: 'return=representation,resolution=merge-duplicates' }),
  };
}
