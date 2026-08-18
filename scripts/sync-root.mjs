#!/usr/bin/env node
/**
 * Schrijft het standaardpalet (huisstijl) als CSS-variabelen in global.css,
 * tussen de markers PALET-START en PALET-EINDE.
 *
 * Draaien met:  node scripts/sync-root.mjs
 * Dit hoeft alleen als paletten.json verandert. De site injecteert bij het
 * bouwen alsnog het gekozen palet; dit blok is de terugval (en zorgt dat het
 * dashboard en losse voorbeeldpagina's er ook zonder injectie goed uitzien).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { paletVariabelen, vindPalet, STANDAARD_PALET } from '../src/lib/palet.js';

const pad = new URL('../src/styles/global.css', import.meta.url);
const css = readFileSync(pad, 'utf8');

const start = '/* PALET-START';
const einde = 'PALET-EINDE */';
const i = css.indexOf(start);
const j = css.indexOf(einde);
if (i === -1 || j === -1) {
  console.error('Markers PALET-START / PALET-EINDE niet gevonden in global.css.');
  process.exit(1);
}

const palet = vindPalet(STANDAARD_PALET);
const regels = Object.entries(paletVariabelen(palet.kleuren))
  .map(([naam, waarde]) => `  ${naam}:${waarde};`)
  .join('\n');

const blok =
  `${start} — standaardpalet "${palet.naam}". Gegenereerd door scripts/sync-root.mjs;\n` +
  `   niet met de hand wijzigen. Het beheer-dashboard overschrijft dit per palet. */\n` +
  `${regels}\n` +
  `  /* ${einde}`;

const nieuw = css.slice(0, i) + blok + css.slice(j + einde.length);
writeFileSync(pad, nieuw);
console.log(`global.css bijgewerkt met palet "${palet.naam}" (${Object.keys(paletVariabelen(palet.kleuren)).length} variabelen).`);
