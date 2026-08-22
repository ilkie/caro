-- ============================================================
--  Caro Leriche — dichtzetten wat bezoekers mogen zien
--
--  WAAROM DIT NODIG IS
--  De site leest de database met de publieke sleutel; die sleutel staat
--  (noodzakelijk) in de JavaScript van de site en is dus voor iedereen te
--  zien. Tot nu toe mocht die sleutel álle kolommen van een zichtbare woning
--  lezen. Sinds we adres, coördinaten, notities, contactpersoon en
--  bezichtigingen zijn gaan opslaan, betekende dat: wie de sleutel pakt en
--  zelf een verzoek stuurt, kan die gegevens ophalen — ook al staan ze
--  nergens op de site.
--
--  WAT DIT BESTAND DOET
--  1. maakt twee "etalage"-views met alléén wat publiek mag zijn
--  2. laat de site die views lezen in plaats van de tabellen
--  3. haalt het leesrecht van bezoekers op de tabellen zelf weg
--
--  Coördinaten worden in de view al afgerond op ~1 km, zodat het exacte punt
--  de database niet meer verlaat.
--
--  Gebruik: Supabase → SQL Editor → plakken → Run. Draai dit ná de andere
--  SQL-bestanden. Veilig om opnieuw te draaien.
--
--  LET OP: dit is het SQL-bestand, geen code voor de site.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Etalage: woningen
--    Bewust géén security_invoker: de view mag de tabel lezen, de bezoeker
--    niet. Alleen zichtbare woningen, alleen publieke kolommen.
-- ------------------------------------------------------------
-- Zodat dit bestand ook werkt als fotolayout.sql nog niet gedraaid heeft
-- (en andersom): de kolommen die de etalage nodig heeft, bestaan hoe dan ook.
alter table public.instellingen
  add column if not exists fotolayout jsonb
  default '{"stijl":"kolommen","kolommen":3,"marge":"normaal"}'::jsonb;
alter table public.woningen add column if not exists fotolayout jsonb;
alter table public.woningen add column if not exists magazine jsonb;
alter table public.instellingen
  add column if not exists logo jsonb
  default '{"bron":"standaard","url":"","vorm":"cirkel-feller","formaat":"normaal","naam":"naam-ondertitel","op_donker":"zoals-hij-is"}'::jsonb;


drop view if exists public.woningen_publiek;
create view public.woningen_publiek as
select
  id, titel, slug, plaats, regio, status, prijs,
  slaapkamers, badkamers, woonoppervlak, perceel, bouwjaar,
  hero, video, omschrijving,
  kenmerken_binnen, kenmerken_buiten,
  galerij, afstanden, fotolayout, magazine,
  volgorde, uitgelicht,
  -- afgerond op ~1 km; het exacte adrespunt blijft in de tabel
  round(lat::numeric, 2)::float8 as lat,
  round(lon::numeric, 2)::float8 as lon
from public.woningen
where beschikbaar = true;

comment on view public.woningen_publiek is
  'Wat een bezoeker van een woning mag zien. Geen adres, geen exacte coordinaten, geen notities, contactpersoon, referentie, bezichtigingen of exclusiviteit.';

grant select on public.woningen_publiek to anon, authenticated;


-- ------------------------------------------------------------
-- 2. Etalage: instellingen (vormgeving en teksten)
-- ------------------------------------------------------------
drop view if exists public.instellingen_publiek;
create view public.instellingen_publiek as
select id, palet, lettertype, keuzes, secties, teksten, maps_sleutel, fotolayout, logo
from public.instellingen
where id = 'site';

comment on view public.instellingen_publiek is
  'Alleen de instellingen die de site nodig heeft om zichzelf te bouwen.';

grant select on public.instellingen_publiek to anon, authenticated;


-- ------------------------------------------------------------
-- 3. Bezoekers mogen de tabellen zelf niet meer lezen
--    Ingelogde beheerders (het dashboard) houden hun rechten.
-- ------------------------------------------------------------
drop policy if exists "publiek leest beschikbare woningen" on public.woningen;
drop policy if exists "publiek leest instellingen"        on public.instellingen;

revoke select on public.woningen     from anon;
revoke select on public.instellingen from anon;

-- Tellen blijft wél mogen (dat is het enige dat een bezoeker mag schrijven),
-- en teruglezen blijft verboden — zie woning-inzicht.sql.


-- ------------------------------------------------------------
-- 4. Controle: wat kan een bezoeker nu écht?
--    De uitkomst hoort te zijn: 0 rijen uit de tabellen, wél rijen uit de
--    views, en geen kolom 'adres' of 'notitie' in de etalage.
-- ------------------------------------------------------------
select
  (select count(*) from information_schema.columns
     where table_name = 'woningen_publiek'
       and column_name in ('adres','notitie','contactpersoon','referentie','bezichtigingen','exclusief_tot'))
      as prive_kolommen_in_de_etalage,   -- hoort 0 te zijn
  (select count(*) from information_schema.role_table_grants
     where grantee = 'anon' and table_name in ('woningen','instellingen') and privilege_type = 'select')
      as leesrechten_bezoeker_op_tabellen; -- hoort 0 te zijn
