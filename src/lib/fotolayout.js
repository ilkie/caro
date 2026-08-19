/**
 * De opmaak van de fotogalerij.
 *
 * Er is één standaard voor de hele site (dashboard → Vormgeving) en per woning
 * kan daarvan worden afgeweken. Een woning zonder eigen keuze volgt de
 * standaard; een onbekende of half ingevulde keuze valt terug op wat wél klopt,
 * zodat de galerij nooit stuk kan.
 */
import data from '../../public/fotolayout.json' with { type: 'json' };

export const STIJLEN = data.stijlen;
export const KOLOMMEN = data.kolommen;
export const MARGES = data.marges;
export const STANDAARD_FOTOLAYOUT = data.standaard;

export function normaliseerFotolayout(ruw, terugval = STANDAARD_FOTOLAYOUT) {
  const bron = ruw && typeof ruw === 'object' && !Array.isArray(ruw) ? ruw : {};
  const stijl = STIJLEN.some((s) => s.id === bron.stijl) ? bron.stijl : terugval.stijl;
  const kolommen = KOLOMMEN.some((k) => k.id === Number(bron.kolommen)) ? Number(bron.kolommen) : terugval.kolommen;
  const marge = MARGES.some((m) => m.id === bron.marge) ? bron.marge : terugval.marge;
  return { stijl, kolommen, marge };
}

/** Heeft deze woning een eigen opmaak, of volgt hij de standaard? */
export function fotolayoutVan(woning, standaard) {
  const basis = normaliseerFotolayout(standaard);
  if (!woning || !woning.fotolayout) return basis;
  return normaliseerFotolayout(woning.fotolayout, basis);
}

/** De klassen en variabelen voor de galerij. */
export function galerijAttributen(layout) {
  const m = MARGES.find((x) => x.id === layout.marge) || MARGES[1];
  return {
    klasse: 'wp-gal g-' + layout.stijl,
    stijl: '--gal-gap:' + m.waarde + ';--gal-kolommen:' + layout.kolommen,
  };
}
