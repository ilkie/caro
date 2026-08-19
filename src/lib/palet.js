/**
 * Kleurpaletten → CSS-variabelen.
 *
 * Eén bron voor drie plekken:
 *   • de site (Base.astro injecteert het gekozen palet)
 *   • het beheer-dashboard (live voorbeeld)
 *   • scripts/sync-root.mjs (schrijft het standaardpalet in global.css)
 *
 * Doorzichtige tinten worden hier uitgerekend in plaats van met color-mix(),
 * zodat ook oudere telefoons precies hetzelfde zien.
 */
import paletten from '../../public/paletten.json' with { type: 'json' };
import lettertypeData from '../../public/lettertypes.json' with { type: 'json' };
import hoofddesign from '../../public/hoofddesign.json' with { type: 'json' };

export const PALETTEN = paletten.paletten;
export const KEUZES = paletten.keuzes || {};
export const LETTERTYPES = lettertypeData.lettertypes;
export const HOOFDDESIGN = hoofddesign;
export const STANDAARD_PALET = hoofddesign.palet;
export const STANDAARD_KEUZES = { ...hoofddesign.keuzes };
export const STANDAARD_LETTERTYPE = hoofddesign.lettertype;

/** Zoekt een lettertype op id; valt terug op dat van het hoofddesign. */
export function vindLettertype(id) {
  return (
    LETTERTYPES.find((l) => l.id === id) ||
    LETTERTYPES.find((l) => l.id === STANDAARD_LETTERTYPE) ||
    LETTERTYPES[0]
  );
}

/** De Google Fonts-link die bij een lettertype hoort. */
export function lettertypeUrl(id) {
  return 'https://fonts.googleapis.com/css2?' + vindLettertype(id).google + '&display=swap';
}

/** Zoekt een palet op id; valt terug op de huisstijl. */
export function vindPalet(id) {
  return PALETTEN.find((p) => p.id === id) || PALETTEN.find((p) => p.id === STANDAARD_PALET) || PALETTEN[0];
}


/* ---------- automatisch bijstellen ----------
   Caro kan achtergrond, accent en de donkere pagina los van elkaar kiezen.
   Sommige combinaties zouden te weinig contrast geven (lichtgrijze knop op
   een petrolblauwe pagina, bijvoorbeeld). In plaats van die combinaties te
   verbieden, schuiven we de kleur net zo ver op tot het wél leesbaar is.
   Kleuren die al goed staan blijven exact zoals ze zijn — de huisstijl
   verandert dus niet. */

