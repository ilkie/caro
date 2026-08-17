-- ============================================================
--  Caro Leriche — testfoto's villa "Casa Paz" koppelen
--
--  Zet de hero + de 23 galerij-foto's uit de repo (public/media/paz/)
--  op de testwoning met slug `test-ilka`, zodat de donkere onepager
--  met echte foto's te bekijken is: cre01.netlify.app/woning/test-ilka
--
--  Gebruik: Supabase → SQL Editor → dit bestand plakken → Run.
--  Daarna de site laten herbouwen (dashboard "Woning opslaan" of
--  Netlify → Trigger deploy), want de site leest bij het bouwen uit Supabase.
--
--  Bestaat `test-ilka` nog niet? Dan wordt hij aangemaakt.
--  Bestaat hij al? Dan worden ALLEEN hero + galerij bijgewerkt —
--  je eigen titel, prijs en teksten blijven staan.
--
--  Let op: dit zijn repo-paden (/media/...), geen Storage-URL's.
--  Ze werken zolang public/media/paz/ in de repo staat. Zodra Caro
--  echte foto's via het dashboard uploadt, mag die map weg.
-- ============================================================

insert into public.woningen (
  titel, slug, plaats, regio, status, prijs,
  slaapkamers, badkamers, woonoppervlak, perceel, bouwjaar,
  hero, galerij, volgorde, beschikbaar, uitgelicht
) values (
  'Casa Paz, Elche - Valverde',
  'test-ilka',
  'Valverde, Elche',
  'Costa Blanca',
  'Te koop',
  828000,
  null, null, null, null, null,
  '/media/paz/hero.jpg',
  '[
    { "src": "/media/paz/galerij/01.jpg", "label": "" },
    { "src": "/media/paz/galerij/02.jpg", "label": "" },
    { "src": "/media/paz/galerij/03.jpg", "label": "" },
    { "src": "/media/paz/galerij/04.jpg", "label": "" },
    { "src": "/media/paz/galerij/05.jpg", "label": "" },
    { "src": "/media/paz/galerij/06.jpg", "label": "" },
    { "src": "/media/paz/galerij/07.jpg", "label": "" },
    { "src": "/media/paz/galerij/08.jpg", "label": "" },
    { "src": "/media/paz/galerij/09.jpg", "label": "" },
    { "src": "/media/paz/galerij/10.jpg", "label": "" },
    { "src": "/media/paz/galerij/11.jpg", "label": "" },
    { "src": "/media/paz/galerij/12.jpg", "label": "" },
    { "src": "/media/paz/galerij/13.jpg", "label": "" },
    { "src": "/media/paz/galerij/14.jpg", "label": "" },
    { "src": "/media/paz/galerij/15.jpg", "label": "" },
    { "src": "/media/paz/galerij/16.jpg", "label": "" },
    { "src": "/media/paz/galerij/17.jpg", "label": "" },
    { "src": "/media/paz/galerij/18.jpg", "label": "" },
    { "src": "/media/paz/galerij/19.jpg", "label": "" },
    { "src": "/media/paz/galerij/20.jpg", "label": "" },
    { "src": "/media/paz/galerij/21.jpg", "label": "" },
    { "src": "/media/paz/galerij/22.jpg", "label": "" },
    { "src": "/media/paz/galerij/23.jpg", "label": "" }
  ]'::jsonb,
  10,
  true,
  false
)
on conflict (slug) do update set
  hero    = excluded.hero,
  galerij = excluded.galerij;


-- ------------------------------------------------------------
--  Controle: 1 rij, hero gevuld, 23 foto's in de galerij
-- ------------------------------------------------------------
select
  slug,
  titel,
  hero,
  jsonb_array_length(galerij) as aantal_fotos,
  beschikbaar
from public.woningen
where slug = 'test-ilka';
