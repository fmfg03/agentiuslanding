create extension if not exists pgcrypto;

create table if not exists public.leads (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    company text not null,
    workflow text not null,
    email text not null,
    source text not null default 'agentius-landing',
    created_at timestamptz not null default timezone('utc', now())
);

alter table public.leads enable row level security;

drop policy if exists "deny direct access to leads" on public.leads;
create policy "deny direct access to leads"
on public.leads
for all
using (false)
with check (false);
