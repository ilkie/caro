/**
 * Locatie op de kaart — zonder het adres te verraden.
 *
 * Caro typt het volledige adres in het dashboard. Dat adres en de exacte
 * coördinaten blijven in de database; wat op de site terechtkomt is bewust
 * onnauwkeurig: afgerond op twee decimalen, oftewel een vak van ruwweg een
 * kilometer. Een koper ziet daardoor wél waar de woning ligt ten opzichte van
 * dorp, strand en snelweg, maar kan het huis niet aanwijzen.
 *
 * Zelfde bestand wordt gebruikt door de site (bij het bouwen) en door het
 * dashboard (voorbeeldkaartje), zodat Caro exact ziet wat bezoekers zien.
 */

/** Afronden op ~1 km. Geeft null als er geen bruikbare coördinaten zijn. */
export function vervaagd(lat, lon) {
  const a = Number(lat);
  const b = Number(lon);
  if (!isFinite(a) || !isFinite(b) || (a === 0 && b === 0)) return null;
  if (a < -90 || a > 90 || b < -180 || b > 180) return null;
  return { lat: Math.round(a * 100) / 100, lon: Math.round(b * 100) / 100 };
}

/**
 * De kaart-URL voor in een <iframe>.
 * Met een Google-sleutel de Maps Embed API (modus `view`: geen speld, dus geen
 * punt om op te klikken). Zonder sleutel valt hij terug op OpenStreetMap, zodat
 * de kaart het ook doet voordat die sleutel geregeld is.
 */
export function kaartUrl(lat, lon, sleutel, zoom = 13) {
  const plek = vervaagd(lat, lon);
  if (!plek) return null;

  if (sleutel) {
    return (
      'https://www.google.com/maps/embed/v1/view?key=' + encodeURIComponent(sleutel) +
      '&center=' + plek.lat + ',' + plek.lon +
      '&zoom=' + zoom + '&maptype=roadmap'
    );
  }

  // OpenStreetMap wil een kader in plaats van een zoomniveau: ~4 km breed.
  const d = 0.02;
  const afgerond = (n) => Number(n.toFixed(4));
  const bbox = [afgerond(plek.lon - d), afgerond(plek.lat - d / 2),
                afgerond(plek.lon + d), afgerond(plek.lat + d / 2)].join(',');
  return 'https://www.openstreetmap.org/export/embed.html?bbox=' + bbox + '&layer=mapnik';
}

/** Naam van de kaartdienst, voor het bronvermeldinkje onder de kaart. */
export function kaartBron(sleutel) {
  return sleutel ? 'Google Maps' : 'OpenStreetMap';
}
