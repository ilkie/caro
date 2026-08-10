import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { toHTML } from '@portabletext/to-html'

const projectId = 're4e1149'
const dataset = 'production'

const builder = imageUrlBuilder({ projectId, dataset })

// Bouw een geoptimaliseerde CDN-URL voor een Sanity-afbeelding.
export function urlFor(source: SanityImageSource) {
  return builder.image(source).auto('format').fit('max')
}

// Zet de rich-text omschrijving (Portable Text) om naar HTML.
export function omschrijvingToHtml(blocks: any): string {
  if (!blocks) return ''
  return toHTML(blocks)
}

// --- GROQ-queries ---

// Alle zichtbare woningen voor de homepage (op volgorde).
export const WONINGEN_QUERY = `*[_type == "woning" && beschikbaar == true] | order(volgorde asc){
  _id,
  titel,
  plaats,
  regio,
  status,
  prijs,
  slaapkamers,
  badkamers,
  woonoppervlak,
  "slug": slug.current,
  uitgelicht,
  hero
}`

// Alle slugs (voor het genereren van de woningpagina's).
export const WONING_SLUGS_QUERY = `*[_type == "woning" && defined(slug.current)]{ "slug": slug.current }`

// Eén woning op basis van slug (met alle details).
export const WONING_QUERY = `*[_type == "woning" && slug.current == $slug][0]{
  _id,
  titel,
  plaats,
  regio,
  status,
  prijs,
  slaapkamers,
  badkamers,
  woonoppervlak,
  perceel,
  bouwjaar,
  "slug": slug.current,
  hero,
  video,
  kenmerkenBinnen,
  kenmerkenBuiten,
  galerij[]{ label, src },
  afstanden[]{ plek, tijd },
  omschrijving
}`
