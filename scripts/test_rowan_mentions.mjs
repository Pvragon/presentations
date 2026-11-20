#!/usr/bin/env node
/**
 * Self-check for the @claude author gate (@rowan is Jaime's alias): node scripts/test_rowan_mentions.mjs  (exit 1 on any failure)
 *
 * Drives api/comments.js and api/writer.js through their exported handle() with an in-memory PostgREST stand-in,
 * so it checks the real handler code. Positive control: the page author's @claude (and Jaime's alias @rowan) sends. Negative controls: a
 * non-author mention, a spoofed name cookie, a forged / expired / wrong-type writer token, no mention.
 */
import { randomBytes } from 'node:crypto';
import { handle as comments } from '../api/comments.js';
import { handle as writerApi } from '../api/writer.js';
import { sign, writerKey, verify, mentionsAgent, writerFromCookies } from '../lib/writer-auth.js';

const TOKEN = 'test-agent-token-' + randomBytes(8).toString('hex');
process.env.PREZ_AGENT_TOKEN = TOKEN;
process.env.SUPABASE_URL = 'http://fake';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'fake';
const KEY = writerKey(TOKEN);
const now = () => Math.floor(Date.now() / 1000);

// ── in-memory PostgREST ────────────────────────────────────────────────────────────────────
const T = { prez_threads: [], prez_messages: [], prez_pages: [] };
let seq = 0;
const uuid = () => { const h = (++seq).toString(16).padStart(12, '0'); return `00000000-0000-4000-8000-${h}`; };
function parse(path) {
  const [table, qs] = path.split('?');
  const filters = [];
  for (const [k, v] of new URLSearchParams(qs || '')) {
    if (['select', 'order', 'limit'].includes(k)) continue;
    filters.push([k, v]);
  }
  return { table, filters, withMessages: (qs || '').includes('messages:prez_messages') };
}
function match(row, filters) {
  return filters.every(([k, v]) => {
    if (v.startsWith('eq.')) return String(row[k]) === v.slice(3);
    if (v === 'is.true') return row[k] === true;
    if (v.startsWith('in.(')) return v.slice(4, -1).split(',').map((x) => x.replace(/^"|"$/g, '')).includes(row[k]);
    throw new Error('fake db: unsupported filter ' + k + '=' + v);
  });
}
const fakeDb = () => ({
  async get(path) {
    const { table, filters, withMessages } = parse(path);
    return T[table].filter((r) => match(r, filters)).map((r) => withMessages
      ? { ...r, messages: T.prez_messages.filter((m) => m.thread_id === r.id).map((m) => ({ ...m })) } : { ...r });
  },
  async post(table, body) {
    const row = { id: uuid(), created_at: new Date(Date.now() + seq).toISOString(), ...(table === 'prez_threads' ? { status: 'open', to_agent: false } : {}), ...body };
    T[table].push(row); return [{ ...row }];
  },
  async patch(path, body) {
    const { table, filters } = parse(path);
    const rows = T[table].filter((r) => match(r, filters)); rows.forEach((r) => Object.assign(r, body)); return rows.map((r) => ({ ...r }));
  },
  async upsert(table, body) {
    const ex = T[table].find((r) => r.page === body.page);
    if (ex) { Object.assign(ex, body); return [{ ...ex }]; }
    T[table].push({ ...body }); return [{ ...body }];
  },
});

