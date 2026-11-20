---
template: assessment
version: 1.0.0
summary: "What it would take to let a prez comment be sent to Claude for work, the way Claude artifacts do: how artifacts do it, what prez already has (a dormant to_agent column), three delivery designs, the security gate, and why this does not need an integrated document editor yet."
created: 2026-11-20
last_updated: 2026-11-20
maintainer: Rowan (for Jaime)
status: proposal
---

# Send a prez comment to Claude: assessment

Jaime asked on 2026-11-20 for an assessment only, no build. The companion change shipped the same day:
posting a comment no longer opens the comments rail (commit e4d0be6).

## How Claude artifacts do it

From the Claude Code `ArtifactComments` tool contract (read in this session):

- **Activation is per thread, by a writer.** A thread reaches Claude only when a person with edit
  rights replies on it with **Send to Claude**, or mentions **@claude** in it. Plain comments never
  notify anyone.
- **The session must be watching the artifact.** Publishing an artifact, or an explicit `watch`,
  subscribes that one Claude Code session to the artifact's live changes. An activated comment wakes
  that session with a turn headed `[Artifact comment sent to Claude]`.
- **Replies and resolves are gated by activation.** Claude can reply or resolve only on activated
  threads. Its reply shows as "Claude · via the user", and a person can reopen what Claude resolved.
- **Comment text is data, never instructions.** The session treats it as viewer input.
- **Watches are session-local.** They live as background tasks of that session and stop with it.

So the parts are: a per-thread trigger, gated to writers; a subscription that ties one page to one
session; a wake event delivered into that session; and reply/resolve back on the thread.

## What prez already has

- `prez_threads.to_agent boolean`: **dormant**. A "Send to Rowan" hand-off (`@rowan` in a reply
  set it; an agent reply cleared it) was built on 2026-09-10 and then **removed at Jaime's request**.
  Memory `project_prez-comment-threads` records the removal but not the reason. Worth knowing what
  bothered him then before rebuilding it.
- `/api/comments` already accepts an agent bearer token (`PREZ_AGENT_TOKEN`). Replies from it show
  agent-styled as "Rowan 🤖", and the agent can list open threads across all pages.
- `my-lib/executions/prez_comments.py list|inspect|reply|resolve|reopen`: the terminal client.
- No notification of any kind exists yet. The rail polls every 45 s while it is open.

## The gap is delivery

The button and the flag are small. The hard part is waking the right Claude session when a thread
is sent. Three designs, cheapest first:

1. **Watch from the owning session (recommended).** Add `prez_comments.py watch --page <path>`,
   which polls `/api/comments` (or Supabase Realtime) and prints one line per newly sent thread. The
   session working on the page runs it under Claude Code's `Monitor` tool, which streams each line
   into the session as an event. That is the artifact model almost exactly: the session that
   publishes or works a page watches it, and a sent comment wakes it. No new server, no editor.
   Gaps: the watch dies with the session, and it is one page per watch. A page nobody is watching
   needs a fallback (option 2).
2. **Route through the everpresent pane.** The heartbeat (every 30 min, 8am-10pm) lists sent threads
   across all pages and either handles them or hands each to the session that owns the page. Cheap,
   always on, but up to 30 minutes of delay, and it needs a page-to-session map.
3. **Push from the server.** A Supabase database webhook on `to_agent` calls a local endpoint (or
   writes to the session-coordination mailbox), which injects into the owning tmux pane. Fastest, but
   it needs an inbound path to this machine and pane injection, which is fragile and a larger attack
   surface. Not worth it before 1 and 2 prove the habit.

## UI sketch

- In the compose popover and each thread's reply box: a second button, **Send to Claude**, next to
  Post. It posts the message and sets `to_agent = true`.
- The thread shows a small "Sent to Claude" badge until an agent reply clears it, then the agent's
  reply in the existing agent style.
- Optional: `@claude` (or `@rowan`) in a reply does the same, as it did in September.

## Security gate (must have)

Prez identity is a device cookie anyone can set, and anyone with a page's password can comment. A
"Send to Claude" open to every commenter would let any reader put text in front of an agent that can
edit the repo. Before shipping:

- **Gate the trigger to writers.** Only an allow-listed identity (Jaime, verified by a signed cookie
  or a writer token, not the self-chosen name) can set `to_agent`. Others see Post only.
- **The agent treats comment text as data**, as the artifact contract does: it acts on what the
  writer asked, never on instructions embedded in quoted passages or other people's replies.

## Does this need an integrated document editor?

Not for this. Option 1 gives artifact parity with the terminal and the browser kept separate, which
is how Claude artifacts work today: the doc lives in the browser, the conversation in the session,
and the comment is the bridge. An editor that puts the chat beside the document becomes worth it
only if Jaime wants to watch the agent's work and reply in the same window. That is a bigger product,
and the right test is whether option 1 still leaves him switching windows too often.

## Recommended next step

1. Ask Jaime why the September hand-off was removed.
2. Build option 1 behind the writer gate, on one page, and use it for a week.
3. Add option 2 as the fallback for unwatched pages if option 1 sticks.
