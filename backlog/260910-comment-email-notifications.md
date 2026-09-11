---
title: Email notifications for prez comment threads
created: 2026-09-10
status: backlog
scope: comments
impact: Med
effort: Low–Med
roi: Good
---

# Email notifications for prez comment threads

## Idea

When someone opens a thread or replies on a prez page, the page owner (default Jaime; per-page override
via a `<meta name="prez-owner" content="email">` tag) gets an email with the quote, the comment text and a
deep link (`<page>#comment=<thread_id>`). Today (2026-09-10) nothing is notified: comments are visible to
everyone who opens the page, and the only pull is `my-lib/executions/prez_comments.py list`.

Explicitly **not** in scope: routing threads to Rowan. Jaime removed the agent hand-off the same day.

## Options

| # | Path | Cost | New credential in Vercel | Latency | Notes |
|---|------|------|--------------------------|---------|-------|
| 1 | **Local poller + gws** — cron on Jaime's WSL box runs `prez_comments.py`, diffs a last-seen state file, emails via the already-authorised gws CLI | $0 | none | poll interval (≈5 min) | Only sends while the box is on. No new token, no new service. **Recommended first step.** |
| 2 | **Existing paid Resend account** — API function sends on create/reply | marginal $0 on the paid plan | Resend API key (domain-restricted) | instant | Free tier is NOT available alongside the paid account (Jaime). Needs 2 DNS records on the sending domain (prgn.ai) unless an already-verified domain is used. |
| 3 | **Gmail API from the function** — a fresh OAuth token scoped to `gmail.send` | $0 | Google refresh token | instant | Jaime: getting a new Workspace token is a pain. Mail would come from jaime@pvragon.com. Reusing the full-scope gws token in Vercel is off the table (blast radius). |
| 4 | **Gmail SMTP app password** from the function | $0 | app password | instant | Same credential trade as #3 with a worse credential. Listed for completeness only. |
| — | Vercel-native sender | — | — | — | Does not exist. The Marketplace Resend integration is #2 with Vercel billing. |

## Sketch for option 1

- `prez_comments.py notify` subcommand: `list --status open --json` → compare to
  `my-lib/runtime/state/prez-comments-seen.json` (thread id → last message id) → for each new thread /
  new message, `gws gmail +send --html` to the owner (HTML, never plain text — see
  `feedback_never-plain-text-email-always-html`). Owner lookup: fetch the page HTML, read
  `<meta name="prez-owner">`, default `jaime@pvragon.com`. Batch one email per run per page.
- Cron entry next to the nightly tick, every 5 min, guarded so a 503 (env vars unset) is a silent no-op.
- Upgrade path to #2 later is additive: the API gains a `notify()` on create/reply and the poller retires.

## Open questions

- Should commenters on a thread (not just the owner) be notified of replies? Requires an email per identity,
  which the device-level `prgn_identity` cookie does not carry — would mean an optional email field in the
  name picker.
- Digest vs per-comment: per-comment for owners, digest for everyone else, if the above is ever built.

## Blocked on

- `scripts/set_comments_env.sh` has not been run yet (secret-store write; Jaime runs it), so the API still
  answers `503 comments not configured`. Notifications can't be tested before that.