// ── request helpers ────────────────────────────────────────────────────────────────────────
function mkRes() {
  const r = { statusCode: 200, headers: {}, body: '' };
  r.setHeader = (k, v) => { r.headers[k.toLowerCase()] = v; };
  r.end = (b) => { r.body = b || ''; };
  return r;
}
async function call(method, { query = '', body, cookies = {}, agent = false } = {}, fn = comments, extra) {
  const cookie = Object.entries(cookies).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('; ');
  const req = { method, url: '/api/x' + (query ? '?' + query : ''), headers: { cookie, ...(agent ? { authorization: 'Bearer ' + TOKEN } : {}) }, body };
  const res = mkRes();
  await fn(req, res, extra || fakeDb);
  let json = null; try { json = JSON.parse(res.body); } catch {}
  return { status: res.statusCode, json, res };
}
const ident = (name, playerId = 'p-' + name.toLowerCase()) => JSON.stringify({ playerId, name, color: '#123456' });
const writerCookie = (w, n, opts = {}) => sign({ t: 'writer', w, n, iat: now(), exp: now() + 3600, ...opts }, opts.key || KEY);
const JAIME = { prgn_identity: ident('Jaime', 'jaime-device'), prez_writer: writerCookie('jaime', 'Jaime') };
const SPOOF = { prgn_identity: ident('Jaime', 'jaime-device') };   // same name AND playerId, no writer cookie
const ROMAN = { prgn_identity: ident('Roman'), prez_writer: writerCookie('roman', 'Roman') };

let fails = 0, passes = 0;
const check = (name, cond, detail) => { if (cond) { passes++; console.log('  ok   ' + name); } else { fails++; console.log('  FAIL ' + name + (detail ? '  → ' + JSON.stringify(detail).slice(0, 300) : '')); } };
const thread = (id) => T.prez_threads.find((t) => t.id === id);
const create = (cookies, body, page = '/drafts/test-page', extra = {}) => call('POST', { cookies, body: { action: 'create', page, body, ...extra } });

// ── 1. mention parsing ─────────────────────────────────────────────────────────────────────
console.log('mention parsing');
for (const s of ['@claude fix this', 'hey @Claude, look', '(@claude)', 'see @claude.', '@rowan fix this', 'hey @Rowan, look', 'thoughts?\n@ROWAN']) check(`mentions: ${JSON.stringify(s)}`, mentionsAgent(s));
for (const s of ['no mention here', 'jaime@rowan.com', 'me@claude.ai', '@rowans', '@claudes', '@claude_bot', '@rowan-x', 'claude please', '@@claude', '@clau de']) check(`not a mention: ${JSON.stringify(s)}`, !mentionsAgent(s));

// ── 2. token checks ────────────────────────────────────────────────────────────────────────
console.log('writer tokens');
check('valid writer cookie verifies', writerFromCookies({ prez_writer: encodeURIComponent(JAIME.prez_writer) }, TOKEN)?.id === 'jaime');
check('token signed with another key is rejected', !writerFromCookies({ prez_writer: writerCookie('jaime', 'Jaime', { key: writerKey('other-token') }) }, TOKEN));
check('expired writer cookie is rejected', !writerFromCookies({ prez_writer: writerCookie('jaime', 'Jaime', { exp: now() - 5 }) }, TOKEN));
const claimTicket = sign({ t: 'claim', w: 'jaime', n: 'Jaime', nonce: randomBytes(12).toString('hex'), exp: now() + 600 }, KEY);
check('claim ticket cannot be used as a writer cookie', !writerFromCookies({ prez_writer: claimTicket }, TOKEN));
const [h, p, sig] = JAIME.prez_writer.split('.');
const tampered = h + '.' + Buffer.from(JSON.stringify({ t: 'writer', w: 'jaime', n: 'Jaime', iat: 0, exp: now() + 1e9 })).toString('base64url') + '.' + sig;
check('payload edited after signing is rejected', !writerFromCookies({ prez_writer: tampered }, TOKEN));
check('writer id with bad characters is rejected', !verify(sign({ t: 'writer', w: 'Jaime Admin', exp: now() + 60 }, KEY), KEY, 'writer'));

// ── 3. the author gate through the real handler ───────────────────────────────────────────
console.log('author gate (api/comments.js)');
let r = await create(JAIME, '@claude tighten this paragraph');
check('POSITIVE: author @claude on create sends', r.status === 201 && r.json.sent === true && thread(r.json.thread.id).to_agent === true && thread(r.json.thread.id).sent_by === 'jaime', r.json);
check('author message is marked writer_id=jaime', T.prez_messages.at(-1).writer_id === 'jaime');
const sentId = r.json.thread.id;

