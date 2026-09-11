/**
 * Edge Middleware — per-path password protection for Pvragon Presentations.
 *
 * Uses a branded HTML form that POSTs to the same URL. The middleware reads
 * the request body, validates the password, and sets an HttpOnly cookie.
 *
 * To add a new protected category:
 *   1. Add entry to PROTECTED_PATHS in lib/protected-paths.js (shared with api/comments.js)
 *   2. Set env var in Vercel: vercel env add ENV_VAR_NAME
 *   3. Redeploy — middleware picks it up automatically
 */

import { PROTECTED_PATHS } from './lib/protected-paths.js';

// Vercel statically analyses this export — it MUST be a literal (an imported identifier fails the
// build with `Unhandled type: "Identifier"`). Keep it in step with PROTECTED_PATHS in lib/protected-paths.js.
export const config = {
  matcher: ['/echo1', '/echo1/:path*', '/echo1-exec', '/echo1-exec/:path*', '/one-mahjong', '/one-mahjong/:path*'],
};

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export default async function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Find matching protected path
  let matchedPrefix = null;
  let envVarName = null;
  for (const [prefix, envVar] of Object.entries(PROTECTED_PATHS)) {
    if (path === prefix || path.startsWith(prefix + '/')) {
      matchedPrefix = prefix;
      envVarName = envVar;
      break;
    }
  }

  if (!matchedPrefix) return;

  const password = process.env[envVarName];
  if (!password) return;

  const cookieName = `prez_auth${matchedPrefix.replace(/\//g, '_')}`;

  // Handle POST — password submission
  if (request.method === 'POST') {
    try {
      const body = await request.text();
      const params = new URLSearchParams(body);
      const submitted = params.get('password');

      if (submitted === password) {
        return new Response(null, {
          status: 303,
          headers: {
            'Location': path === matchedPrefix ? matchedPrefix + '/' : path,
            'Set-Cookie': `${cookieName}=${encodeURIComponent(password)}; Path=${matchedPrefix}; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
          },
        });
      } else {
        return new Response(authPage(matchedPrefix, true), {
          status: 401,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }
    } catch (e) {
      return new Response(authPage(matchedPrefix, true), {
        status: 401,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
  }

  // Check auth cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const authCookie = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith(cookieName + '='));

  if (authCookie) {
    const value = decodeURIComponent(authCookie.split('=')[1]);
    if (value === password) return;
  }

  // Not authenticated — show prompt
  return new Response(authPage(matchedPrefix, false), {
    status: 401,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function authPage(prefix, showError) {
  const categoryName = prefix.replace(/^\//, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  // Form POSTs to the current path — middleware intercepts it
  const actionUrl = prefix + '/';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Access Required — Pvragon Presentations</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;600;700;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #112328;
      --accent-orange: #E7511F;
      --text-main: #F8FAFC;
      --text-muted: #DEEAEF;
      --text-subtle: #5E767D;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Noto Sans', sans-serif; }
    body {
      background: #080e10;
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .card {
      width: 90%;
      max-width: 420px;
      background: linear-gradient(160deg, rgba(17, 35, 40, 0.97) 0%, rgba(12, 24, 28, 0.99) 100%);
      border: 1px solid rgba(248, 250, 252, 0.08);
      border-radius: 24px;
      box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(248, 250, 252, 0.05);
      padding: 2.5rem 2.5rem 2rem;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .card::before {
      content: '';
      position: absolute;
      width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(30, 73, 88, 0.3) 0%, transparent 70%);
      top: -30%; right: -20%;
      border-radius: 50%;
      pointer-events: none;
    }
    h1 { font-size: 1.4rem; font-weight: 700; margin-bottom: 0.3rem; position: relative; }
    h1 span { color: var(--accent-orange); }
    .subtitle { color: var(--text-subtle); font-size: 0.9rem; font-weight: 300; margin-bottom: 1.8rem; position: relative; }
    form { position: relative; display: flex; flex-direction: column; gap: 0.8rem; }
    .pw { position: relative; }
    #pw {
      width: 100%;
      padding: 0.75rem 1rem;
      background: rgba(248, 250, 252, 0.04);
      border: 1px solid rgba(248, 250, 252, 0.12);
      border-radius: 10px;
      color: var(--text-main);
      font-size: 1rem;
      font-family: 'Noto Sans', sans-serif;
      outline: none;
      transition: border-color 0.2s;
      padding-right: 2.9rem;
    }
    #pw:focus { border-color: rgba(231, 81, 31, 0.5); }
    #pw::placeholder { color: var(--text-subtle); }
    .eye {
      position: absolute; top: 50%; right: 0.45rem; transform: translateY(-50%);
      width: 2.1rem; height: 2.1rem; padding: 0;
      display: flex; align-items: center; justify-content: center;
      background: transparent; border: none; border-radius: 8px;
      color: var(--text-subtle); cursor: pointer; transition: color 0.15s, background 0.15s;
    }
    .eye:hover { color: var(--text-muted); background: rgba(248, 250, 252, 0.06); transform: translateY(-50%); box-shadow: none; }
    .eye:focus-visible { outline: 2px solid rgba(231, 81, 31, 0.6); outline-offset: 1px; }
    .eye svg { width: 18px; height: 18px; }
    .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
    button[type="submit"] {
      width: 100%;
      padding: 0.75rem;
      background: linear-gradient(135deg, var(--accent-orange), #c44019);
      border: none;
      border-radius: 10px;
      color: white;
      font-size: 1rem;
      font-weight: 600;
      font-family: 'Noto Sans', sans-serif;
      cursor: pointer;
      transition: all 0.2s;
    }
    button[type="submit"]:hover { transform: scale(1.02); box-shadow: 0 0 25px rgba(231, 81, 31, 0.3); }
    .error {
      color: var(--accent-orange);
      font-size: 0.85rem;
      position: relative;
    }
    .back { margin-top: 1.2rem; position: relative; }
    .back a { color: var(--text-subtle); text-decoration: none; font-size: 0.85rem; }
    .back a:hover { color: var(--text-muted); }
  </style>
</head>
<body>
  <div class="card">
    <h1>Access <span>${categoryName}</span></h1>
    <p class="subtitle">This section requires a password</p>
    ${showError ? '<p class="error">Incorrect password. Please try again.</p>' : ''}
    <form method="POST" action="${actionUrl}">
      <div class="pw">
        <input type="password" id="pw" name="password" placeholder="Enter password" autofocus autocomplete="off" aria-describedby="pw-hint">
        <button type="button" class="eye" id="eye" aria-label="Show password" aria-pressed="false" title="Show password">
          <svg class="i-show" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
          <svg class="i-hide" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6.5 0-10-7-10-7a19.8 19.8 0 0 1 4.22-5.06"/><path d="M9.9 4.24A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a19.8 19.8 0 0 1-3.17 4.19"/><path d="M14.12 14.12A3 3 0 1 1 9.88 9.88"/><path d="M1 1l22 22"/></svg>
        </button>
      </div>
      <span id="pw-hint" class="sr-only">Use the eye button to show or hide the password</span>
      <button type="submit">Continue</button>
    </form>
    <div class="back"><a href="/">← Back to presentations</a></div>
  </div>
  <script>
    (function () {
      var pw = document.getElementById('pw'), eye = document.getElementById('eye');
      var show = eye.querySelector('.i-show'), hide = eye.querySelector('.i-hide');
      eye.addEventListener('click', function () {
        var visible = pw.type === 'password';
        pw.type = visible ? 'text' : 'password';
        show.style.display = visible ? 'none' : '';
        hide.style.display = visible ? '' : 'none';
        eye.setAttribute('aria-pressed', String(visible));
        eye.setAttribute('aria-label', visible ? 'Hide password' : 'Show password');
        eye.title = visible ? 'Hide password' : 'Show password';
        pw.focus({ preventScroll: true });
        try { pw.setSelectionRange(pw.value.length, pw.value.length); } catch (e) {}
      });
    })();
  </script>
</body>
</html>`;
}
