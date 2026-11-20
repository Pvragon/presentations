-- @rowan mentions on prez comment threads (2026-11-20). Applies on top of prez_comments.sql. Idempotent.
-- A thread reaches the agent only when the PAGE AUTHOR sends it (verified prez_writer cookie, see
-- lib/writer-auth.js). Same access model as before: RLS on, no policies, service role via /api/comments only.

-- Who published each page. Written at publish time by the agent CLI (prez_comments.py author set).
-- A page with no row falls back to DEFAULT_AUTHOR in api/comments.js ('jaime').
create table if not exists public.prez_pages (
  page         text primary key,                    -- normalized path, e.g. /drafts/261120-foo
  author_id    text not null,                       -- writer id, e.g. 'jaime'
  author_name  text not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- One-time claim tickets: the nonce of each redeemed ticket. A second redeem of the same ticket fails on the PK.
create table if not exists public.prez_claims (
  nonce        text primary key,
  writer_id    text not null,
  redeemed_at  timestamptz not null default now()
);

-- to_agent is live again (it was dormant since 2026-09-10). sent_at changes on every send, so a watcher can tell a
-- re-send after an agent reply from a thread it has already reported.
alter table public.prez_threads  add column if not exists sent_at  timestamptz;
alter table public.prez_threads  add column if not exists sent_by  text;
comment on column public.prez_threads.to_agent is 'true while the page author has sent this thread to Rowan and no agent reply has followed';

-- Set when the message came from a verified writer (the prez_writer cookie). The agent reads only these as requests.
alter table public.prez_messages add column if not exists writer_id text;

alter table public.prez_pages  enable row level security;
alter table public.prez_claims enable row level security;
