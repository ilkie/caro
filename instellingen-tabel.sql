-- ============================================================
--  Caro Leriche — vormgeving & secties
--
--  Eén rij met wat Caro zelf mag instellen vanuit het dashboard:
--    · welk kleurpalet en lettertype de site gebruikt
--    · de vaste teksten van de site (leeg = de standaardtekst)
--    · de losse keuzes daarbinnen (accent, achtergrond, tekst, donkere pagina)
--    · welke secties op de homepage staan, in welke volgorde
--
--  Gebruik: Supabase → SQL Editor → plakken → Run.
--  Veilig om opnieuw te draaien; een bestaande keuze blijft staan.
--
--  LET OP: dit is het SQL-bestand. Verwar het niet met
--  src/lib/instellingen.ts — dat is code voor de site, geen SQL.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1. Tabel (precies één rij, met id 'site')
-- ------------------------------------------------------------
create table if not exists public.instellingen (
  id          text primary key default 'site',
  palet       text not null default 'huisstijl',
  lettertype  text not null default 'huisstijl',
  teksten     jsonb not null default '{}'::jsonb,
  keuzes      jsonb not null default '{"accent":"stijl","achtergrond":"stijl","tekst":"stijl","donker":"stijl"}'::jsonb,
  secties     jsonb not null default '[
                {"id":"hero","aan":true},
                {"id":"woningen","aan":true},
                {"id":"fotografie","aan":true},
                {"id":"over","aan":true},
                {"id":"contact","aan":true}
              ]'::jsonb,
  updated_at  timestamptz default now(),
  constraint instellingen_alleen_site check (id = 'site')
);

alter table public.instellingen add column if not exists palet      text not null default 'huisstijl';
alter table public.instellingen add column if not exists lettertype text not null default 'huisstijl';
alter table public.instellingen add column if not exists teksten    jsonb not null default '{}'::jsonb;
alter table public.instellingen add column if not exists keuzes     jsonb not null default '{"accent":"stijl","achtergrond":"stijl","tekst":"stijl","donker":"stijl"}'::jsonb;
alter table public.instellingen add column if not exists secties    jsonb not null default '[]'::jsonb;
alter table public.instellingen add column if not exists updated_at timestamptz default now();

-- De ene rij aanmaken als hij er nog niet is (bestaande keuze blijft staan)
insert into public.instellingen (id) values ('site')
on conflict (id) do nothing;

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

drop trigger if exists instellingen_updated_at on public.instellingen;
create trigger instellingen_updated_at
  before update on public.instellingen
  for each row execute function public.set_updated_at();


-- ------------------------------------------------------------
-- 2. RLS
--    publiek (anon)  → mag lezen; de site heeft dit nodig bij het bouwen
--    ingelogd        → mag wijzigen vanuit het dashboard
--    Niemand mag rijen toevoegen of verwijderen: er is er maar één.
-- ------------------------------------------------------------
alter table public.instellingen enable row level security;

drop policy if exists "publiek leest instellingen" on public.instellingen;
create policy "publiek leest instellingen"
  on public.instellingen for select
  to anon
  using (true);

drop policy if exists "ingelogd leest instellingen" on public.instellingen;
create policy "ingelogd leest instellingen"
  on public.instellingen for select
  to authenticated
  using (true);

drop policy if exists "ingelogd wijzigt instellingen" on public.instellingen;
create policy "ingelogd wijzigt instellingen"
  on public.instellingen for update
  to authenticated
  using (id = 'site') with check (id = 'site');


-- ------------------------------------------------------------
-- 3. Controle
-- ------------------------------------------------------------
select id, palet, lettertype, (select count(*) from jsonb_object_keys(teksten)) as aangepaste_teksten, keuzes, jsonb_array_length(secties) as aantal_secties, updated_at
from public.instellingen;
