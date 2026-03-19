/**
 * Edge Middleware — per-path password protection for Pvragon Presentations.
 *
 * Uses a branded HTML form that POSTs to the same URL. The middleware reads
 * the request body, validates the password, and sets an HttpOnly cookie.
 *
 * To add a new protected category:
 *   1. Add entry to PROTECTED_PATHS: '/category-name': 'ENV_VAR_NAME'
 *   2. Set env var in Vercel: vercel env add ENV_VAR_NAME
 *   3. Redeploy — middleware picks it up automatically
 */

export const config = {
  matcher: ['/echo1', '/echo1/:path*'],
};

const PROTECTED_PATHS = {
  '/echo1': 'PREZ_PW_ECHO1',
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
            'Location': matchedPrefix + '/',
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
    input[type="password"] {
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
    }
    input[type="password"]:focus { border-color: rgba(231, 81, 31, 0.5); }
    input[type="password"]::placeholder { color: var(--text-subtle); }
    button {
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
    button:hover { transform: scale(1.02); box-shadow: 0 0 25px rgba(231, 81, 31, 0.3); }
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
      <input type="password" name="password" placeholder="Enter password" autofocus autocomplete="off">
      <button type="submit">Continue</button>
    </form>
    <div class="back"><a href="/">← Back to presentations</a></div>
  </div>
</body>
</html>`;
}
