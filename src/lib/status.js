/**
 * De status van een woning — het labeltje linksboven op de foto.
 *
 * Vóór v1.36 was dit vrije tekst ("Te koop", "Onder optie", "Verkocht"), die
 * rechtstreeks op de kaart werd gezet. Nu is het een vaste lijst uit
 * public/statussen.json, met een kleur per status. Wat er al in de database
 * staat blijft gewoon werken: `statusVan()` herkent de oude schrijfwijzen en
 * ook een naam die iemand met de hand heeft ingetypt.
 *
 * Onbekende tekst gooien we niet weg — die tonen we zoals hij is, in de kleur
 * van de standaard. Een woning waarvan de status niet in het lijstje staat,
 * hoort niet zonder label op de site te komen.
 */
import data from '../../public/statussen.json' with { type: 'json' };

export const STATUSSEN = data.statussen;
export const STANDAARD_STATUS = data.standaard;

/** "Verkocht onder voorbehoud" → "verkocht-onder-voorbehoud" */
function sleutel(ruw) {
  return String(ruw == null ? '' : ruw)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const OP_SLEUTEL = new Map();
for (const s of STATUSSEN) {
  OP_SLEUTEL.set(sleutel(s.id), s);
  OP_SLEUTEL.set(sleutel(s.naam), s);
  OP_SLEUTEL.set(sleutel(s.kort), s);
  for (const oud of s.oud || []) OP_SLEUTEL.set(sleutel(oud), s);
}

/** De status uit het lijstje die bij deze tekst hoort, of null. */
export function zoekStatus(ruw) {
  return OP_SLEUTEL.get(sleutel(ruw)) || null;
}

/**
 * Wat er op het labeltje komt te staan.
 * Geeft `{ id, naam, kort, klasse, bekend }` — of `null` als er niets is
 * ingevuld, want dan hoort er ook geen labeltje te staan.
 */
export function statusVan(ruw) {
  const tekst = typeof ruw === 'string' ? ruw.trim() : '';
  if (!tekst) return null;
  const gevonden = zoekStatus(tekst);
  if (gevonden) {
    return {
      id: gevonden.id,
      naam: gevonden.naam,
      kort: gevonden.kort || gevonden.naam,
      klasse: 'st-' + gevonden.kleur,
      bekend: true,
    };
  }
  // Iets wat we niet kennen: laten staan, in de kleur van de standaard.
  const terugval = zoekStatus(STANDAARD_STATUS);
  return {
    id: '',
    naam: tekst,
    kort: tekst,
    klasse: 'st-' + (terugval ? terugval.kleur : 'verkoop'),
    bekend: false,
  };
}

/** Is deze woning niet meer echt te koop? Handig voor een rustiger weergave. */
export function isAfgerond(ruw) {
  const s = zoekStatus(ruw);
  return !!s && (s.id === 'verkocht' || s.id === 'onder-voorbehoud');
}
