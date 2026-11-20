-- "Get author link" requests from the prez comments rail (2026-11-20). Idempotent. Service role only (RLS, no policies).
-- Anyone who can open a page may ask for the page author's one-time sign-in link. The agent's watcher
-- (prez_comments.py watch --send-links) mints the link and emails it to the AUTHOR's own address, never to the asker.
create table if not exists public.prez_link_requests (
  id          uuid primary key default gen_random_uuid(),
  page        text not null,
  writer_id   text not null,                 -- the page author the link is for
  created_at  timestamptz not null default now(),
  handled_at  timestamptz,
  result      text                            -- 'sent' | 'no-email' | error text
);
create index if not exists prez_link_requests_pending_idx on public.prez_link_requests (created_at) where handled_at is null;
alter table public.prez_link_requests enable row level security;
