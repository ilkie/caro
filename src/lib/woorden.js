/**
 * Woorden van de site zelf: knoplabels, kopjes boven een lijstje, de tekst in
 * de lezer van het magazine.
 *
 * Waarom niet in teksten.json? Omdat dit geen teksten van Caro zijn. "Bedrooms"
 * en "Volgende foto" horen bij de software, niet bij haar verhaal. Zou dit in
 * het tabblad Teksten staan, dan moest ze zestig extra velden langs voor iets
 * waar niets aan te kiezen valt — en dan raakt ze de teksten kwijt die er wél
 * toe doen.
 *
 * Ontbreekt een woord in een taal, dan valt het terug op Engels en daarna op
 * Nederlands, net als bij de teksten.
 */
const W = {
  // ---- woningpagina ----
  slaapkamers:     { nl: 'Slaapkamers', en: 'Bedrooms', es: 'Dormitorios' },
  badkamers:       { nl: 'Badkamers', en: 'Bathrooms', es: 'Baños' },
  woonoppervlak:   { nl: 'Woonoppervlak', en: 'Living area', es: 'Superficie' },
  perceel:         { nl: 'Perceel', en: 'Plot', es: 'Parcela' },
  bouwjaar:        { nl: 'Bouwjaar', en: 'Year built', es: 'Año de construcción' },
  slk:             { nl: 'slk', en: 'bed', es: 'dorm' },
  bad:             { nl: 'bad', en: 'bath', es: 'baño' },
  welkom:          { nl: 'Welkom thuis', en: 'Welcome home', es: 'Bienvenido a casa' },
  beeld:           { nl: 'Beeld', en: 'Gallery', es: 'Imágenes' },
  kenmerken:       { nl: 'Kenmerken', en: 'Features', es: 'Características' },
  kenmerken_sub:   { nl: 'Alles wat deze woning bijzonder maakt',
                     en: 'Everything that makes this property special',
                     es: 'Todo lo que hace especial a esta propiedad' },
  binnen:          { nl: 'Binnen', en: 'Inside', es: 'Interior' },
  buiten:          { nl: 'Buiten', en: 'Outside', es: 'Exterior' },
  locatie:         { nl: 'Locatie', en: 'Location', es: 'Ubicación' },
  locatie_aanvraag:{ nl: 'Locatie op aanvraag', en: 'Location on request', es: 'Ubicación bajo petición' },
  locatie_sub:     { nl: 'Rustig gelegen, met alles binnen handbereik.',
                     en: 'Quietly situated, with everything within easy reach.',
                     es: 'En un entorno tranquilo, con todo al alcance de la mano.' },
  geluid:          { nl: 'Geluid aan of uit', en: 'Sound on or off', es: 'Sonido activado o desactivado' },
  geluid_tik:      { nl: '🔈 tik voor geluid', en: '🔈 tap for sound', es: '🔈 toca para el sonido' },
  geluid_aan:      { nl: '🔊 geluid aan', en: '🔊 sound on', es: '🔊 sonido activado' },
  foto_groot:      { nl: 'Foto vergroot', en: 'Enlarged photo', es: 'Foto ampliada' },
  foto_vorige:     { nl: 'Vorige foto', en: 'Previous photo', es: 'Foto anterior' },
  foto_volgende:   { nl: 'Volgende foto', en: 'Next photo', es: 'Foto siguiente' },
  menu:            { nl: 'menu', en: 'menu', es: 'menú' },

  // ---- magazine: de balk en de lezer ----
  mg_van_de:       { nl: 'van de', en: 'of', es: 'de' },
  mg_terug:        { nl: '← terug naar de woning', en: '← back to the property', es: '← volver a la propiedad' },
  mg_volscherm:    { nl: 'Volledig scherm', en: 'Full screen', es: 'Pantalla completa' },
  mg_volscherm_uit:{ nl: 'Verlaat volledig scherm', en: 'Exit full screen', es: 'Salir de pantalla completa' },
  mg_pdf:          { nl: 'Bewaar als PDF', en: 'Save as PDF', es: 'Guardar como PDF' },
  mg_veeg:         { nl: 'Veeg om te bladeren →', en: 'Swipe to turn the page →', es: 'Desliza para pasar página →' },
  mg_vorige:       { nl: 'Vorige pagina', en: 'Previous page', es: 'Página anterior' },
  mg_volgende:     { nl: 'Volgende pagina', en: 'Next page', es: 'Página siguiente' },
  mg_ga_naar:      { nl: 'Ga naar pagina', en: 'Go to page', es: 'Ir a la página' },
  mg_taal:         { nl: 'Taal van het magazine', en: 'Magazine language', es: 'Idioma de la revista' },

  // ---- magazine: de bladzijden ----
  mg_in_het_kort:  { nl: 'In het kort', en: 'At a glance', es: 'De un vistazo' },
  mg_ligging:      { nl: 'Ligging', en: 'Location', es: 'Ubicación' },
  mg_adres:        { nl: 'Het exacte adres deel ik persoonlijk, bij een afspraak.',
                     en: 'I share the exact address in person, at an appointment.',
                     es: 'La dirección exacta la comparto en persona, en una cita.' },
  mg_telefoon:     { nl: 'Telefoon', en: 'Phone', es: 'Teléfono' },
  mg_email:        { nl: 'E-mail', en: 'Email', es: 'Correo' },
  mg_registratie:  { nl: 'Registratie', en: 'Registration', es: 'Registro' },
};

export function woord(taal, sleutel) {
  const r = W[sleutel];
  if (!r) return '';
  return r[taal] || r.en || r.nl || '';
}

/** Handig in een component: `const w = woorden(taal); w('kenmerken')` */
export function woorden(taal) {
  return (sleutel) => woord(taal, sleutel);
}

export const WOORDEN = W;
