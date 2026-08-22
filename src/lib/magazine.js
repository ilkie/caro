/**
 * Het magazine: hoe de foto's van een woning over de pagina's verdeeld worden.
 *
 * De voorkant, de foto naast het verhaal en de achterkant krijgen elk hun eigen
 * beeld; wat overblijft wordt in blokken van drie (of twee/vier) over de
 * fotopagina's verdeeld. Een foto die Caro als "groot" heeft gemarkeerd krijgt
 * een hele pagina voor zichzelf.
 *
 * Er is bewust een bovengrens: een woning met tachtig foto's levert anders een
 * boekwerk op dat niemand downloadt.
 */

export const MAX_FOTOS = 26;

/** Verdeelt n foto's in blokken van hooguit vier, met drie als ritme. */
export function verdeel(n) {
  if (n <= 0) return [];
  if (n <= 4) return [n];
  return [3, ...verdeel(n - 3)];
}

const VORM = { 1: 'een', 2: 'twee', 3: 'drie', 4: 'vier' };

/** Alle beelden van een woning, in de volgorde die Caro koos. */
function schoneFotos(woning) {
  const uit = [];
  for (const g of (woning && woning.galerij) || []) {
    if (!g || typeof g.src !== 'string' || !g.src.trim()) continue;
    uit.push({ src: g.src, label: typeof g.label === 'string' ? g.label : '', groot: !!g.groot });
  }
  return uit.slice(0, MAX_FOTOS);
}

/**
 * De hele indeling van het magazine.
 * Werkt ook bij nul foto's: dan blijven de fotopagina's simpelweg leeg.
 */
export function magazineIndeling(woning) {
  const fotos = schoneFotos(woning);
  const hero = woning && typeof woning.hero === 'string' && woning.hero.trim() ? woning.hero.trim() : '';

  const rest = fotos.slice();
  const cover = hero || (rest.length ? rest.shift().src : '');
  const zijfoto = rest.length ? rest.shift() : null;
  // de achterkant krijgt de laatste foto, maar alleen als er daarna nog beeld overblijft
  const slotfoto = rest.length > 1 ? rest.pop() : null;

  const paginas = [];
  let i = 0;
  while (i < rest.length) {
    if (rest[i].groot) {
      paginas.push({ vorm: 'een', fotos: [rest[i]] });
      i += 1;
      continue;
    }
    let n = 0;
    while (i + n < rest.length && !rest[i + n].groot) n += 1;
    for (const stuk of verdeel(n)) {
      paginas.push({ vorm: VORM[stuk], fotos: rest.slice(i, i + stuk) });
      i += stuk;
    }
  }

  return { cover, zijfoto, slotfoto, fotopaginas: paginas, aantal: fotos.length };
}

/** De feiten die op de verhaalpagina onder elkaar komen — lege waarden vallen weg. */
export function magazineFeiten(woning) {
  const w = woning || {};
  const rijen = [
    { n: w.slaapkamers, l: 'Slaapkamers' },
    { n: w.badkamers, l: 'Badkamers' },
    { n: w.woonoppervlak, l: 'Woonoppervlak', achter: ' m²' },
    { n: w.perceel, l: 'Perceel', achter: ' m²' },
    { n: w.bouwjaar, l: 'Bouwjaar' },
  ];
  return rijen
    .filter((r) => r.n !== null && r.n !== undefined && r.n !== '' && Number(r.n) > 0)
    .map((r) => ({ waarde: String(r.n) + (r.achter || ''), label: r.l }));
}
