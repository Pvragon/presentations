/* Pvragon Presentations — anchored comment threads (the Claude-artifact comment model, on our own host).
 *
 * Loaded by prez-header.js only on pages that declare <meta name="prez-comments" content="on">
 * (document/artifact pages — not decks, not index pages). Lives in a Shadow DOM so it
 * cannot collide with the host page's CSS. Talks only to /api/comments (same origin).
 *
 * Model (borrowed from Claude artifacts):
 *   - a thread anchors to a highlighted passage (W3C TextQuoteSelector: exact + prefix/suffix), or to the page
 *   - threads survive redeploys as long as the passage still exists; orphaned threads stay listed in the rail
 *   - reply / resolve / reopen; resolved threads stay readable behind a filter
 * Identity: the shared .prgn.ai cookie `prgn_identity` {playerId, name, color} — same picker as play.prgn.ai.
 * Access: you can comment on any page you can open (the API re-checks the page password cookie).
 */
(function () {
  if (window.__prezComments) return;
  window.__prezComments = true;

  const API = '/api/comments';
  const PAGE = location.pathname.replace(/\.html$/, '').replace(/\/index$/, '/').replace(/\/+$/, '') || '/';
  const COLORS = ['#ef4444','#ff6b6b','#f97316','#f59e0b','#fcc419','#eab308','#84cc16','#65a30d','#22c55e','#10b981','#20e3b2','#14b8a6',
                  '#20c997','#06b6d4','#0ea5e9','#3b82f6','#6366f1','#8b5cf6','#a855f7','#b28dff','#d946ef','#ec4899','#f43f5e','#64748b'];
  const CTX = 40; // chars of prefix/suffix context stored with an anchor

  // ── identity (mirror of prgn-play/src/lib/identity.ts) ─────────────────────────────────────
  const ID_COOKIE = 'prgn_identity', ID_LS = 'prgn-play:identity';
  function readIdentity() {
    const m = document.cookie.match(new RegExp('(?:^|; )' + ID_COOKIE + '=([^;]+)'));
    let id = null;
    if (m) { try { id = parseId(JSON.parse(decodeURIComponent(m[1]))); } catch (_) {} }
    if (!id) { try { id = parseId(JSON.parse(localStorage.getItem(ID_LS) || 'null')); } catch (_) {} }
    return id;
  }
  function parseId(o) { return o && typeof o.playerId === 'string' && typeof o.name === 'string' && typeof o.color === 'string' ? { playerId: o.playerId, name: o.name, color: o.color } : null; }
  function saveIdentity(name, color) {
    const prev = readIdentity();
    const id = { playerId: prev ? prev.playerId : randomId(), name: name.trim().slice(0, 24) || 'Someone', color };
    const h = location.hostname, dom = h === 'prgn.ai' || h.endsWith('.prgn.ai') ? '; domain=.prgn.ai' : '';
    document.cookie = ID_COOKIE + '=' + encodeURIComponent(JSON.stringify(id)) + '; path=/; max-age=' + (60 * 60 * 24 * 365) + '; SameSite=Lax' + dom;
    try { localStorage.setItem(ID_LS, JSON.stringify(id)); } catch (_) {}
    return id;
  }
  function randomId() { const b = new Uint8Array(8); crypto.getRandomValues(b); return Array.from(b, x => x.toString(16).padStart(2, '0')).join(''); }

  // ── page text index (for anchoring) ───────────────────────────────────────────────────────
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'SVG', 'MATH']);
  function isOurs(node) { const el = node.nodeType === 1 ? node : node.parentElement; return !!(el && el.closest('#prez-header-host,#prez-comments-host,[data-prez-ignore]')); }
  function buildIndex() {
    const nodes = [], starts = []; let raw = '';
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        const p = n.parentElement; if (!p || SKIP.has(p.tagName) || isOurs(n)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    for (let n = walker.nextNode(); n; n = walker.nextNode()) { nodes.push(n); starts.push(raw.length); raw += n.nodeValue; }
    // whitespace-collapsed view + map back to raw offsets, so anchors survive reformatting
    let norm = ''; const map = []; let lastWs = true;
    for (let i = 0; i < raw.length; i++) {
      const c = raw[i], ws = /\s/.test(c);
      if (ws) { if (!lastWs) { norm += ' '; map.push(i); } lastWs = true; }
      else { norm += c; map.push(i); lastWs = false; }
    }
    return { nodes, starts, raw, norm, map };
  }
  function rawToNorm(idx, rawOff) { let lo = 0, hi = idx.map.length - 1, ans = idx.map.length; while (lo <= hi) { const mid = (lo + hi) >> 1; if (idx.map[mid] >= rawOff) { ans = mid; hi = mid - 1; } else lo = mid + 1; } return ans; }
  function nodeAt(idx, rawOff) {
    let lo = 0, hi = idx.starts.length - 1, k = 0;
    while (lo <= hi) { const mid = (lo + hi) >> 1; if (idx.starts[mid] <= rawOff) { k = mid; lo = mid + 1; } else hi = mid - 1; }
    return { node: idx.nodes[k], offset: Math.min(rawOff - idx.starts[k], idx.nodes[k].nodeValue.length) };
  }
  function rangeToRawOffsets(idx, range) {
    const i0 = idx.nodes.indexOf(range.startContainer.nodeType === 3 ? range.startContainer : firstText(range.startContainer, range.startOffset));
    const i1 = idx.nodes.indexOf(range.endContainer.nodeType === 3 ? range.endContainer : lastText(range.endContainer, range.endOffset));
    if (i0 < 0 || i1 < 0) return null;
    const s = idx.starts[i0] + (range.startContainer.nodeType === 3 ? range.startOffset : 0);
    const e = idx.starts[i1] + (range.endContainer.nodeType === 3 ? range.endOffset : idx.nodes[i1].nodeValue.length);
    return e > s ? [s, e] : null;
  }
  function firstText(el, off) { const c = el.childNodes[off] || el; const w = document.createTreeWalker(c, NodeFilter.SHOW_TEXT); return c.nodeType === 3 ? c : w.nextNode(); }
  function lastText(el, off) { const c = el.childNodes[off - 1] || el; if (c.nodeType === 3) return c; const w = document.createTreeWalker(c, NodeFilter.SHOW_TEXT); let n, last = null; while ((n = w.nextNode())) last = n; return last; }
  const collapse = (s) => s.replace(/\s+/g, ' ');
  function anchorFromRange(idx, range) {
    const off = rangeToRawOffsets(idx, range); if (!off) return null;
    const [s, e] = off; const ns = rawToNorm(idx, s), ne = rawToNorm(idx, e);
    const exact = idx.norm.slice(ns, ne).trim(); if (!exact) return null;
    return { type: 'TextQuoteSelector', exact, prefix: idx.norm.slice(Math.max(0, ns - CTX), ns), suffix: idx.norm.slice(ne, ne + CTX) };
  }
  /** Re-locate an anchor in the current page → Range, or null (orphaned). */
  function locate(idx, a) {
    if (!a || !a.exact) return null;
    const exact = collapse(a.exact).trim(); if (!exact) return null;
    const hits = []; let from = 0;
    while (hits.length < 50) { const k = idx.norm.indexOf(exact, from); if (k < 0) break; hits.push(k); from = k + 1; }
    if (!hits.length) return null;
    let best = hits[0], bestScore = -1;
    for (const k of hits) {
      const pre = idx.norm.slice(Math.max(0, k - CTX), k), suf = idx.norm.slice(k + exact.length, k + exact.length + CTX);
      const score = common(pre.split('').reverse().join(''), (a.prefix || '').split('').reverse().join('')) + common(suf, a.suffix || '');
      if (score > bestScore) { bestScore = score; best = k; }
    }
    const rs = idx.map[best], re = idx.map[best + exact.length - 1] + 1;
    const A = nodeAt(idx, rs), B = nodeAt(idx, re);
    const r = document.createRange(); r.setStart(A.node, A.offset); r.setEnd(B.node, B.offset); return r;
  }
  function common(a, b) { let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++; return i; }

  // ── highlights (CSS Custom Highlight API, with a marker fallback) ────────────────────────
  const HL_OK = 'highlights' in CSS && typeof Highlight === 'function';
  const hlAll = HL_OK ? new Highlight() : null, hlActive = HL_OK ? new Highlight() : null;
  if (HL_OK) {
    CSS.highlights.set('prez-comment', hlAll); CSS.highlights.set('prez-comment-active', hlActive);
    const st = document.createElement('style'); st.setAttribute('data-prez-ignore', '');
    st.textContent = '::highlight(prez-comment){background:rgba(250,204,21,.28);text-decoration:underline dotted rgba(217,119,6,.9) 1.5px;text-underline-offset:2px} ::highlight(prez-comment-active){background:rgba(250,204,21,.55)}';
    document.head.appendChild(st);
  }

  // ── UI ─────────────────────────────────────────────────────────────────────────────────────
  const host = document.createElement('div'); host.id = 'prez-comments-host';
  host.style.cssText = 'position:fixed;inset:0;z-index:2147482000;pointer-events:none';
  document.documentElement.appendChild(host);
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `
    <style>
      :host{ all:initial; }
      *{ box-sizing:border-box; font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; }
      .fab{ pointer-events:auto; position:fixed; display:none; align-items:center; gap:6px; padding:7px 11px; border-radius:10px;
            background:#12201f; color:#eafaf3; font:600 12px/1 system-ui,sans-serif; border:1px solid rgba(255,255,255,.14);
            box-shadow:0 6px 20px rgba(0,0,0,.28); cursor:pointer; transform:translate(-50%,-115%); }
      .fab.show{ display:inline-flex; } .fab svg{ width:14px;height:14px; }
      .marker{ pointer-events:auto; position:absolute; width:18px; height:18px; border-radius:50%; border:none; cursor:pointer;
               background:#f59e0b; color:#1b1b1b; font:700 10px/18px system-ui; text-align:center; box-shadow:0 1px 4px rgba(0,0,0,.3); padding:0; }
      .marker.resolved{ background:#9ca3af; opacity:.55; }
      .rail{ pointer-events:auto; position:fixed; top:0; right:0; height:100%; width:min(360px,100vw); transform:translateX(100%);
             transition:transform .18s ease; background:#fcfcfb; color:#1b2b2e; border-left:1px solid rgba(20,40,42,.14);
             box-shadow:-8px 0 28px rgba(16,30,32,.12); display:flex; flex-direction:column; }
      .rail.open{ transform:none; }
      @media (prefers-color-scheme:dark){ .rail{ background:#141f22; color:#e7eef0; border-color:rgba(255,255,255,.12); } }
      .hd{ display:flex; align-items:center; gap:8px; padding:12px 14px; border-bottom:1px solid rgba(127,127,127,.2); }
      .hd h2{ all:unset; font:700 14px/1 system-ui; flex:1; }
      .chip{ display:inline-flex; align-items:center; gap:6px; font:600 12px/1 system-ui; padding:4px 8px; border-radius:999px; background:rgba(127,127,127,.12); cursor:pointer; border:none; color:inherit; }
      .dot{ width:10px; height:10px; border-radius:50%; display:inline-block; }
      .x{ all:unset; cursor:pointer; padding:6px; border-radius:8px; line-height:0; } .x:hover{ background:rgba(127,127,127,.15); }
      .tools{ display:flex; gap:8px; padding:10px 14px; border-bottom:1px solid rgba(127,127,127,.2); font-size:12px; align-items:center; }
      .tools button{ all:unset; cursor:pointer; font:600 12px/1 system-ui; padding:6px 9px; border-radius:8px; background:rgba(127,127,127,.12); color:inherit; }
      .tools label{ margin-left:auto; display:flex; gap:5px; align-items:center; opacity:.8; }
      .list{ flex:1; overflow:auto; padding:10px 12px 24px; display:flex; flex-direction:column; gap:10px; }
      .t{ border:1px solid rgba(127,127,127,.22); border-radius:12px; padding:10px 12px; background:rgba(127,127,127,.05); }
      .t.active{ border-color:#f59e0b; box-shadow:0 0 0 2px rgba(245,158,11,.25); }
      .t.resolved{ opacity:.7; }
      .q{ font:italic 12px/1.4 system-ui; opacity:.8; border-left:3px solid #f59e0b; padding:2px 8px; margin:0 0 8px; cursor:pointer; max-height:4.2em; overflow:hidden; }
      .q.orphan{ border-color:#9ca3af; } .q.orphan::after{ content:" (passage no longer on page)"; opacity:.7; font-style:normal; }
      .m{ display:flex; gap:8px; margin:6px 0; font-size:13px; line-height:1.45; }
      .m .dot{ margin-top:5px; flex:none; } .m b{ font-weight:700; } .m .when{ opacity:.55; font-size:11px; margin-left:6px; }
      .m.agent{ background:rgba(10,143,160,.09); border-radius:8px; padding:6px 8px; margin-left:-4px; }
      .m p{ margin:2px 0 0; white-space:pre-wrap; word-wrap:break-word; }
      .row{ display:flex; gap:6px; align-items:center; margin-top:8px; flex-wrap:wrap; }
      .row button,.row .tog{ all:unset; cursor:pointer; font:600 11px/1 system-ui; padding:5px 8px; border-radius:7px; background:rgba(127,127,127,.12); color:inherit; }
      textarea{ width:100%; min-height:58px; resize:vertical; font:13px/1.4 system-ui; padding:8px; border-radius:8px; border:1px solid rgba(127,127,127,.3); background:transparent; color:inherit; margin-top:8px; }
      textarea:focus{ outline:2px solid rgba(10,143,160,.5); }
      .empty{ opacity:.65; font-size:13px; padding:18px 8px; text-align:center; line-height:1.5; }
      .compose{ position:fixed; pointer-events:auto; width:min(320px,92vw); background:#fcfcfb; color:#1b2b2e; border:1px solid rgba(20,40,42,.16); border-radius:12px; padding:10px; box-shadow:0 10px 30px rgba(16,30,32,.22); display:none; }
      .compose.show{ display:block; }
      @media (prefers-color-scheme:dark){ .compose{ background:#141f22; color:#e7eef0; border-color:rgba(255,255,255,.14); } }
      .compose .q{ margin-bottom:4px; }
      .modal{ pointer-events:auto; position:fixed; inset:0; background:rgba(8,14,16,.6); backdrop-filter:blur(4px); display:none; align-items:center; justify-content:center; padding:20px; }
      .modal.show{ display:flex; }
      .card{ width:min(400px,100%); background:#fcfcfb; color:#1b2b2e; border-radius:14px; padding:18px; box-shadow:0 20px 50px rgba(0,0,0,.4); }
      @media (prefers-color-scheme:dark){ .card{ background:#141f22; color:#e7eef0; } }
      .card h3{ margin:0 0 4px; font:700 16px/1.2 system-ui; } .card p{ margin:0 0 12px; font-size:13px; opacity:.75; }
      .card label{ display:block; font:600 11px/1 system-ui; letter-spacing:.06em; text-transform:uppercase; opacity:.7; margin:10px 0 6px; }
      .card input{ width:100%; padding:8px 10px; border-radius:8px; border:1px solid rgba(127,127,127,.35); background:transparent; color:inherit; font:14px system-ui; }
      .grid{ display:grid; grid-template-columns:repeat(8,1fr); gap:6px; }
      .grid button{ all:unset; height:28px; border-radius:6px; cursor:pointer; border:2px solid transparent; }
      .grid button.on{ border-color:currentColor; transform:scale(1.08); }
      .save{ all:unset; display:block; width:100%; text-align:center; margin-top:14px; padding:10px; border-radius:9px; background:#0a8fa0; color:#fff; font:600 14px system-ui; cursor:pointer; }
      .save[disabled]{ opacity:.5; cursor:default; }
      .toast{ pointer-events:none; position:fixed; bottom:18px; left:50%; transform:translateX(-50%) translateY(8px); background:#12201f; color:#eafaf3; font:600 12px/1 system-ui; padding:8px 12px; border-radius:9px; opacity:0; transition:opacity .16s,transform .16s; }
      .toast.show{ opacity:1; transform:translateX(-50%); }
      @media (prefers-reduced-motion:reduce){ *{ transition:none!important; } }
    </style>
    <button class="fab" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Comment</button>
    <div class="markers"></div>
    <div class="compose" role="dialog" aria-label="New comment">
      <div class="q cq"></div>
      <textarea class="ctext" placeholder="Write a comment…"></textarea>
      <div class="row"><button class="csend" type="button">Post</button><button class="ccancel" type="button">Cancel</button></div>
    </div>
    <aside class="rail" aria-label="Comments">
      <div class="hd"><h2>Comments</h2><button class="chip who" type="button" title="Change your name or color"><span class="dot"></span><span class="nm">Set your name</span></button><button class="x close" type="button" aria-label="Close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div>
      <div class="tools"><button class="pagec" type="button">+ Comment on page</button><label><input type="checkbox" class="showres"> show resolved</label></div>
      <div class="list"></div>
    </aside>
    <div class="modal"><form class="card"><h3>Pick a name + color</h3><p>Remembered on this device for every prgn.ai site.</p>
      <label>Your name</label><input class="iname" maxlength="24" placeholder="e.g. Avery" autocomplete="off">
      <label>Your color</label><div class="grid"></div>
      <button class="save" type="submit">Save</button></form></div>
    <div class="toast" role="status" aria-live="polite"></div>`;
  const $ = (s) => root.querySelector(s);
  const fab = $('.fab'), rail = $('.rail'), list = $('.list'), markers = $('.markers'), compose = $('.compose'), modal = $('.modal'), toastEl = $('.toast');

  let idx = buildIndex(), identity = readIdentity(), threads = [], located = new Map(), activeId = null, pendingAnchor = null, pendingRange = null, afterIdentity = null, timer = null;
  const toast = (m) => { toastEl.textContent = m; toastEl.classList.add('show'); clearTimeout(timer); timer = setTimeout(() => toastEl.classList.remove('show'), 2000); };
  const fmtWhen = (iso) => { const d = new Date(iso), diff = (Date.now() - d) / 6e4; return diff < 1 ? 'now' : diff < 60 ? Math.round(diff) + 'm' : diff < 1440 ? Math.round(diff / 60) + 'h' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  // header button (prez-header.js exposes its shadow root)
  function mountHeaderButton() {
    const hr = window.__prezHeaderRoot; if (!hr || hr.querySelector('.comments')) return;
    const bar = hr.querySelector('.bar'); if (!bar) return;
    const sep = document.createElement('span'); sep.className = 'sep';
    const b = document.createElement('button'); b.type = 'button'; b.className = 'comments'; b.setAttribute('aria-label', 'Comments');
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span class="clbl">Comments</span>';
    b.addEventListener('click', () => toggleRail());
    bar.appendChild(sep); bar.appendChild(b);
  }
  function updateHeaderCount() { const hr = window.__prezHeaderRoot; const l = hr && hr.querySelector('.clbl'); if (!l) return; const n = threads.filter(t => t.status === 'open').length; l.textContent = n ? `Comments (${n})` : 'Comments'; }

  async function api(method, payload, query) {
    const r = await fetch(API + (query ? '?' + new URLSearchParams(query) : ''), { method, headers: { 'Content-Type': 'application/json' }, body: payload ? JSON.stringify(payload) : undefined, credentials: 'same-origin' });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(j.error || r.statusText); e.status = r.status; e.need = j.need; throw e; }
    return j;
  }
  async function load() {
    try { const j = await api('GET', null, { page: PAGE }); threads = j.threads || []; if (j.identity && !identity) identity = j.identity; }
    catch (e) { if (e.status !== 503) console.warn('[prez-comments]', e.message); threads = []; }
    render();
  }
  function render() {
    idx = buildIndex(); located = new Map();
    if (HL_OK) { hlAll.clear(); hlActive.clear(); }
    markers.innerHTML = '';
    for (const t of threads) {
      const r = t.anchor ? locate(idx, t.anchor) : null; located.set(t.id, r);
      if (r && t.status === 'open' && HL_OK) hlAll.add(r);
      if (r) {
        const rect = r.getBoundingClientRect(); const m = document.createElement('button'); m.className = 'marker' + (t.status === 'resolved' ? ' resolved' : '');
        m.textContent = t.messages.length; m.title = (t.messages[0] && t.messages[0].author_name) || ''; m.style.left = (rect.right + window.scrollX + 4) + 'px'; m.style.top = (rect.top + window.scrollY - 6) + 'px';
        m.addEventListener('click', () => { openRail(); focusThread(t.id); }); markers.appendChild(m);
      }
    }
    const who = $('.who'); who.querySelector('.dot').style.background = identity ? identity.color : 'transparent'; who.querySelector('.nm').textContent = identity ? identity.name : 'Set your name';
    const showRes = $('.showres').checked; const vis = threads.filter(t => showRes || t.status === 'open');
    list.innerHTML = vis.length ? '' : `<div class="empty">${threads.length ? 'No open threads. Tick “show resolved” to see closed ones.' : 'No comments yet. Select some text and click <b>Comment</b>, or use <b>+ Comment on page</b>.'}</div>`;
    const order = (t) => (t.status === 'open' ? 0 : 1);
    for (const t of vis.slice().sort((a, b) => order(a) - order(b) || a.created_at.localeCompare(b.created_at))) list.appendChild(threadEl(t));
    updateHeaderCount();
  }
  function threadEl(t) {
    const el = document.createElement('div'); el.className = 't' + (t.status === 'resolved' ? ' resolved' : '') + (t.id === activeId ? ' active' : ''); el.dataset.id = t.id;
    const r = located.get(t.id);
    let html = t.quote ? `<div class="q ${r ? '' : 'orphan'}" title="Jump to passage">${esc(t.quote)}</div>` : '<div class="q" style="border-color:#9ca3af">Whole page</div>';
    for (const m of t.messages) html += `<div class="m ${m.is_agent ? 'agent' : ''}"><span class="dot" style="background:${esc(m.author_color || '#999')}"></span><div><b>${esc(m.author_name)}</b><span class="when">${fmtWhen(m.created_at)}</span><p>${esc(m.body)}</p></div></div>`;
    if (t.status === 'resolved') html += `<div class="m" style="opacity:.6;font-size:12px"><span></span><div>Resolved${t.resolved_by ? ' by ' + esc(t.resolved_by) : ''}${t.resolved_at ? ' · ' + fmtWhen(t.resolved_at) : ''}</div></div>`;
    html += `<textarea class="rtext" placeholder="Reply…"></textarea><div class="row"><button class="reply">Reply</button>${t.status === 'open' ? '<button class="resolve">Resolve</button>' : '<button class="reopen">Reopen</button>'}</div>`;
    el.innerHTML = html;
    const q = el.querySelector('.q'); if (q && r) q.addEventListener('click', () => focusThread(t.id, true));
    const ta = el.querySelector('.rtext');
    const act = async (action, extra) => { try { await ensureIdentity(); await api('POST', { action, thread_id: t.id, ...extra }); await load(); } catch (e) { if (e.need !== 'identity') toast(e.message); } };
    el.querySelector('.reply').addEventListener('click', () => { const v = ta.value.trim(); if (!v) return ta.focus(); act('reply', { body: v }); });
    ta.addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') el.querySelector('.reply').click(); });
    const res = el.querySelector('.resolve'); if (res) res.addEventListener('click', () => act('resolve', { body: ta.value.trim() }));
    const reo = el.querySelector('.reopen'); if (reo) reo.addEventListener('click', () => act('reopen', {}));
    return el;
  }
  function focusThread(id, scroll) {
    activeId = id; const r = located.get(id);
    if (HL_OK) { hlActive.clear(); if (r) hlActive.add(r); }
    if (r && scroll !== false) { const rect = r.getBoundingClientRect(); if (rect.top < 60 || rect.bottom > innerHeight - 40) window.scrollBy({ top: rect.top - innerHeight / 3, behavior: 'smooth' }); }
    list.querySelectorAll('.t').forEach(e => e.classList.toggle('active', e.dataset.id === id));
    const el = list.querySelector(`.t[data-id="${id}"]`); if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  // The share header is fixed top-right at a higher z-index; slide it left while the rail is open so it
  // never covers the rail's own title.
  function shiftHeader(open) { const h = document.getElementById('prez-header-host'); if (h) h.style.transform = open ? `translateX(-${Math.min(360, innerWidth)}px)` : ''; }
  function openRail() { if (!rail.classList.contains('open')) { rail.classList.add('open'); shiftHeader(true); load(); } }
  function closeRail() { rail.classList.remove('open'); shiftHeader(false); }
  function toggleRail() { rail.classList.contains('open') ? closeRail() : openRail(); }
  $('.close').addEventListener('click', closeRail);
  $('.showres').addEventListener('change', render);
  $('.who').addEventListener('click', () => showIdentity());
  $('.pagec').addEventListener('click', () => startCompose(null, null));

  // ── selection → floating Comment button → compose popover ───────────────────────────────
  function onSelection() {
    const sel = document.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount || compose.classList.contains('show')) { fab.classList.remove('show'); return; }
    const range = sel.getRangeAt(0);
    if (isOurs(range.commonAncestorContainer) || !document.body.contains(range.commonAncestorContainer)) { fab.classList.remove('show'); return; }
    if (!sel.toString().trim()) { fab.classList.remove('show'); return; }
    const rect = range.getBoundingClientRect(); if (!rect.width && !rect.height) return;
    fab.style.left = (rect.left + rect.width / 2) + 'px'; fab.style.top = (rect.top) + 'px'; fab.classList.add('show');
    pendingRange = range.cloneRange();
  }
  document.addEventListener('mouseup', () => setTimeout(onSelection, 0));
  document.addEventListener('keyup', (e) => { if (e.shiftKey || e.key === 'Shift') setTimeout(onSelection, 0); });
  document.addEventListener('mousedown', (e) => { if (!e.composedPath().includes(host)) fab.classList.remove('show'); });
  fab.addEventListener('mousedown', (e) => e.preventDefault());
  fab.addEventListener('click', () => { if (!pendingRange) return; const a = anchorFromRange(buildIndex(), pendingRange); if (!a) return toast('Could not anchor that selection'); startCompose(a, pendingRange); });
  function startCompose(anchor, range) {
    pendingAnchor = anchor; fab.classList.remove('show');
    $('.cq').textContent = anchor ? anchor.exact : 'Whole page'; $('.cq').style.borderColor = anchor ? '#f59e0b' : '#9ca3af';
    $('.ctext').value = '';
    if (range) { const rect = range.getBoundingClientRect(); const w = Math.min(320, innerWidth * 0.92); compose.style.left = Math.max(8, Math.min(innerWidth - w - 8, rect.left)) + 'px'; compose.style.top = Math.min(innerHeight - 220, rect.bottom + 8) + 'px'; }
    else { compose.style.left = Math.max(8, innerWidth - Math.min(360, innerWidth) - 340) + 'px'; compose.style.top = '72px'; }
    compose.classList.add('show'); $('.ctext').focus();
  }
  $('.ccancel').addEventListener('click', () => compose.classList.remove('show'));
  $('.ctext').addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') $('.csend').click(); if (e.key === 'Escape') compose.classList.remove('show'); });
  $('.csend').addEventListener('click', async () => {
    const text = $('.ctext').value.trim(); if (!text) return $('.ctext').focus();
    try {
      await ensureIdentity();
      const j = await api('POST', { action: 'create', page: PAGE, anchor: pendingAnchor, body: text });
      compose.classList.remove('show'); document.getSelection().removeAllRanges(); openRail(); await load(); focusThread(j.thread.id, false); toast('Comment posted');
    } catch (e) { if (e.need !== 'identity') toast(e.status === 401 ? 'This page is locked — unlock it first' : e.message); }
  });

  // ── identity modal ───────────────────────────────────────────────────────────────────────
  const grid = $('.grid'); let pickedColor = identity ? identity.color : COLORS[15];
  for (const c of COLORS) { const b = document.createElement('button'); b.type = 'button'; b.style.background = c; b.setAttribute('aria-label', c); b.addEventListener('click', () => { pickedColor = c; grid.querySelectorAll('button').forEach(x => x.classList.toggle('on', x.style.background === b.style.background)); }); grid.appendChild(b); }
  function showIdentity() { $('.iname').value = identity ? identity.name : ''; pickedColor = identity ? identity.color : pickedColor; grid.querySelectorAll('button').forEach(x => x.classList.toggle('on', x.getAttribute('aria-label') === pickedColor)); modal.classList.add('show'); $('.iname').focus(); }
  function ensureIdentity() {
    identity = identity || readIdentity();
    if (identity) return Promise.resolve(identity);
    return new Promise((resolve, reject) => { afterIdentity = { resolve, reject }; showIdentity(); });
  }
  $('.card').addEventListener('submit', (e) => { e.preventDefault(); const n = $('.iname').value.trim(); if (!n) return; identity = saveIdentity(n, pickedColor); modal.classList.remove('show'); render(); if (afterIdentity) { afterIdentity.resolve(identity); afterIdentity = null; } });
  modal.addEventListener('click', (e) => { if (e.target === modal) { modal.classList.remove('show'); if (afterIdentity) { afterIdentity.reject(Object.assign(new Error('cancelled'), { need: 'identity' })); afterIdentity = null; } } });

  // ── boot ─────────────────────────────────────────────────────────────────────────────────
  let raf = 0; const reflow = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(render); };
  window.addEventListener('resize', reflow);
  mountHeaderButton(); setTimeout(mountHeaderButton, 400);
  load();
  if (location.hash.startsWith('#comment=')) { openRail(); setTimeout(() => focusThread(location.hash.slice(9)), 600); }
  setInterval(() => { if (rail.classList.contains('open') && document.visibilityState === 'visible') load(); }, 45000);
})();
