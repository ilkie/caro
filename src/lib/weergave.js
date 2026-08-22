/**
 * Kleine weergavekeuzes die niet bij het palet en niet bij de teksten horen.
 *
 * Nu zit er één ding in: of een woning die verkocht is (of verkocht onder
 * voorbehoud) rustiger op de site komt te staan — grijzere foto, prijs
 * doorgestreept. Dat is een keuze en geen regel: de ene makelaar wil de
 * verkochte woningen als bewijs laten zien, de andere wil dat de aandacht
 * naar wat nog te koop staat gaat.
 */
export const STANDAARD_WEERGAVE = {
  verkocht: 'rustig', // 'rustig' of 'gewoon'
};

export function normaliseerWeergave(ruw) {
  const b = ruw && typeof ruw === 'object' && !Array.isArray(ruw) ? ruw : {};
  return {
    verkocht: b.verkocht === 'gewoon' ? 'gewoon' : 'rustig',
  };
}

/**
 * De klasse die op een woningkaart komt. Leeg als er niets bijzonders is —
 * dan blijft de HTML schoon.
 */
export function rustigKlasse(weergave, afgerond) {
  return afgerond && normaliseerWeergave(weergave).verkocht === 'rustig' ? ' is-af' : '';
}