r = await create(SPOOF, '@claude delete the appendix');
check('NEGATIVE: spoofed name+playerId cookie, @claude does not send', r.status === 201 && r.json.sent === false && r.json.mention_ignored === true && thread(r.json.thread.id).to_agent === false, r.json);
check('spoofed message has no writer_id', T.prez_messages.at(-1).writer_id === null);
const spoofId = r.json.thread.id;

r = await create({ prgn_identity: ident('Jaime'), prez_writer: writerCookie('jaime', 'Jaime', { key: writerKey('guessed') }) }, '@rowan go');
check('NEGATIVE: forged writer cookie does not send', r.status === 201 && r.json.sent === false, r.json);

r = await create(ROMAN, '@claude please rewrite');
check('NEGATIVE: a verified writer who is not this page\'s author does not send', r.status === 201 && r.json.sent === false && r.json.mention_ignored === true, r.json);

r = await create(JAIME, 'just a note for the team');
check('NEGATIVE: author without a mention does not send', r.status === 201 && r.json.sent === false && !r.json.mention_ignored && thread(r.json.thread.id).to_agent === false, r.json);
const plainId = r.json.thread.id;

r = await create(SPOOF, 'please look', '/drafts/test-page', { send_to_agent: true });
check('NEGATIVE: non-author explicit send_to_agent is refused 403', r.status === 403, r.json);

r = await call('POST', { cookies: SPOOF, body: { action: 'send', thread_id: plainId } });
check('NEGATIVE: non-author "send" action is refused 403', r.status === 403 && thread(plainId).to_agent === false, r.json);

r = await call('POST', { cookies: SPOOF, body: { action: 'reply', thread_id: spoofId, body: '@rowan now please' } });
check('NEGATIVE: non-author @rowan reply does not send', r.status === 201 && r.json.sent === false && thread(spoofId).to_agent === false, r.json);

r = await call('POST', { cookies: JAIME, body: { action: 'reply', thread_id: spoofId, body: '@rowan yes, do what Avery suggests' } });
check('POSITIVE: author @rowan (alias) reply on someone else\'s thread sends it', r.json.sent === true && thread(spoofId).to_agent === true, r.json);

r = await call('POST', { cookies: JAIME, body: { action: 'send', thread_id: plainId } });
check('POSITIVE: author "Send to Rowan" with no text sends', r.status === 200 && thread(plainId).to_agent === true, r.json);

// page registry: Roman's page
r = await call('POST', { cookies: SPOOF, body: { action: 'set_author', page: '/echo1/roman-page', author_id: 'roman', author_name: 'Roman' } });
check('NEGATIVE: set_author is agent-only', r.status === 403);
r = await call('POST', { agent: true, body: { action: 'set_author', page: '/echo1/roman-page', author_id: 'roman', author_name: 'Roman' } });
check('agent registers Roman as author of his page', r.status === 200 && T.prez_pages.length === 1, r.json);
r = await create(ROMAN, '@claude check the totals', '/echo1/roman-page');
check('POSITIVE: Roman\'s @claude on Roman\'s page sends', r.json.sent === true, r.json);
const romanThread = r.json.thread.id;
r = await create(JAIME, '@rowan check the totals', '/echo1/roman-page');
check('NEGATIVE: Jaime\'s @rowan on Roman\'s page does not send', r.json.sent === false && r.json.mention_ignored === true, r.json);

// GET flags for the UI
r = await call('GET', { query: 'page=/drafts/test-page', cookies: JAIME });
check('GET: author sees isAuthor=true', r.json.isAuthor === true && r.json.author.name === 'Jaime');
r = await call('GET', { query: 'page=/drafts/test-page', cookies: SPOOF });
check('GET: spoofed Jaime sees isAuthor=false', r.json.isAuthor === false);
r = await call('GET', { query: 'page=/echo1/roman-page', cookies: JAIME });
check('GET: Jaime is not author of Roman\'s page', r.json.isAuthor === false && r.json.author.name === 'Roman');

