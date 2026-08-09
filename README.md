# Caro Leriche — Real Estate Spain

De echte, uitbreidbare basis voor Caro's website. Gebouwd met [Astro](https://astro.build) (snel, schone code, top voor Google) in de **mix-stijl**: strakke basis met zachte accenten. Huiskleur teal, accent terracotta.

## Wat zit erin

- **Homepage** (`/`) — merk-hero, overzicht van woningen, "over Caro", contact.
- **Woningpagina's** (`/woning/<naam>`) — automatisch gegenereerd per woning, met video-hero (logo + ingetypte naam + geluid-knop), kenmerken, galerij, locatie en contact.
- **404-pagina** — nette, gebrande foutpagina.
- **Beheer / login** (`/admin`) — Decap CMS: hier logt Caro in en voegt ze woningen toe via een formulier. De vormgeving blijft altijd hetzelfde; alleen de inhoud wisselt.

Eén woning = één bestand in `src/content/woningen/`. Voeg je er via `/admin` een toe, dan verschijnt automatisch een nieuwe pagina én een kaartje op de homepage.

## Lokaal draaien

```bash
npm install
npm run dev
```

Open http://localhost:4321 (site) en http://localhost:4321/admin (beheer).

Om het beheer lokaal te testen zonder inloggen, draai er in een tweede terminal een lokale CMS-server naast:

```bash
npx decap-server
```

(`local_backend: true` staat al aan in `public/admin/config.yml`.)

## Online zetten (Netlify) + login voor Caro

1. Zet deze map in een Git-repository (GitHub/GitLab).
2. Maak op [Netlify](https://netlify.com) een nieuwe site vanaf die repo. Build-instellingen staan al in `netlify.toml` (`npm run build`, publicatiemap `dist`).
3. In de Netlify-UI:
   - **Identity → Enable Identity**
   - **Identity → Services → Git Gateway → Enable**
   - **Identity → Registration → Invite only**
   - **Identity → Invite users** → nodig Caro's e-mail uit.
4. Caro krijgt een mail, kiest een wachtwoord en logt daarna in op `https://<site>/admin`.

Vanaf dan voegt Caro zelf woningen toe; elke wijziging verschijnt automatisch op de live site.

## Nog in te vullen / volgende stappen

- Caro's **echte logo** i.p.v. de "CL"-stand-in (in `src/layouts/Base.astro` en de hero van `src/pages/woning/[slug].astro`).
- **Echte contactgegevens** (WhatsApp/e-mail/telefoon) — nu placeholders in de pagina's.
- **Foto van Caro** in "over" en contact.
- **Google Maps-embed** op de woningpagina (nu een placeholder).
- **Video** per woning: vul het veld `video` met een mp4-link; dan speelt die gedempt af in de hero (geluid via de knop).
- Later: meertaligheid (NL/EN/ES), nieuwsbrief/"wat zoek je?"-formulier voor kopers.

## Structuur

```
src/
  content/woningen/     ← de woningen (per stuk één bestand)
  layouts/Base.astro    ← nav, footer, <head>, scripts
  pages/index.astro     ← homepage
  pages/woning/[slug].astro  ← woning-template (vaste vormgeving)
  pages/404.astro
  styles/global.css     ← de hele huisstijl
public/admin/           ← Decap CMS (login + upload)
```
