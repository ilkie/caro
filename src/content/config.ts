import { defineCollection, z } from 'astro:content';

// Eén "woning" = één content-bestand. Caro vult via /admin alleen deze velden in;
// de vormgeving (deze site) blijft altijd hetzelfde.
const woningen = defineCollection({
  type: 'content',
  schema: z.object({
    titel: z.string(),
    plaats: z.string(),
    regio: z.string().default('Costa Blanca'),
    status: z.string().default('Te koop'),
    prijs: z.number(),
    slaapkamers: z.number(),
    badkamers: z.number(),
    woonoppervlak: z.number(),
    perceel: z.number(),
    bouwjaar: z.number(),
    hero: z.string(),
    video: z.string().optional(),
    kenmerkenBinnen: z.array(z.string()).default([]),
    kenmerkenBuiten: z.array(z.string()).default([]),
    galerij: z.array(z.object({ src: z.string(), label: z.string().optional() })).default([]),
    afstanden: z.array(z.object({ plek: z.string(), tijd: z.string() })).default([]),
    volgorde: z.number().default(0),
    beschikbaar: z.boolean().default(true),
    uitgelicht: z.boolean().default(false),
  }),
});

export const collections = { woningen };
