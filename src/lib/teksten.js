/**
 * De vaste teksten van de site, in drie talen.
 *
 * De oorspronkelijke tekst staat in public/teksten.json. Wat Caro in het
 * dashboard aanpast staat in de database (instellingen.teksten) en wint;
 * alles wat ze niet aanraakt valt terug op de standaard. Daardoor kan een
 * lege of half gevulde database de site nooit met gaten achterlaten.
 *
 * Engels is de standaardtaal en staat op `/`; Nederlands op `/nl/`, Spaans op
 * `/es/`. Ontbreekt een tekst in de gekozen taal, dan valt hij terug op Engels
 * en daarna op Nederlands — er staat dus nooit een leeg gat op de site, ook
 * niet als er ooit een veld bijkomt dat nog niet vertaald is.
 */
import data from '../../public/teksten.json' with { type: 'json' };

export const GROEPEN = data.groepen;
export const TALEN = data.talen;

/** De taal waarin de site standaard opent. */
export const STANDAARD_TAAL = (TALEN.find((t) => t.standaard) || TALEN[0]).id;

/** Alleen deze drie bestaan; al het andere valt terug op de standaard. */
export const TAAL_IDS = TALEN.map((t) => t.id);

/** Wat er in het adres komt: '' voor de standaardtaal, anders 'nl' of 'es'. */
export function taalPad(taal) {
  const t = TALEN.find((x) => x.id === taal);
  return t && t.pad ? t.pad : '';
}

/** Bouwt een adres binnen de site: link('nl', '/woning/x/') -> '/nl/woning/x/' */
export function link(taal, pad = '/') {
  const p = taalPad(taal);
  const schoon = String(pad || '/').replace(/^\/+/, '');
  return '/' + (p ? p + '/' : '') + schoon;
}

/** 'nl' als het echt bestaat, anders de standaardtaal. */
export function schoneTaal(ruw) {
  return TAAL_IDS.indexOf(ruw) !== -1 ? ruw : STANDAARD_TAAL;
}

/** Alle velden als platte lijst. */
export const VELDEN = GROEPEN.flatMap((g) =>
  g.velden.map((v) => ({ ...v, groep: g.id, groepnaam: g.naam }))
);

/**
 * De standaardtekst van een veld in een taal, met de terugvalketen
 * gekozen taal -> Engels -> Nederlands -> de eerste taal die iets heeft.
 */
function standaardVan(veld, taal) {
  const s = veld && veld.standaard;
  if (typeof s === 'string') return s;              // oud formaat, één taal
  if (!s || typeof s !== 'object') return '';
  for (const t of [taal, 'en', 'nl', ...TAAL_IDS]) {
    if (typeof s[t] === 'string' && s[t].trim()) return s[t];
  }
  return '';
}

/** { id: standaardtekst } voor één taal. */
export function standaardTeksten(taal) {
  const t = schoneTaal(taal);
  return Object.fromEntries(VELDEN.map((v) => [v.id, standaardVan(v, t)]));
}

/** De standaardteksten in de standaardtaal — voor code die geen taal meegeeft. */
export const STANDAARD_TEKSTEN = standaardTeksten(STANDAARD_TAAL);

/**
 * Hoeveel tekens een veld hoogstens mag zijn. Een gewone regel op de site is
 * kort; een juridische pagina (`type: "pagina"`) is dat per definitie niet.
 * Zonder dit onderscheid werd zo'n tekst stilzwijgend op 1200 tekens afgekapt
 * en verdween de staart van het privacybeleid zonder dat iemand het zag.
 */
const GRENS = { pagina: 24000 };
export const grensVan = (veld) => GRENS[veld && veld.type] || 1200;

/**
 * Maakt een bruikbare set teksten voor één taal, wat er ook in de database
 * staat: onbekende sleutels eruit, niet-teksten eruit, lege waarden terug naar
 * de standaard, en veel te lange waarden afgekapt.
 *
 * Wat er in `instellingen.teksten` staat kan twee vormen hebben:
 *   nieuw : { nl: {...}, en: {...}, es: {...} }
 *   oud   : { veld: waarde }            — één set, en die was Nederlands
 * De oude vorm telt daarom alleen mee als er om Nederlands gevraagd wordt.
 * Zonder die regel zou Caro's Nederlandse tekst plotseling op de Engelse site
 * verschijnen zodra dit live gaat.
 */
