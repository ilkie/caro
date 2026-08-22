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
 *
 * Caro kan per woning van dit standaardmagazine afwijken (kolom `magazine` bij
 * de woning, in te vullen via het dashboard). Net als bij de teksten van de site
 * geldt: wat leeg blijft, volgt de standaard. Zo is één knop genoeg om alles
 * weer terug te zetten.
 */

export const MAX_FOTOS = 26;

/** Wat er per woning aan het magazine veranderd kan worden. Leeg = de standaard. */
export const MAGAZINE_STANDAARD = {
  cover_foto: '',       // leeg = de hoofdfoto van de woning
  cover_titel: '',      // leeg = de titel van de woning
  cover_regel: '',      // leeg = plaats, regio
  toon_prijs: true,     // uit = geen prijs op de voorkant
  verhaal_kop: '',      // leeg = het kopje uit de teksten van de site
  verhaal_titel: '',    // leeg = de titel van de woning
  verhaal_tekst: '',    // leeg = de omschrijving van de woning
  zijfoto: '',          // leeg = automatisch gekozen
  slotfoto: '',         // leeg = automatisch gekozen
  slot_zin: '',         // leeg = de slotzin uit de teksten van de site
  toon_kenmerken: true, // uit = geen kenmerkenpagina in het boekje
  overslaan: [],        // foto's die niet in het magazine horen
};

/** Alleen een eigen bestand of een pad in de repo — geen javascript:/data: gedoe. */
function bruikbareUrl(ruw) {
  if (typeof ruw !== 'string') return '';
  const url = ruw.trim();
  if (!url) return '';
  if (url.startsWith('/')) return url;
  if (/^https:\/\//i.test(url)) return url;
  return '';
}

function schoneTekst(ruw) {
  return typeof ruw === 'string' ? ruw.trim() : '';
}

/** Maakt van wat er in de database staat altijd een bruikbaar geheel. */
export function normaliseerMagazine(ruw) {
  const b = ruw && typeof ruw === 'object' && !Array.isArray(ruw) ? ruw : {};
  const over = [];
  for (const s of Array.isArray(b.overslaan) ? b.overslaan : []) {
    const url = bruikbareUrl(s);
    if (url && over.indexOf(url) === -1) over.push(url);
  }
  return {
    cover_foto: bruikbareUrl(b.cover_foto),
    cover_titel: schoneTekst(b.cover_titel),
    cover_regel: schoneTekst(b.cover_regel),
    toon_prijs: b.toon_prijs !== false,
    verhaal_kop: schoneTekst(b.verhaal_kop),
    verhaal_titel: schoneTekst(b.verhaal_titel),
    verhaal_tekst: typeof b.verhaal_tekst === 'string' ? b.verhaal_tekst.trim() : '',
    zijfoto: bruikbareUrl(b.zijfoto),
    slotfoto: bruikbareUrl(b.slotfoto),
    slot_zin: schoneTekst(b.slot_zin),
    toon_kenmerken: b.toon_kenmerken !== false,
    overslaan: over,
  };
}

/** Wijkt deze woning ergens van het standaardmagazine af? */
export function magazineIsEigen(ruw) {
  return JSON.stringify(normaliseerMagazine(ruw)) !== JSON.stringify(MAGAZINE_STANDAARD);
}

/** Verdeelt n foto's in blokken van hooguit vier, met drie als ritme. */
export function verdeel(n) {
  if (n <= 0) return [];
  if (n <= 4) return [n];
  return [3, ...verdeel(n - 3)];
}

const VORM = { 1: 'een', 2: 'twee', 3: 'drie', 4: 'vier' };

/** Alle beelden van een woning, in de volgorde die Caro koos. */
function schoneFotos(woning, overslaan) {
  const uit = [];
  const weg = overslaan || [];
  for (const g of (woning && woning.galerij) || []) {
    if (!g || typeof g.src !== 'string' || !g.src.trim()) continue;
    if (weg.indexOf(g.src.trim()) !== -1) continue;
    uit.push({ src: g.src, label: typeof g.label === 'string' ? g.label : '', groot: !!g.groot });
  }
  return uit.slice(0, MAX_FOTOS);
}

/**
 * Haalt een met de hand gekozen foto uit de stapel, zodat hij niet twee keer in
 * het boekje komt. Staat hij niet in de galerij (een foto die Caro alleen voor
 * het magazine heeft geüpload), dan wordt hij gewoon zo gebruikt.
 */
function pakGekozen(rest, keuze) {
  if (!keuze) return null;
  const i = rest.findIndex((f) => f.src === keuze);
  if (i !== -1) return rest.splice(i, 1)[0];
  return { src: keuze, label: '', groot: false };
}

/**
 * De hele indeling van het magazine.
 * Werkt ook bij nul foto's: dan blijven de fotopagina's simpelweg leeg.
 */
export function magazineIndeling(woning) {
  const eigen = normaliseerMagazine(woning && woning.magazine);
  const fotos = schoneFotos(woning, eigen.overslaan);
  const heroRuw = woning && typeof woning.hero === 'string' ? woning.hero.trim() : '';
  const hero = heroRuw && eigen.overslaan.indexOf(heroRuw) === -1 ? heroRuw : '';

  const rest = fotos.slice();

  let cover;
  if (eigen.cover_foto) {
    const gekozen = pakGekozen(rest, eigen.cover_foto);
    cover = gekozen ? gekozen.src : '';
  } else {
    cover = hero || (rest.length ? rest.shift().src : '');
  }

  const zijfoto = eigen.zijfoto
    ? pakGekozen(rest, eigen.zijfoto)
    : (rest.length ? rest.shift() : null);

  // de achterkant krijgt de laatste foto, maar alleen als er daarna nog beeld overblijft
  const slotfoto = eigen.slotfoto
    ? pakGekozen(rest, eigen.slotfoto)
    : (rest.length > 1 ? rest.pop() : null);

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

  return { cover, zijfoto, slotfoto, fotopaginas: paginas, aantal: fotos.length, eigen };
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
