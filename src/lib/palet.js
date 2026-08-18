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

export const PALETTEN = paletten.paletten;
export const STANDAARD_PALET = 'huisstijl';

/** Zoekt een palet op id; valt terug op de huisstijl. */
export function vindPalet(id) {
  return PALETTEN.find((p) => p.id === id) || PALETTEN.find((p) => p.id === STANDAARD_PALET) || PALETTEN[0];
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
export function paletCss(id, selector = ':root:root') {
  const p = vindPalet(id);
  const regels = Object.entries(paletVariabelen(p.kleuren))
    .map(([naam, waarde]) => `  ${naam}:${waarde};`)
    .join('\n');
  return `${selector}{\n${regels}\n}`;
}