export function normaliseerTeksten(ruw, taal) {
  const t = schoneTaal(taal);
  const uit = standaardTeksten(t);
  const bron = ruw && typeof ruw === 'object' && !Array.isArray(ruw) ? ruw : {};
  const perTaal = TAAL_IDS.some((x) => bron[x] && typeof bron[x] === 'object');
  const laag = perTaal ? (bron[t] || {}) : (t === 'nl' ? bron : {});

  for (const veld of VELDEN) {
    let waarde = laag[veld.id];
    // Een eentalig veld (nummer, adres, merknaam) is in elke taal hetzelfde.
    // Pas Caro het in één taal aan, dan geldt dat overal.
    if (veld.eentalig && typeof waarde !== 'string') {
      for (const x of [STANDAARD_TAAL, ...TAAL_IDS]) {
        const l = perTaal ? bron[x] : (x === 'nl' ? bron : null);
        if (l && typeof l[veld.id] === 'string' && l[veld.id].trim()) { waarde = l[veld.id]; break; }
      }
    }
    if (typeof waarde !== 'string') continue;
    const schoon = waarde.trim().slice(0, grensVan(veld));
    if (schoon) uit[veld.id] = schoon;
  }
  return uit;
}

/** Alleen bewaren wat afwijkt — per taal. Gebruikt door het dashboard. */
export function afwijkendeTeksten(alle) {
  const uit = {};
  for (const taal of TAAL_IDS) {
    const std = standaardTeksten(taal);
    const laag = (alle && alle[taal]) || {};
    const deel = {};
    for (const veld of VELDEN) {
      const w = laag[veld.id];
      if (typeof w === 'string' && w.trim() && w !== std[veld.id]) deel[veld.id] = w;
    }
    if (Object.keys(deel).length) uit[taal] = deel;
  }
  return uit;
}

/**
 * De vier juridische pagina's onderaan de site. Eén lijst, zodat de footer,
 * het magazine en de pagina's zelf niet uit elkaar kunnen lopen.
 */
export const JURIDISCH = [
  { slug: 'aviso-legal', titel: 'Aviso Legal', tekst: 'juridisch_aviso' },
  { slug: 'privacidad', titel: 'Privacidad', tekst: 'juridisch_privacidad' },
  { slug: 'cookies', titel: 'Cookies', tekst: 'juridisch_cookies' },
  { slug: 'disclaimer', titel: 'Disclaimer', tekst: 'juridisch_disclaimer' },
];

/** De regel onderaan elke pagina: "© 2026 Carine Leriche". */
export function copyrightRegel(teksten, jaar) {
  return '© ' + jaar + ' ' + tekst(teksten, 'juridisch_naam');
}

/** Eén tekst opvragen, met de standaard als vangnet. */
export function tekst(teksten, id) {
  const t = teksten && teksten[id];
  return typeof t === 'string' && t.trim() ? t : STANDAARD_TEKSTEN[id] || '';
}

/** De WhatsApp-link uit het opgegeven nummer (alleen cijfers). */
export function whatsappLink(teksten) {
  const nummer = String(tekst(teksten, 'whatsapp')).replace(/[^0-9]/g, '');
  return 'https://wa.me/' + nummer;
}

/** De bel-link uit het opgegeven nummer. */
export function telLink(teksten) {
  const nummer = String(tekst(teksten, 'tel_nummer')).replace(/[^0-9+]/g, '');
  return 'tel:' + nummer;
}

/** De e-maillink. */
export function mailLink(teksten, onderwerp) {
  const adres = tekst(teksten, 'email');
  return 'mailto:' + adres + (onderwerp ? '?subject=' + encodeURIComponent(onderwerp) : '');
}
