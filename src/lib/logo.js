/**
 * Het logo in het menu: welk beeld, welke vorm, hoe groot, en wat er naast staat.
 *
 * Caro stelt dit in onder Vormgeving. Alles wordt genormaliseerd: een onbekende
 * of half ingevulde keuze valt terug op de standaard, en een 'eigen' logo zonder
 * bruikbare URL valt terug op het standaardlogo. Zo kan het menu nooit stuk.
 */
import data from '../../public/logo.json' with { type: 'json' };

export const VORMEN = data.vormen;
export const FORMATEN = data.formaten;
export const NAMEN = data.namen;
export const DONKER = data.donker;
export const STANDAARD_LOGO = data.standaard;
export const STANDAARD_LOGO_URL = data.standaardLogo;

/** Alleen een eigen bestand of een pad in de repo — geen javascript:/data: gedoe. */
function bruikbareUrl(ruw) {
  if (typeof ruw !== 'string') return '';
  const url = ruw.trim();
  if (!url) return '';
  if (url.startsWith('/')) return url;
  if (/^https:\/\//i.test(url)) return url;
  return '';
}

export function normaliseerLogo(ruw, terugval = STANDAARD_LOGO) {
  const t = { ...STANDAARD_LOGO, ...(terugval && typeof terugval === 'object' ? terugval : {}) };
  const b = ruw && typeof ruw === 'object' && !Array.isArray(ruw) ? ruw : {};
  const url = bruikbareUrl(b.url);
  return {
    // 'eigen' zonder bruikbare URL is geen eigen logo — dan gewoon de standaard
    bron: b.bron === 'eigen' && url ? 'eigen' : 'standaard',
    url,
    vorm: VORMEN.some((v) => v.id === b.vorm) ? b.vorm : t.vorm,
    formaat: FORMATEN.some((f) => f.id === b.formaat) ? b.formaat : t.formaat,
    naam: NAMEN.some((n) => n.id === b.naam) ? b.naam : t.naam,
    op_donker: DONKER.some((d) => d.id === b.op_donker) ? b.op_donker : t.op_donker,
  };
}

/** Alles wat het merkblok nodig heeft om zichzelf te tekenen. */
export function logoAttributen(logo) {
  const l = normaliseerLogo(logo);
  const f = FORMATEN.find((x) => x.id === l.formaat) || FORMATEN[1];
  const klassen = ['brand', 'v-' + l.vorm, 'n-' + l.naam];
  if (l.op_donker === 'wit') klassen.push('logo-wit-op-donker');
  return {
    url: l.bron === 'eigen' ? l.url : STANDAARD_LOGO_URL,
    klasse: klassen.join(' '),
    stijl: '--brandh:' + f.hoogte,
    toonNaam: l.naam !== 'alleen-logo',
    toonOndertitel: l.naam === 'naam-ondertitel',
  };
}
