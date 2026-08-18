#!/usr/bin/env node
/**
 * Leesbaarheidscontrole voor de kleurpaletten (WCAG-contrast).
 * Draaien met:  node scripts/check-paletten.mjs
 * Faalt (exit 1) zodra een palet onder de norm zakt, zodat een nieuw palet
 * nooit ongemerkt onleesbaar de site op gaat.
 */
import { readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../public/paletten.json', import.meta.url)));

const lum = (hex) => {
  const h = hex.replace('#', '');
  const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

// [omschrijving, voorgrond, achtergrond, minimum]
const eisen = (k) => [
  ['bodytekst op crème',        k.ink,     k.cream,   7],
  ['bodytekst op zand',         k.ink,     k.sand,    7],
  ['grijze tekst op crème',     k.muted,   k.cream,   4.5],
  ['grijze tekst op zand',      k.muted,   k.sand,    4.5],
  ['witte knoptekst op accent', '#FFFFFF', k.accent,  4.5],
  ['accent als link op crème',  k.accent,  k.cream,   4.5],
  ['tweede accent op crème',    k.accent2, k.cream,   4.5],
  ['tweede accent op zand',     k.accent2, k.sand,    4.5],
  ['witte tekst op contactvlak', '#FFFFFF', k.accent, 4.5],
  ['crème tekst op donkere pagina', k.cream, k['wp-bg'], 7],
  ['tweede accent op donkere pagina', k['accent2-soft'], k['wp-bg'], 4.5],
  ['witte tekst op voettekst',  '#FFFFFF', k['accent-ink'], 7],
  ['knop zichtbaar op donkere pagina', k['accent-op-donker'] || k.accent, k['wp-bg'], 2.4],
  ['witte tekst op die knop',          '#FFFFFF', k['accent-op-donker'] || k.accent, 4.4],
  ['paneel zichtbaar op donkere pagina', k['wp-panel'], k['wp-bg'], 1.05],
];

let fouten = 0;
let waarschuwingen = 0;

for (const p of data.paletten) {
  console.log(`\n${p.naam}  (${p.id})`);
  const toegestaan = p.afwijkingen || {};
  for (const [naam, vg, ag, min] of eisen(p.kleuren)) {
    const r = ratio(vg, ag);
    const ok = r >= min;
    const uitzondering = !ok && naam in toegestaan;
    const krap = ok && r < min * 1.05;
    if (!ok && !uitzondering) fouten++;
    if (krap || uitzondering) waarschuwingen++;
    const teken = ok ? (krap ? '~' : '✓') : uitzondering ? '≈' : '✗';
    console.log(
      `  ${teken} ${naam.padEnd(34)} ${r.toFixed(2).padStart(6)}  (min ${min})` +
        (uitzondering ? `  ← bewust: ${toegestaan[naam]}` : '')
    );
  }
}

console.log(`\n${fouten} onder de norm, ${waarschuwingen} krap of bewust toegestaan (≈).`);
process.exit(fouten ? 1 : 0);
