/**
 * De vaste teksten van de site.
 *
 * De oorspronkelijke tekst staat in public/teksten.json. Wat Caro in het
 * dashboard aanpast staat in de database (instellingen.teksten) en wint;
 * alles wat ze niet aanraakt valt terug op de standaard. Daardoor kan een
 * lege of half gevulde database de site nooit met gaten achterlaten.
 */
import data from '../../public/teksten.json' with { type: 'json' };

export const GROEPEN = data.groepen;

/** Alle velden als platte lijst. */
export const VELDEN = GROEPEN.flatMap((g) =>
  g.velden.map((v) => ({ ...v, groep: g.id, groepnaam: g.naam }))
);

/** { id: standaardtekst } */
export const STANDAARD_TEKSTEN = Object.fromEntries(VELDEN.map((v) => [v.id, v.standaard]));

/**
 * Maakt een bruikbare set teksten, wat er ook in de database staat:
 * onbekende sleutels eruit, niet-teksten eruit, lege waarden terug naar de
 * standaard, en veel te lange waarden afgekapt.
 */
export function normaliseerTeksten(ruw) {
  const uit = { ...STANDAARD_TEKSTEN };
  const bron = ruw && typeof ruw === 'object' && !Array.isArray(ruw) ? ruw : {};
  for (const veld of VELDEN) {
    const waarde = bron[veld.id];
    if (typeof waarde !== 'string') continue;
    const schoon = waarde.trim().slice(0, 1200);
    if (schoon) uit[veld.id] = schoon;
  }
  return uit;
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