function ontleed(hex) {
  const h = String(hex).replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function naarHex([r, g, b]) {
  return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
}
function helderheid(hex) {
  const c = ontleed(hex).map((v) => v / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function verhouding(a, b) {
  const [x, y] = [helderheid(a), helderheid(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
/** Schuift `kleur` richting wit (of zwart) tot alle achtergronden genoeg contrast geven. */
function schuif(kleur, achtergronden, minimum, naarWit) {
  const doel = naarWit ? [255, 255, 255] : [0, 0, 0];
  let huidig = kleur;
  for (let stap = 0; stap <= 25; stap++) {
    if (achtergronden.every((ag) => verhouding(huidig, ag) >= minimum)) return huidig;
    const t = (stap + 1) * 0.04;
    huidig = naarHex(ontleed(kleur).map((v, i) => v + (doel[i] - v) * t));
  }
  return huidig;
}
/* Caro's merkkleuren blijven exact zoals ze zijn, ook als ze net onder de
   contrastnorm liggen. Dat is haar keuze, geen fout die wij mogen 'verbeteren'. */
const MERKKLEUREN = new Set(['#298296', '#B15B3C']);
const isMerkkleur = (hex) => MERKKLEUREN.has(String(hex).toUpperCase());

/** Wit of bijna-zwart: wat het beste leest op deze knop. */
function knoptekst(achtergrond) {
  return verhouding('#FFFFFF', achtergrond) >= verhouding('#111111', achtergrond) ? '#FFFFFF' : '#111111';
}

/**
 * Palet + losse keuzes → één set kleuren.
 * Elke keuze overschrijft alleen zijn eigen variabelen; 'stijl' (of een
 * onbekende waarde) laat het palet beslissen. Zo kan een oude of kapotte
 * instelling nooit meer dan een deel van de kleuren raken.
 */
export function kleurenVan(paletId, keuzes = {}) {
  const kleuren = { ...vindPalet(paletId).kleuren };
  for (const groep of Object.keys(KEUZES)) {
    const gekozen = keuzes[groep];
    if (!gekozen || gekozen === 'stijl') continue;
    const optie = (KEUZES[groep].opties || []).find((o) => o.id === gekozen);
    if (optie && optie.kleuren) Object.assign(kleuren, optie.kleuren);
  }

  // bijstellen waar de combinatie anders onleesbaar wordt
  kleuren.muted = schuif(kleuren.muted, [kleuren.cream, kleuren.sand], 4.5, false);
  if (!isMerkkleur(kleuren.accent2))
    kleuren.accent2 = schuif(kleuren.accent2, [kleuren.cream, kleuren.sand], 4.5, false);
  kleuren['accent2-soft'] = schuif(kleuren['accent2-soft'], [kleuren['wp-bg']], 4.5, true);
  kleuren['accent-op-donker'] = schuif(kleuren['accent-op-donker'] || kleuren.accent, [kleuren['wp-bg']], 2.6, true);
  kleuren['knop-tekst-donker'] = knoptekst(kleuren['accent-op-donker']);
  return kleuren;
}

/** '#RRGGBB' + alpha → 'rgba(r,g,b,a)' */
export function tint(hex, alpha) {
  const h = String(hex).replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Alle variabelen van een palet, als { '--naam': 'waarde' }. */
export function paletVariabelen(kleuren) {
  const k = kleuren;
  return {
    '--accent': k.accent,
    '--accent-deep': k['accent-deep'],
    '--accent-ink': k['accent-ink'],
    '--accent-soft': k['accent-soft'],
    '--accent-op-donker': k['accent-op-donker'] || k.accent,
    '--knop-tekst-donker': k['knop-tekst-donker'] || '#FFFFFF',
    '--accent2': k.accent2,
    '--accent2-soft': k['accent2-soft'],
    '--cream': k.cream,
    '--sand': k.sand,
    '--sand-deep': k['sand-deep'],
    '--sand-deeper': k['sand-deeper'],
    '--line': k.line,
    '--ink': k.ink,
    '--muted': k.muted,
    '--wp-bg': k['wp-bg'],
    '--wp-panel': k['wp-panel'],
    '--wp-glow': k['wp-glow'],
    // doorzichtige tinten
    '--cream-15': tint(k.cream, 0.15),
    '--cream-30': tint(k.cream, 0.3),
    '--cream-50': tint(k.cream, 0.5),
    '--cream-70': tint(k.cream, 0.7),
    '--cream-85': tint(k.cream, 0.85),
    '--cream-90': tint(k.cream, 0.9),
    '--wp-bg-88': tint(k['wp-bg'], 0.88),
    '--wp-panel-96': tint(k['wp-panel'], 0.96),
    '--accent-35': tint(k.accent, 0.35),
    '--accent-60': tint(k.accent, 0.6),
    '--accent-soft-30': tint(k['accent-soft'], 0.3),
    '--ink-a55': tint(k['accent-ink'], 0.55),
  };
}

/**
 * Het palet als CSS-tekst, klaar om in een <style> te zetten.
 * Let op de selector `:root:root`: Astro zet zijn eigen stylesheet ná deze
 * <style> in de <head>, en met een gewone `:root` zouden de standaardkleuren
 * uit global.css dus winnen. Twee keer `:root` weegt zwaarder en wint altijd.
 */
export function paletCss(id, keuzes = {}, lettertypeId = STANDAARD_LETTERTYPE, selector = ':root:root') {
  const l = vindLettertype(lettertypeId);
  const alles = {
    ...paletVariabelen(kleurenVan(id, keuzes)),
    '--serif': l.koppen,
    '--sans': l.body,
    '--kop-stretch': l.stretch,
  };
  const regels = Object.entries(alles)
    .map(([naam, waarde]) => `  ${naam}:${waarde};`)
    .join('\n');
  return `${selector}{\n${regels}\n}`;
}
