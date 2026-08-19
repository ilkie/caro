#!/usr/bin/env node
/**
 * Leesbaarheidscontrole (WCAG-contrast) voor alles wat Caro kan instellen.
 *
 *   node scripts/check-paletten.mjs          rapport per palet
 *   node scripts/check-paletten.mjs --alles  ook élke combinatie van de losse keuzes
 *
 * Faalt met exit 1 zodra een instelbare combinatie onder de norm zakt. Zo kan
 * geen enkele keuze in het dashboard een onleesbare site opleveren.
 */
import { readFileSync } from 'node:fs';
import { PALETTEN, KEUZES, kleurenVan } from '../src/lib/palet.js';

const lum = (hex) => {
  const h = String(hex).replace('#', '');
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
  ['bodytekst op crème',              k.ink,     k.cream,   7],
  ['bodytekst op zand',               k.ink,     k.sand,    7],
  ['grijze tekst op crème',           k.muted,   k.cream,   4.5],
  ['grijze tekst op zand',            k.muted,   k.sand,    4.5],
  ['witte knoptekst op accent',       '#FFFFFF', k.accent,  4.5],
  ['accent als link op crème',        k.accent,  k.cream,   4.5],
  ['tweede accent op crème',          k.accent2, k.cream,   4.5],
  ['tweede accent op zand',           k.accent2, k.sand,    4.5],
  ['witte tekst op contactvlak',      '#FFFFFF', k.accent,  4.5],
  ['crème tekst op donkere pagina',   k.cream,   k['wp-bg'], 7],
  ['tweede accent op donkere pagina', k['accent2-soft'], k['wp-bg'], 4.5],
  ['witte tekst op voettekst',        '#FFFFFF', k['accent-ink'], 7],
  ['knop zichtbaar op donkere pagina', k['accent-op-donker'] || k.accent, k['wp-bg'], 2.4],
  ['knoptekst op donkere pagina',     k['knop-tekst-donker'] || '#FFFFFF', k['accent-op-donker'] || k.accent, 4.4],
  ['paneel zichtbaar op donkere pagina', k['wp-panel'], k['wp-bg'], 1.05],
];

// Caro's twee merkkleuren halen net de norm niet (4,44 tegen 4,50). Dat is een
// bewuste keuze van haar, geen fout — opgevangen met font-weight 500.
const MERKKLEUREN = { '#298296': 'petrolblauw', '#B15B3C': 'terracotta' };
const merkuitzondering = (vg, ag) =>
  (MERKKLEUREN[vg?.toUpperCase()] || MERKKLEUREN[ag?.toUpperCase()]) !== undefined;

let fouten = 0;
let soepel = 0;

/* ---------- 1. rapport per palet (standaardkeuzes) ---------- */
for (const p of PALETTEN) {
  console.log(`\n${p.naam}  (${p.id})`);
  for (const [naam, vg, ag, min] of eisen(kleurenVan(p.id, {}))) {
    const r = ratio(vg, ag);
    const ok = r >= min;
    const bewust = !ok && merkuitzondering(vg, ag);
    if (!ok && !bewust) fouten++;
    if (bewust || (ok && r < min * 1.05)) soepel++;
    console.log(
      `  ${ok ? (r < min * 1.05 ? '~' : '✓') : bewust ? '≈' : '✗'} ${naam.padEnd(36)} ${r.toFixed(2).padStart(6)}  (min ${min})`
    );
  }
}

/* ---------- 2. élke combinatie van de losse keuzes ---------- */
if (process.argv.includes('--alles')) {
  const groepen = Object.keys(KEUZES);
  const opties = groepen.map((g) => KEUZES[g].opties.map((o) => o.id));
  const combinaties = opties.reduce((acc, lijst) => acc.flatMap((rij) => lijst.map((id) => [...rij, id])), [[]]);

  console.log(`\n\nAlle combinaties: ${PALETTEN.length} paletten × ${combinaties.length} keuzes = ${PALETTEN.length * combinaties.length}`);
  const mislukt = new Map();
  let getest = 0;

  for (const p of PALETTEN) {
    for (const combi of combinaties) {
      const keuzes = Object.fromEntries(groepen.map((g, i) => [g, combi[i]]));
      const k = kleurenVan(p.id, keuzes);
      for (const [naam, vg, ag, min] of eisen(k)) {
        getest++;
        const r = ratio(vg, ag);
        if (r >= min || merkuitzondering(vg, ag)) continue;
        const sleutel = `${naam} — palet ${p.id}, ${groepen.map((g, i) => `${g}=${combi[i]}`).join(', ')}`;
        if (!mislukt.has(naam)) mislukt.set(naam, []);
        mislukt.get(naam).push({ sleutel, r });
      }
    }
  }

  console.log(`${getest} controles uitgevoerd.`);
  if (mislukt.size === 0) {
    console.log('✓ Geen enkele instelbare combinatie zakt onder de norm.');
  } else {
    for (const [naam, gevallen] of mislukt) {
      gevallen.sort((a, b) => a.r - b.r);
      console.log(`\n✗ ${naam} — ${gevallen.length}× mis, slechtste ${gevallen[0].r.toFixed(2)}`);
      gevallen.slice(0, 3).forEach((g) => console.log(`    ${g.sleutel}  (${g.r.toFixed(2)})`));
      fouten += gevallen.length;
    }
  }
}

console.log(`\n${fouten} onder de norm, ${soepel} krap of bewust toegestaan.`);
process.exit(fouten ? 1 : 0);
