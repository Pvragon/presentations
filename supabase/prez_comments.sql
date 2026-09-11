-- prez.prgn.ai comment threads — lives in the prgn-play Supabase project (ref eordiwigblrpyydiampm)
-- so prez shares play's infra. Access is SERVICE ROLE ONLY via /api/comments (RLS on, no policies):
-- the API function is the gate (prez path password cookie + .prgn.ai identity cookie).
-- Applied 2026-09-10 via the Supabase management API. Idempotent.

create table if not exists public.prez_threads (
  id            uuid primary key default gen_random_uuid(),
  page          text not null,                       -- path, e.g. /pvragon/260910-comment-threads-test
  quote         text,                                -- exact selected text (null = page-level)
  anchor        jsonb,                               -- W3C TextQuoteSelector {exact, prefix, suffix}
  status        text not null default 'open' check (status in ('open','resolved')),
  to_agent      boolean not null default false,      -- DORMANT: agent hand-off removed 2026-09-10 at Jaime's request
  author_id     text not null,                       -- prgn_identity.playerId (device-level, .prgn.ai)
  author_name   text not null,
  author_color  text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  resolved_at   timestamptz,
  resolved_by   text
);

create table if not exists public.prez_messages (
  id            uuid primary key default gen_random_uuid(),
  thread_id     uuid not null references public.prez_threads(id) on delete cascade,
  author_id     text not null,
  author_name   text not null,
  author_color  text,
  is_agent      boolean not null default false,
  body          text not null check (char_length(body) between 1 and 4000),
  created_at    timestamptz not null default now()
);

create index if not exists prez_threads_page_status_idx on public.prez_threads (page, status, created_at);
create index if not exists prez_threads_to_agent_idx   on public.prez_threads (to_agent) where to_agent and status = 'open';
create index if not exists prez_messages_thread_idx    on public.prez_messages (thread_id, created_at);

alter table public.prez_threads  enable row level security;
alter table public.prez_messages enable row level security;
-- deliberately no policies: anon/authenticated get nothing; service role bypasses RLS.

create or replace function public.prez_touch_thread() returns trigger language plpgsql as $$
begin
  update public.prez_threads set updated_at = now() where id = new.thread_id;
  return new;
end $$;
drop trigger if exists prez_messages_touch on public.prez_messages;
create trigger prez_messages_touch after insert on public.prez_messages
  for each row execute function public.prez_touch_thread();
