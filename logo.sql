-- ============================================================
--  Caro Leriche — het logo instelbaar maken
--
--  Voegt toe:
--    1. instellingen.logo — welk beeld, welke vorm, hoe groot, wat ernaast staat
--    2. de etalage-view weet ervan
--
--  Een eigen logo wordt (net als de foto's) in de bucket `media` gezet, in de
--  map `merk/`. In de database staat alleen de openbare URL.
--
--  Gebruik: Supabase → SQL Editor → plakken → Run.
--  Veilig om opnieuw te draaien; bestaande gegevens blijven staan.
--
--  LET OP: dit is het SQL-bestand, geen code voor de site.
-- ============================================================

alter table public.instellingen
  add column if not exists weergave jsonb
  default '{"verkocht":"rustig"}'::jsonb;
alter table public.instellingen
  add column if not exists logo jsonb
  default '{"bron":"standaard","url":"","vorm":"cirkel-feller","formaat":"normaal","naam":"naam-ondertitel","op_donker":"zoals-hij-is"}'::jsonb;

update public.instellingen
   set logo = '{"bron":"standaard","url":"","vorm":"cirkel-feller","formaat":"normaal","naam":"naam-ondertitel","op_donker":"zoals-hij-is"}'::jsonb
 where logo is null;

comment on column public.instellingen.logo is
  'Het logo in het menu: {"bron":"standaard|eigen","url":"","vorm":"geen|cirkel|cirkel-feller|cirkel-fel|vierkant","formaat":"compact|normaal|groot","naam":"naam-ondertitel|alleen-naam|alleen-logo","op_donker":"zoals-hij-is|wit"}';

-- Zodat dit bestand ook werkt als fotolayout.sql nog niet gedraaid heeft:
alter table public.instellingen
  add column if not exists fotolayout jsonb
  default '{"stijl":"kolommen","kolommen":3,"marge":"normaal"}'::jsonb;

-- De etalage opnieuw, nu mét logo. Dezelfde kolommen als in veiligheid.sql.
drop view if exists public.instellingen_publiek;
create view public.instellingen_publiek as
select id, palet, lettertype, keuzes, secties, teksten, maps_sleutel, fotolayout, logo, weergave
from public.instellingen
where id = 'site';

comment on view public.instellingen_publiek is
  'Alleen de instellingen die de site nodig heeft om zichzelf te bouwen.';

grant select on public.instellingen_publiek to anon, authenticated;

-- ------------------------------------------------------------
-- Controle: hoort 1 te zijn.
-- ------------------------------------------------------------
select count(*) as logo_in_de_etalage
from information_schema.columns
where table_name = 'instellingen_publiek' and column_name = 'logo';
