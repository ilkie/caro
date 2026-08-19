import { createClient } from '@supabase/supabase-js'

// Publieke sleutels (anon) — veilig openbaar, beschermd door RLS.
export const SUPABASE_URL = 'https://kgudzqwwoulynhmfqusf.supabase.co'
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtndWR6cXd3b3VseW5obWZxdXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNzMyODEsImV4cCI6MjEwMTk0OTI4MX0.B0DtPJLTpJhXSgz4aB8hZCdmzMN2fqyrGqRMakPrgBo'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export type Woning = {
  id: string
  titel: string
  slug: string
  plaats?: string
  regio?: string
  status?: string
  prijs?: number
  slaapkamers?: number
  badkamers?: number
  woonoppervlak?: number
  perceel?: number
  bouwjaar?: number
  hero?: string
  video?: string
  omschrijving?: string
  kenmerken_binnen?: string[]
  kenmerken_buiten?: string[]
  galerij?: { src: string; label?: string }[]
  afstanden?: { plek: string; tijd: string }[]
  volgorde?: number
  beschikbaar?: boolean
  uitgelicht?: boolean
}

// Alle zichtbare woningen (op volgorde) voor de homepage.
// Faalt nooit de build: bij een fout (lege/onbereikbare db) → lege lijst.
export async function getWoningen(): Promise<Woning[]> {
  try {
    const { data, error } = await supabase
      .from('woningen')
      .select('*')
      .eq('beschikbaar', true)
      .order('volgorde', { ascending: true })
    if (error) { console.warn('[supabase] woningen:', error.message); return [] }
    return data || []
  } catch (e: any) {
    console.warn('[supabase] woningen ophalen faalde:', e?.message || e)
    return []
  }
}

// Alle woningen (voor het genereren van de pagina's).
export async function getAlleWoningen(): Promise<Woning[]> {
  try {
    const { data, error } = await supabase
      .from('woningen')
      .select('*')
      .order('volgorde', { ascending: true })
    if (error) { console.warn('[supabase] alle woningen:', error.message); return [] }
    return data || []
  } catch (e: any) {
    console.warn('[supabase] woningen ophalen faalde:', e?.message || e)
    return []
  }
}
