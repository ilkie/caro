import { supabase } from './supabase'
import { STANDAARD_PALET, vindPalet } from './palet.js'
import sectieData from '../../public/secties.json' with { type: 'json' }

export type Sectie = { id: string; aan: boolean }
export type Instellingen = { palet: string; secties: Sectie[] }

// De secties van de homepage, in de volgorde zoals de site oorspronkelijk was.
// Staat een sectie hier niet bij, dan bestaat hij niet — onbekende id's uit de
// database worden genegeerd, ontbrekende worden achteraan toegevoegd.
export const SECTIES: { id: string; naam: string; uitleg?: string }[] = sectieData.secties

export const STANDAARD_INSTELLINGEN: Instellingen = {
  palet: STANDAARD_PALET,
  secties: SECTIES.map((s) => ({ id: s.id, aan: true })),
}

/** Maakt er hoe dan ook een bruikbare lijst van, wat er ook in de database staat. */
export function normaliseerSecties(ruw: unknown): Sectie[] {
  const bekend = new Set<string>(SECTIES.map((s) => s.id))
  const lijst = Array.isArray(ruw) ? ruw : []
  const schoon: Sectie[] = []
  for (const item of lijst) {
    const id = typeof item?.id === 'string' ? item.id : null
    if (!id || !bekend.has(id) || schoon.some((s) => s.id === id)) continue
    schoon.push({ id, aan: item.aan !== false })
  }
  // secties die (nog) niet in de database staan, komen achteraan en staan aan
  for (const s of SECTIES) {
    if (!schoon.some((x) => x.id === s.id)) schoon.push({ id: s.id, aan: true })
  }
  return schoon
}

let cache: Instellingen | null = null

/**
 * Haalt de vormgeving op. Faalt nooit de build: bij een fout, een lege tabel of
 * een onbereikbare database vallen we terug op de standaard (huisstijl, alles aan).
 */
export async function getInstellingen(): Promise<Instellingen> {
  if (cache) return cache
  try {
    const { data, error } = await supabase
      .from('instellingen')
      .select('palet, secties')
      .eq('id', 'site')
      .maybeSingle()
    if (error) {
      console.warn('[supabase] instellingen:', error.message, '→ standaard gebruikt')
      cache = STANDAARD_INSTELLINGEN
      return cache
    }
    cache = {
      palet: vindPalet(data?.palet).id,
      secties: normaliseerSecties(data?.secties),
    }
    return cache
  } catch (e: any) {
    console.warn('[supabase] instellingen ophalen faalde:', e?.message || e, '→ standaard gebruikt')
    cache = STANDAARD_INSTELLINGEN
    return cache
  }
}
