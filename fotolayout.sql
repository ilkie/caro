-- ============================================================
--  Caro Leriche — vrijheid in de fotolayout
--
--  Voegt toe:
--    1. instellingen.fotolayout — de standaard voor de hele site
--    2. woningen.fotolayout     — leeg = volgt de standaard, anders eigen keuze
--    3. de etalage-views weten van beide af
--
--  De volgorde van de foto's en welke foto groot mag, zit al in `galerij`;
--  daar is geen nieuwe kolom voor nodig.
--
--  Gebruik: Supabase → SQL Editor → plakken → Run.
--  Veilig om opnieuw te draaien; bestaande gegevens blijven staan.
--
--  LET OP: dit is het SQL-bestand, geen code voor de site.
-- ============================================================

-- ------------------------------------------------------------
-- 1. De standaard voor de hele site
-- ------------------------------------------------------------
alter table public.instellingen
  add column if not exists fotolayout jsonb
  default '{"stijl":"kolommen","kolommen":3,"marge":"normaal"}'::jsonb;

update public.instellingen
   set fotolayout = '{"stijl":"kolommen","kolommen":3,"marge":"normaal"}'::jsonb
 where fotolayout is null;

comment on column public.instellingen.fotolayout is
  'Standaardopmaak van de fotogalerij: {"stijl":"kolommen|raster|editorial","kolommen":2|3|4,"marge":"krap|normaal|ruim"}';

-- ------------------------------------------------------------
-- 2. Per woning afwijken (leeg = volgt de standaard)
-- ------------------------------------------------------------
alter table public.woningen add column if not exists fotolayout jsonb;
alter table public.woningen add column if not exists magazine jsonb;

alter table public.instellingen
  add column if not exists weergave jsonb
  default '{"verkocht":"rustig"}'::jsonb;
alter table public.instellingen
  add column if not exists logo jsonb
  default '{"bron":"standaard","url":"","vorm":"cirkel-feller","formaat":"normaal","naam":"naam-ondertitel","op_donker":"zoals-hij-is"}'::jsonb;


comment on column public.woningen.fotolayout is
  'Eigen opmaak van de galerij bij deze woning. Leeg = volgt de standaard uit instellingen.';

-- ------------------------------------------------------------
-- 3. De etalages opnieuw, nu mét fotolayout
--    (dezelfde kolommen als in veiligheid.sql — adres, notities,
--     contactpersoon en bezichtigingen blijven er bewust buiten)
-- ------------------------------------------------------------
drop view if exists public.woningen_publiek;
create view public.woningen_publiek as
select
  id, titel, slug, plaats, regio, status, prijs,
  slaapkamers, badkamers, woonoppervlak, perceel, bouwjaar,
  hero, video, omschrijving,
  kenmerken_binnen, kenmerken_buiten,
  galerij, afstanden, fotolayout, magazine,
  volgorde, uitgelicht,
  round(lat::numeric, 2)::float8 as lat,
  round(lon::numeric, 2)::float8 as lon
from public.woningen
where beschikbaar = true;

comment on view public.woningen_publiek is
  'Wat een bezoeker van een woning mag zien. Geen adres, geen exacte coordinaten, geen notities, contactpersoon, referentie, bezichtigingen of exclusiviteit.';

grant select on public.woningen_publiek to anon, authenticated;

drop view if exists public.instellingen_publiek;
create view public.instellingen_publiek as
select id, palet, lettertype, keuzes, secties, teksten, maps_sleutel, fotolayout, logo, weergave
from public.instellingen
where id = 'site';

comment on view public.instellingen_publiek is
  'Alleen de instellingen die de site nodig heeft om zichzelf te bouwen.';

grant select on public.instellingen_publiek to anon, authenticated;

-- ------------------------------------------------------------
-- 4. Controle
--    fotolayout_in_de_etalage hoort 2 te zijn (woningen + instellingen),
--    prive_kolommen_in_de_etalage hoort 0 te blijven.
-- ------------------------------------------------------------
select
  (select count(*) from information_schema.columns
     where table_name in ('woningen_publiek','instellingen_publiek')
       and column_name = 'fotolayout')                     as fotolayout_in_de_etalage,
  (select count(*) from information_schema.columns
     where table_name = 'woningen_publiek'
       and column_name in ('adres','notitie','contactpersoon','referentie','bezichtigingen','exclusief_tot'))
                                                            as prive_kolommen_in_de_etalage;
