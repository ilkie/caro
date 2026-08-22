-- ============================================================
--  Caro Leriche — kleine weergavekeuzes
--
--  Voegt toe: instellingen.weergave — een klein hoekje voor keuzes die niet
--  bij het palet of bij de teksten horen. Nu zit er één ding in: of een
--  verkochte woning rustiger getoond wordt (grijzere foto, prijs doorgestreept).
--
--  Gebruik: Supabase → SQL Editor → plakken → Run.
--  Veilig om opnieuw te draaien; bestaande gegevens blijven staan.
--
--  LET OP: dit is het SQL-bestand, geen code voor de site.
-- ============================================================

alter table public.instellingen
  add column if not exists weergave jsonb
  default '{"verkocht":"rustig"}'::jsonb;

update public.instellingen
   set weergave = '{"verkocht":"rustig"}'::jsonb
 where weergave is null;

comment on column public.instellingen.weergave is
  'Kleine weergavekeuzes: {"verkocht":"rustig|gewoon"} — rustig = verkochte en '
  'onder voorbehoud verkochte woningen krijgen een grijzere foto en een '
  'doorgestreepte prijs.';

-- Zodat dit bestand ook los van de andere werkt.
alter table public.instellingen
  add column if not exists fotolayout jsonb
  default '{"stijl":"kolommen","kolommen":3,"marge":"normaal"}'::jsonb;
alter table public.instellingen
  add column if not exists logo jsonb
  default '{"bron":"standaard","url":"","vorm":"cirkel-feller","formaat":"normaal","naam":"naam-ondertitel","op_donker":"zoals-hij-is"}'::jsonb;

-- ------------------------------------------------------------
--  De etalage opnieuw, nu mét weergave. Dezelfde kolommen als in
--  veiligheid.sql / fotolayout.sql / logo.sql.
-- ------------------------------------------------------------
drop view if exists public.instellingen_publiek;
create view public.instellingen_publiek as
select id, palet, lettertype, keuzes, secties, teksten, maps_sleutel, fotolayout, logo, weergave
from public.instellingen
where id = 'site';

comment on view public.instellingen_publiek is
  'Alleen de instellingen die de site nodig heeft om zichzelf te bouwen.';

grant select on public.instellingen_publiek to anon, authenticated;

-- ------------------------------------------------------------
--  Controle: allebei hoort 1 te zijn.
-- ------------------------------------------------------------
select
  (select count(*) from information_schema.columns
     where table_name = 'instellingen' and column_name = 'weergave')          as kolom_bestaat,
  (select count(*) from information_schema.columns
     where table_name = 'instellingen_publiek' and column_name = 'weergave')  as in_de_etalage;
