-- ============================================================
--  Caro Leriche — het magazine per woning aanpasbaar maken
--
--  Het magazine wordt automatisch samengesteld uit wat er over een woning
--  bekend is. Dit bestand maakt het mogelijk om daar per woning van af te
--  wijken: een andere voorfoto, een andere kop, een eigen verhaal, een foto
--  die je liever niet in het boekje hebt.
--
--  Net als bij de teksten van de site geldt: wat leeg blijft, volgt het
--  standaardmagazine. Alleen wat écht afwijkt wordt bewaard, en het
--  dashboard heeft één knop om alles terug te zetten.
--
--  Voegt toe:
--    1. woningen.magazine jsonb  (null = volledig het standaardmagazine)
--    2. die kolom in de etalage-view woningen_publiek
--
--  Gebruik: Supabase → SQL Editor → plakken → Run.
--  Veilig om opnieuw te draaien; bestaande gegevens blijven staan.
--
--  LET OP: dit is het SQL-bestand, geen code voor de site.
-- ============================================================

alter table public.woningen
  add column if not exists magazine jsonb;

comment on column public.woningen.magazine is
  'Eigen invulling van het magazine van deze woning. null of {} = het standaardmagazine. '
  'Vorm: {"cover_foto":"","cover_titel":"","cover_regel":"","toon_prijs":true,'
  '"verhaal_kop":"","verhaal_titel":"","verhaal_tekst":"","zijfoto":"",'
  '"slotfoto":"","slot_zin":"","toon_kenmerken":true,"overslaan":[]}. '
  'Een lege tekst betekent: volg de standaard.';

-- Zodat dit bestand ook los van de andere bestanden werkt.
alter table public.woningen add column if not exists fotolayout jsonb;

-- ------------------------------------------------------------
--  De etalage opnieuw, nu mét magazine. Dezelfde kolommen als in
--  veiligheid.sql — nog steeds geen adres, geen exacte coordinaten,
--  geen notities of bezichtigingen.
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
  -- afgerond op ~1 km; het exacte adrespunt blijft in de tabel
  round(lat::numeric, 2)::float8 as lat,
  round(lon::numeric, 2)::float8 as lon
from public.woningen
where beschikbaar = true;

comment on view public.woningen_publiek is
  'Wat een bezoeker van een woning mag zien. Geen adres, geen exacte coordinaten, geen notities, contactpersoon, referentie, bezichtigingen of exclusiviteit.';

grant select on public.woningen_publiek to anon, authenticated;

-- ------------------------------------------------------------
--  Controle: allebei hoort 1 te zijn, en het derde getal 0.
-- ------------------------------------------------------------
select
  (select count(*) from information_schema.columns
     where table_name = 'woningen' and column_name = 'magazine')            as kolom_bestaat,
  (select count(*) from information_schema.columns
     where table_name = 'woningen_publiek' and column_name = 'magazine')    as magazine_in_de_etalage,
  (select count(*) from information_schema.columns
     where table_name = 'woningen_publiek'
       and column_name in ('adres','notitie','contactpersoon','referentie','bezichtigingen','exclusief_tot'))
                                                                            as prive_kolommen_in_de_etalage;
