-- ============================================================
--  Caro Leriche — Real Estate Spain
--  Supabase schema (tabel `woningen` + storage-bucket `media` + RLS)
--
--  Gereconstrueerd aug 2026 op basis van de live code:
--    src/lib/supabase.ts  (type Woning + queries)
--    public/beheer/index.html  (dashboard: insert/update/delete + upload)
--
--  Gebruik: Supabase → SQL Editor → dit hele bestand plakken → Run.
--  Veilig om opnieuw te draaien: alles is IF NOT EXISTS / DROP-then-CREATE.
--  Bestaande data blijft staan (er wordt niets verwijderd).
-- ============================================================

-- gen_random_uuid()
create extension if not exists pgcrypto;


-- ------------------------------------------------------------
-- 1. Tabel: woningen
-- ------------------------------------------------------------
create table if not exists public.woningen (
  id                uuid primary key default gen_random_uuid(),

  -- basis
  titel             text        not null,
  slug              text        not null unique,   -- URL: /woning/<slug>
  plaats            text,
  regio             text,
  status            text        default 'Te koop', -- Te koop | Onder optie | Verkocht

  -- cijfers
  prijs             numeric,
  slaapkamers       integer,
  badkamers         integer,
  woonoppervlak     integer,                        -- m2
  perceel           integer,                        -- m2
  bouwjaar          integer,

  -- media
  hero              text,                           -- URL of pad, bv. /media/paz/hero.jpg
  video             text,                           -- mp4-URL voor de hero-video

  -- inhoud
  omschrijving      text,
  kenmerken_binnen  text[]      default '{}',
  kenmerken_buiten  text[]      default '{}',
  galerij           jsonb       default '[]'::jsonb, -- [{ "src": "...", "label": "..." }]
  afstanden         jsonb       default '[]'::jsonb, -- [{ "plek": "...", "tijd": "..." }]

  -- sortering & zichtbaarheid
  volgorde          integer     default 10,          -- lager = hoger in de lijst
  beschikbaar       boolean     default true,        -- tonen op de site
  uitgelicht        boolean     default false,       -- spotlight (max. één)

  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- Kolommen bijwerken als de tabel al bestond in een oudere vorm
alter table public.woningen add column if not exists plaats           text;
alter table public.woningen add column if not exists regio            text;
alter table public.woningen add column if not exists status           text default 'Te koop';
alter table public.woningen add column if not exists prijs            numeric;
alter table public.woningen add column if not exists slaapkamers      integer;
alter table public.woningen add column if not exists badkamers        integer;
alter table public.woningen add column if not exists woonoppervlak    integer;
alter table public.woningen add column if not exists perceel          integer;
alter table public.woningen add column if not exists bouwjaar         integer;
alter table public.woningen add column if not exists hero             text;
alter table public.woningen add column if not exists video            text;
alter table public.woningen add column if not exists omschrijving     text;
alter table public.woningen add column if not exists kenmerken_binnen text[]  default '{}';
alter table public.woningen add column if not exists kenmerken_buiten text[]  default '{}';
alter table public.woningen add column if not exists galerij          jsonb   default '[]'::jsonb;
alter table public.woningen add column if not exists afstanden        jsonb   default '[]'::jsonb;
alter table public.woningen add column if not exists volgorde         integer default 10;
alter table public.woningen add column if not exists beschikbaar      boolean default true;
alter table public.woningen add column if not exists uitgelicht       boolean default false;
alter table public.woningen add column if not exists created_at       timestamptz default now();
alter table public.woningen add column if not exists updated_at       timestamptz default now();

-- Indexen (de site sorteert op volgorde en filtert op beschikbaar)
create index if not exists woningen_volgorde_idx    on public.woningen (volgorde);
create index if not exists woningen_beschikbaar_idx on public.woningen (beschikbaar);

-- updated_at automatisch bijhouden
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists woningen_updated_at on public.woningen;
create trigger woningen_updated_at
  before update on public.woningen
  for each row execute function public.set_updated_at();


-- ------------------------------------------------------------
-- 2. RLS op woningen
--    publiek (anon)      → mag alleen beschikbare woningen lézen
--    ingelogd (auth)     → mag alles lezen en schrijven (dashboard)
--
--    LET OP: dit is de huidige, ruime opzet — elke ingelogde gebruiker
--    mag alles wijzigen. Zie to-do "beveiliging aanscherpen".
-- ------------------------------------------------------------
alter table public.woningen enable row level security;

drop policy if exists "publiek leest beschikbare woningen" on public.woningen;
create policy "publiek leest beschikbare woningen"
  on public.woningen for select
  to anon
  using (beschikbaar = true);

drop policy if exists "ingelogd leest alles" on public.woningen;
create policy "ingelogd leest alles"
  on public.woningen for select
  to authenticated
  using (true);

drop policy if exists "ingelogd voegt toe" on public.woningen;
create policy "ingelogd voegt toe"
  on public.woningen for insert
  to authenticated
  with check (true);

drop policy if exists "ingelogd wijzigt" on public.woningen;
create policy "ingelogd wijzigt"
  on public.woningen for update
  to authenticated
  using (true) with check (true);

drop policy if exists "ingelogd verwijdert" on public.woningen;
create policy "ingelogd verwijdert"
  on public.woningen for delete
  to authenticated
  using (true);


-- ------------------------------------------------------------
-- 3. Storage-bucket `media` (publiek leesbaar)
--    Dashboard-uploads gaan naar pad woningen/<timestamp>-<random>.jpg
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "media publiek leesbaar" on storage.objects;
create policy "media publiek leesbaar"
  on storage.objects for select
  to public
  using (bucket_id = 'media');

drop policy if exists "media upload door ingelogd" on storage.objects;
create policy "media upload door ingelogd"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');

drop policy if exists "media wijzigen door ingelogd" on storage.objects;
create policy "media wijzigen door ingelogd"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media');

drop policy if exists "media verwijderen door ingelogd" on storage.objects;
create policy "media verwijderen door ingelogd"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media');


-- ------------------------------------------------------------
-- 4. Controle
-- ------------------------------------------------------------
select column_name, data_type, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'woningen'
order by ordinal_position;
