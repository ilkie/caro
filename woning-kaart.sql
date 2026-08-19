-- ============================================================
--  Caro Leriche — locatie op de kaart
--
--  Caro typt het adres in het beheerscherm. Het adres en de exacte
--  coördinaten blijven privé: op de site komt alleen een kaartje van de
--  buurt (afgerond op ~1 km) plus de plaats en regio in tekst.
--
--  Gebruik: Supabase → SQL Editor → plakken → Run.
--  Veilig om opnieuw te draaien.
--
--  LET OP: dit is het SQL-bestand, geen code voor de site.
-- ============================================================

-- Adres en exacte plek — alleen zichtbaar in het dashboard
alter table public.woningen add column if not exists adres text;
alter table public.woningen add column if not exists lat   double precision;
alter table public.woningen add column if not exists lon   double precision;

comment on column public.woningen.adres is 'Volledig adres — privé, komt nooit op de site';
comment on column public.woningen.lat   is 'Exacte breedtegraad — de site toont een afgeronde versie (~1 km)';
comment on column public.woningen.lon   is 'Exacte lengtegraad — idem';

-- Google Maps-sleutel (één keer instellen, in het dashboard)
alter table public.instellingen add column if not exists maps_sleutel text;

comment on column public.instellingen.maps_sleutel is
  'Google Maps Embed API-sleutel, beperkt tot het eigen domein. Leeg = OpenStreetMap wordt gebruikt.';

-- Controle
select
  (select count(*) from information_schema.columns
     where table_name = 'woningen' and column_name in ('adres','lat','lon'))          as velden_woningen,
  (select count(*) from information_schema.columns
     where table_name = 'instellingen' and column_name = 'maps_sleutel')              as veld_instellingen;
