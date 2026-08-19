-- ============================================================
--  Caro Leriche — inzicht per woning
--
--  Voegt toe:
--    1. extra velden op `woningen` (interne notities, bezichtigingen, ...)
--    2. tabel `gebeurtenissen` — anonieme tellingen van bezoek en kliks
--    3. view `woning_interesse` — die tellingen samengevat per woning
--
--  Gebruik: Supabase → SQL Editor → plakken → Run.
--  Veilig om opnieuw te draaien; bestaande gegevens blijven staan.
--
--  LET OP: dit is het SQL-bestand, geen code voor de site.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1. Extra velden op woningen
-- ------------------------------------------------------------
-- created_at bestond al in schema.sql; staat hij er nog niet, dan krijgen de
-- huidige woningen de datum van vandaag. "Dagen online" telt dus vanaf nu.
alter table public.woningen add column if not exists created_at      timestamptz default now();

alter table public.woningen add column if not exists notitie         text;          -- privé, alleen in het dashboard
alter table public.woningen add column if not exists contactpersoon  text;          -- eigenaar of tussenpersoon
alter table public.woningen add column if not exists referentie      text;          -- eigen referentienummer
alter table public.woningen add column if not exists exclusief_tot   date;          -- tot wanneer exclusiviteit loopt
alter table public.woningen add column if not exists bezichtigingen  jsonb default '[]'::jsonb;
-- bezichtigingen: [{ "wanneer":"2026-08-22T15:00", "wie":"Fam. Jansen",
--                    "status":"gepland|geweest|afgezegd", "notitie":"" }]

comment on column public.woningen.notitie is 'Privé-notitie, verschijnt nooit op de site';
comment on column public.woningen.bezichtigingen is 'Lijst met bezichtigingen; alleen zichtbaar in het dashboard';


-- ------------------------------------------------------------
-- 2. Gebeurtenissen: hoe vaak wordt een woning bekeken en aangeklikt
--    Er wordt niets persoonlijks bewaard: alleen welke woning, welk soort
--    gebeurtenis en wanneer. Geen IP-adres, geen cookie, geen bezoeker-id.
-- ------------------------------------------------------------
create table if not exists public.gebeurtenissen (
  id      bigint generated always as identity primary key,
  slug    text not null,
  soort   text not null check (soort in ('bezoek', 'whatsapp', 'email', 'telefoon')),
  moment  timestamptz not null default now()
);

create index if not exists gebeurtenissen_slug_idx   on public.gebeurtenissen (slug);
create index if not exists gebeurtenissen_moment_idx on public.gebeurtenissen (moment desc);

alter table public.gebeurtenissen enable row level security;

-- Bezoekers mogen alleen tellen, niets teruglezen.
drop policy if exists "iedereen mag tellen" on public.gebeurtenissen;
create policy "iedereen mag tellen"
  on public.gebeurtenissen for insert
  to anon
  with check (soort in ('bezoek', 'whatsapp', 'email', 'telefoon'));

drop policy if exists "ingelogd leest gebeurtenissen" on public.gebeurtenissen;
create policy "ingelogd leest gebeurtenissen"
  on public.gebeurtenissen for select
  to authenticated
  using (true);


-- ------------------------------------------------------------
-- 3. Samenvatting per woning (het dashboard leest deze view)
--    security_invoker: de RLS van de gebruiker geldt, dus anon ziet niets.
-- ------------------------------------------------------------
drop view if exists public.woning_interesse;
create view public.woning_interesse with (security_invoker = true) as
select
  slug,
  count(*) filter (where soort = 'bezoek')                                            as bezoeken,
  count(*) filter (where soort <> 'bezoek')                                           as kliks,
  count(*) filter (where soort = 'whatsapp')                                          as whatsapp,
  count(*) filter (where soort = 'email')                                             as email,
  count(*) filter (where soort = 'telefoon')                                          as telefoon,
  count(*) filter (where soort = 'bezoek'  and moment > now() - interval '7 days')    as bezoeken_week,
  count(*) filter (where soort <> 'bezoek' and moment > now() - interval '7 days')    as kliks_week,
  max(moment)                                                                          as laatste
from public.gebeurtenissen
group by slug;


-- ------------------------------------------------------------
-- 3b. Per dag, voor de grafieken op het overzicht
-- ------------------------------------------------------------
drop view if exists public.interesse_per_dag;
create view public.interesse_per_dag with (security_invoker = true) as
select
  (moment at time zone 'Europe/Madrid')::date                as dag,
  count(*) filter (where soort =  'bezoek')                  as bezoeken,
  count(*) filter (where soort <> 'bezoek')                  as kliks
from public.gebeurtenissen
where moment > now() - interval '120 days'
group by 1
order by 1;


-- ------------------------------------------------------------
-- 4. Controle
-- ------------------------------------------------------------
select
  (select count(*) from public.woningen)                                            as woningen,
  (select count(*) from information_schema.columns
     where table_name = 'woningen'
       and column_name in ('created_at','notitie','contactpersoon','referentie','exclusief_tot','bezichtigingen')) as nieuwe_velden,
  (select count(*) from public.gebeurtenissen)                                      as gebeurtenissen;