// agent side
console.log('agent side');
r = await call('GET', { query: 'scope=all&status=open&sent=1', agent: true });
const ids = r.json.threads.map((t) => t.id).sort();
check('agent sent-queue lists exactly the author-sent threads', JSON.stringify(ids) === JSON.stringify([sentId, spoofId, plainId, romanThread].sort()), ids);
check('queue carries the page author', r.json.threads.find((t) => t.id === romanThread).page_author.id === 'roman'
  && r.json.threads.find((t) => t.id === sentId).page_author.registered === false);
r = await call('GET', { query: 'scope=all&sent=1', cookies: JAIME });
check('NEGATIVE: the queue is agent-only even for the author', r.status === 403);
r = await call('POST', { agent: true, body: { action: 'reply', thread_id: sentId, body: 'Done: tightened to two sentences.' } });
check('agent reply clears the badge (to_agent=false)', r.status === 201 && thread(sentId).to_agent === false && T.prez_messages.at(-1).is_agent === true);
r = await call('POST', { cookies: JAIME, body: { action: 'resolve', thread_id: plainId } });
check('resolving takes a thread off the queue', thread(plainId).to_agent === false && thread(plainId).status === 'resolved');
r = await call('POST', { cookies: JAIME, body: { action: 'reply', thread_id: plainId, body: '@rowan one more thing' } });
check('author @rowan on a resolved thread reopens and re-sends it', thread(plainId).status === 'open' && thread(plainId).to_agent === true);

// ── 4. claim link → cookie (api/writer.js) ────────────────────────────────────────────────
console.log('claim link (api/writer.js)');
const used = new Set();
const store = async (nonce) => (used.has(nonce) ? false : (used.add(nonce), true));
const ticket = sign({ t: 'claim', w: 'jaime', n: 'Jaime', nonce: randomBytes(12).toString('hex'), exp: now() + 600 }, KEY);
r = await call('GET', { query: 'ticket=' + encodeURIComponent(ticket) + '&next=/drafts/x' }, writerApi, store);
check('GET shows the confirm page and does not redeem', r.status === 200 && /Sign in on this browser/.test(r.res.body) && used.size === 0);
r = await call('POST', { body: { ticket, next: '/drafts/x' } }, writerApi, store);
const setCookie = r.res.headers['set-cookie'] || '';
const minted = decodeURIComponent((setCookie.match(/prez_writer=([^;]+)/) || [])[1] || '');
check('POST redeems: 303 to next with an HttpOnly Secure cookie', r.status === 303 && r.res.headers.location === '/drafts/x' && /HttpOnly/.test(setCookie) && /Secure/.test(setCookie));
check('minted cookie verifies as writer jaime', verify(minted, KEY, 'writer')?.w === 'jaime');
r = await call('POST', { body: { ticket, next: '/drafts/x' } }, writerApi, store);
check('NEGATIVE: second redeem of the same ticket is refused 409', r.status === 409 && !r.res.headers['set-cookie']);
r = await call('POST', { body: { ticket: JAIME.prez_writer } }, writerApi, store);
check('NEGATIVE: a writer cookie cannot be redeemed as a claim', r.status === 400);
const t2 = sign({ t: 'claim', w: 'jaime', n: 'Jaime', nonce: randomBytes(12).toString('hex'), exp: now() + 600 }, KEY);
r = await call('POST', { body: { ticket: t2, next: '//evil.example/x' } }, writerApi, store);
check('NEGATIVE: open redirect in next goes home instead', r.status === 303 && r.res.headers.location === '/');
const expired = sign({ t: 'claim', w: 'jaime', n: 'Jaime', nonce: randomBytes(12).toString('hex'), exp: now() - 1 }, KEY);
r = await call('POST', { body: { ticket: expired } }, writerApi, store);
check('NEGATIVE: expired claim is refused', r.status === 400);

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
