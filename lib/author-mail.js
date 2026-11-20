/**
 * Emails a page author their one-time sign-in link, from the server, the moment "Author? Get link" is pressed.
 * Resend HTTP API (no SDK). The link goes ONLY to the author's own address, never to whoever pressed the button.
 *
 * Env (Vercel, presentations project):
 *   PREZ_RESEND_API_KEY   Resend key (vault: "Resend (Prez API Key)")
 *   PREZ_WRITER_EMAILS    JSON {"jaime":"jaime@pvragon.com", ...}: kept out of this public repo
 *   PREZ_MAIL_FROM        optional, default "Pvragon Prez <prez@pvragon.com>" (pvragon.com is verified in Resend)
 * With no key or no address for the writer, sendAuthorLink returns {sent:false} and the request stays queued for the
 * agent's fallback (prez_comments.py send-links, which sends through Gmail).
 */
import { randomBytes } from 'node:crypto';
import { sign, writerKey, CLAIM_TTL_S } from './writer-auth.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function writerEmail(env, writerId) {
  try { const m = JSON.parse(env.PREZ_WRITER_EMAILS || '{}'); return typeof m[writerId] === 'string' ? m[writerId] : null; }
  catch { return null; }
}

export function claimUrl(env, base, writerId, writerName, page) {
  const now = Math.floor(Date.now() / 1000);
  const t = sign({ t: 'claim', w: writerId, n: writerName, nonce: randomBytes(12).toString('hex'), exp: now + CLAIM_TTL_S }, writerKey(env.PREZ_AGENT_TOKEN));
  return `${base}/api/writer?${new URLSearchParams({ ticket: t, next: page })}`;
}

export async function sendAuthorLink(env, { base, writerId, writerName, page }, fetchImpl = fetch) {
  const to = writerEmail(env, writerId);
  if (!env.PREZ_RESEND_API_KEY || !env.PREZ_AGENT_TOKEN) return { sent: false, reason: 'not-configured' };
  if (!to) return { sent: false, reason: 'no-email' };
  const link = claimUrl(env, base, writerId, writerName, page);
  const html = `<p>Hi ${esc(writerName)},</p>
<p>Here is your one-time prez sign-in link. Open it in the browser you comment from and press <b>Sign in on this browser</b>:</p>
<p><a href="${esc(link)}">Sign in as the page author</a></p>
<p>After that, <b>@claude</b> in your comments (or <b>Send to Claude</b>) on your pages reaches Claude.
The link works once and expires in 24 hours. Requested from <a href="${esc(base + page)}">${esc(page)}</a>.</p>
<p>If you did not ask for it, ignore this email. It was sent only to you, and it signs in only whoever opens it.</p>
<p>— Rowan 🤖</p>`;
  const r = await fetchImpl('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.PREZ_RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.PREZ_MAIL_FROM || 'Pvragon Prez <prez@pvragon.com>', to: [to], subject: 'Your prez author sign-in link', html }),
  });
  if (!r.ok) return { sent: false, reason: `resend ${r.status}` };
  return { sent: true };
}
