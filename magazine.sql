-- ============================================================
--  Caro Leriche — het magazine meetellen
--
--  De woningpagina heeft een knop "Download het magazine". Dit bestand zorgt
--  dat die klik net zo geteld wordt als een klik op WhatsApp, e-mail of
--  telefoon: alleen wélke woning, wélk soort en wannéér. Geen IP, geen cookie,
--  geen bezoeker-id.
--
--  Gebruik: Supabase → SQL Editor → plakken → Run.
--  Veilig om opnieuw te draaien; bestaande tellingen blijven staan.
--
--  LET OP: dit is het SQL-bestand, geen code voor de site.
-- ============================================================

-- ------------------------------------------------------------
-- 1. 'magazine' toestaan als soort gebeurtenis
-- ------------------------------------------------------------
alter table public.gebeurtenissen drop constraint if exists gebeurtenissen_soort_check;
alter table public.gebeurtenissen add  constraint gebeurtenissen_soort_check
  check (soort in ('bezoek', 'whatsapp', 'email', 'telefoon', 'magazine'));

-- De regel die bepaalt wat een bezoeker mag wegschrijven, moet dezelfde lijst
-- kennen — anders wordt de klik geweigerd.
drop policy if exists "iedereen mag tellen" on public.gebeurtenissen;
create policy "iedereen mag tellen"
  on public.gebeurtenissen for insert
  to anon
  with check (soort in ('bezoek', 'whatsapp', 'email', 'telefoon', 'magazine'));

-- ------------------------------------------------------------
-- 2. De samenvatting per woning krijgt een kolom erbij
-- ------------------------------------------------------------
drop view if exists public.woning_interesse;
create view public.woning_interesse with (security_invoker = true) as
select
  slug,
  count(*) filter (where soort =  'bezoek')                                        as bezoeken,
  count(*) filter (where soort <> 'bezoek')                                        as kliks,
  count(*) filter (where soort =  'whatsapp')                                      as whatsapp,
  count(*) filter (where soort =  'email')                                         as email,
  count(*) filter (where soort =  'telefoon')                                      as telefoon,
  count(*) filter (where soort =  'magazine')                                      as magazine,
  count(*) filter (where soort =  'bezoek' and moment > now() - interval '7 days') as bezoeken_week,
  count(*) filter (where soort <> 'bezoek' and moment > now() - interval '7 days') as kliks_week,
  max(moment)                                                                       as laatste
from public.gebeurtenissen
group by slug;

-- ------------------------------------------------------------
-- 3. Controle
--    magazine_toegestaan hoort 1 te zijn, kolom_in_de_view ook.
-- ------------------------------------------------------------
select
  (select count(*) from pg_constraint
     where conname = 'gebeurtenissen_soort_check'
       and pg_get_constraintdef(oid) like '%magazine%')            as magazine_toegestaan,
  (select count(*) from information_schema.columns
     where table_name = 'woning_interesse' and column_name = 'magazine') as kolom_in_de_view;
