/* Pvragon Presentations — shared share microheader.
 *
 * A tiny, self-contained control injected into every prez.prgn.ai page. It lives
 * in a Shadow DOM so it can never collide with (or be broken by) the host page's
 * CSS — safe to drop onto any of the decks regardless of their own styling.
 *
 * Rollout: pages include  <script src="/prez-header.js" defer></script>  before
 * </body>. Add it to new pages; scripts/inject_share_header.py backfills old ones.
 */
(function () {
  if (window.__prezHeader) return;            // guard against double-inject
  window.__prezHeader = true;

  const mount = () => {
    const host = document.createElement('div');
    host.id = 'prez-header-host';
    // sits above everything; the host itself is click-through, only the pill isn't
    host.style.cssText =
      'position:fixed;top:0;right:0;z-index:2147483000;pointer-events:none';
    document.documentElement.appendChild(host);
    const root = host.attachShadow({ mode: 'open' });

    root.innerHTML = `
      <style>
        :host{ all:initial; }
        .bar{
          pointer-events:auto; position:fixed; top:12px; right:14px;
          display:flex; align-items:center; gap:6px;
          font-family:ui-monospace,"SF Mono",Menlo,Consolas,monospace;
          background:rgba(252,252,251,.82); color:#1b2b2e;
          border:1px solid rgba(20,40,42,.12); border-radius:11px;
          padding:5px 6px; box-shadow:0 2px 10px rgba(16,30,32,.14);
          -webkit-backdrop-filter:blur(10px); backdrop-filter:blur(10px);
        }
        @media (prefers-color-scheme:dark){
          .bar{ background:rgba(18,29,32,.82); color:#e7eef0; border-color:rgba(255,255,255,.12);
                box-shadow:0 2px 12px rgba(0,0,0,.4); }
        }
        button,a{
          all:unset; box-sizing:border-box; cursor:pointer; display:inline-flex;
          align-items:center; gap:6px; height:28px; padding:0 10px; border-radius:8px;
          font-size:12px; font-weight:600; letter-spacing:.01em; color:inherit;
          transition:background .12s ease;
        }
        button:hover,a:hover{ background:rgba(20,40,42,.09); }
        @media (prefers-color-scheme:dark){ button:hover,a:hover{ background:rgba(255,255,255,.1); } }
        button:focus-visible,a:focus-visible{ outline:2px solid #0a8fa0; outline-offset:2px; }
        .home{ padding:0 8px; opacity:.72; } .home:hover{ opacity:1; }
        .sep{ width:1px; height:16px; background:currentColor; opacity:.16; }
        .share.ok{ color:#0a8f6e; }
        @media (prefers-color-scheme:dark){ .share.ok{ color:#54c8a2; } }
        svg{ width:14px; height:14px; display:block; }
        .toast{
          pointer-events:none; position:fixed; top:48px; right:14px;
          background:#12201f; color:#eafaf3; font:600 12px/1 ui-monospace,monospace;
          padding:8px 12px; border-radius:9px; box-shadow:0 4px 16px rgba(0,0,0,.28);
          opacity:0; transform:translateY(-6px); transition:opacity .16s,transform .16s;
        }
        .toast.show{ opacity:1; transform:translateY(0); }
        @media (prefers-reduced-motion:reduce){ *{ transition:none!important; } }
      </style>
      <div class="bar" role="group" aria-label="Presentation controls">
        <a class="home" href="/" title="All presentations" aria-label="All presentations">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>
        </a>
        <span class="sep"></span>
        <button class="share" type="button" aria-label="Copy link to this page">
          <svg class="i-share" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>
          <span class="lbl">Share</span>
        </button>
      </div>
      <div class="toast" role="status" aria-live="polite"></div>
    `;

    const btn = root.querySelector('.share');
    const lbl = root.querySelector('.lbl');
    const toastEl = root.querySelector('.toast');
    let t;

    const toast = (msg) => {
      toastEl.textContent = msg;
      toastEl.classList.add('show');
      clearTimeout(t);
      t = setTimeout(() => toastEl.classList.remove('show'), 1900);
    };

    const flash = () => {
      btn.classList.add('ok');
      lbl.textContent = 'Copied';
      toast('Link copied to clipboard');
      setTimeout(() => { btn.classList.remove('ok'); lbl.textContent = 'Share'; }, 1900);
    };

    const copy = async () => {
      const url = location.href;
      try {
        await navigator.clipboard.writeText(url);
        flash();
      } catch (e) {
        // fallback for non-secure contexts / older browsers
        const ta = document.createElement('textarea');
        ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); flash(); }
        catch (_) { toast('Copy failed — press Ctrl/Cmd+C'); }
        ta.remove();
      }
    };

    btn.addEventListener('click', copy);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
})();
