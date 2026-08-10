import { defineType, defineField } from 'sanity'

// Eén "woning" = één document dat Caro invult in Sanity Studio.
// De vormgeving van de site blijft altijd gelijk; Caro vult alleen deze velden.
export const woning = defineType({
  name: 'woning',
  title: 'Woning',
  type: 'document',
  groups: [
    { name: 'hoofd', title: 'Hoofdgegevens', default: true },
    { name: 'beeld', title: 'Foto & video' },
    { name: 'kenmerken', title: 'Kenmerken & locatie' },
    { name: 'instellingen', title: 'Weergave' },
  ],
  fields: [
    defineField({
      name: 'titel',
      title: 'Titel',
      type: 'string',
      group: 'hoofd',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL-naam',
      type: 'slug',
      group: 'hoofd',
      options: { source: 'titel', maxLength: 96 },
      validation: (r) => r.required(),
      description: 'Wordt automatisch gemaakt van de titel; bepaalt het webadres van de woning.',
    }),
    defineField({
      name: 'plaats',
      title: 'Plaats',
      type: 'string',
      group: 'hoofd',
      description: 'Bijv. Moraira, Alicante',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'regio',
      title: 'Regio',
      type: 'string',
      group: 'hoofd',
      initialValue: 'Costa Blanca',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'hoofd',
      options: {
        list: ['Te koop', 'Onder optie', 'Verkocht'],
        layout: 'radio',
      },
      initialValue: 'Te koop',
    }),
    defineField({
      name: 'prijs',
      title: 'Prijs in euro',
      type: 'number',
      group: 'hoofd',
      validation: (r) => r.required().min(0),
    }),
    defineField({ name: 'slaapkamers', title: 'Slaapkamers', type: 'number', group: 'hoofd', validation: (r) => r.min(0) }),
    defineField({ name: 'badkamers', title: 'Badkamers', type: 'number', group: 'hoofd', validation: (r) => r.min(0) }),
    defineField({ name: 'woonoppervlak', title: 'Woonoppervlak (m²)', type: 'number', group: 'hoofd', validation: (r) => r.min(0) }),
    defineField({ name: 'perceel', title: 'Perceel (m²)', type: 'number', group: 'hoofd', validation: (r) => r.min(0) }),
    defineField({ name: 'bouwjaar', title: 'Bouwjaar', type: 'number', group: 'hoofd' }),

    defineField({
      name: 'hero',
      title: 'Hero-foto (groot bovenaan)',
      type: 'image',
      group: 'beeld',
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'video',
      title: 'Video (optioneel)',
      type: 'url',
      group: 'beeld',
      description: 'Link naar een mp4-bestand; leeg laten als er geen video is.',
    }),
    defineField({
      name: 'galerij',
      title: 'Fotogalerij',
      type: 'array',
      group: 'beeld',
      of: [
        {
          type: 'object',
          name: 'foto',
          fields: [
            { name: 'src', title: 'Foto', type: 'image', options: { hotspot: true }, validation: (r: any) => r.required() },
            { name: 'label', title: 'Bijschrift', type: 'string' },
          ],
          preview: {
            select: { title: 'label', media: 'src' },
            prepare: ({ title, media }: any) => ({ title: title || 'Foto', media }),
          },
        },
      ],
    }),

    defineField({
      name: 'kenmerkenBinnen',
      title: 'Kenmerken binnen',
      type: 'array',
      group: 'kenmerken',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'kenmerkenBuiten',
      title: 'Kenmerken buiten',
      type: 'array',
      group: 'kenmerken',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'afstanden',
      title: 'Afstanden',
      type: 'array',
      group: 'kenmerken',
      of: [
        {
          type: 'object',
          name: 'afstand',
          fields: [
            { name: 'plek', title: 'Plek', type: 'string' },
            { name: 'tijd', title: 'Tijd', type: 'string', description: 'Bijv. 5 min' },
          ],
          preview: {
            select: { title: 'plek', subtitle: 'tijd' },
          },
        },
      ],
    }),

    defineField({
      name: 'omschrijving',
      title: 'Omschrijving',
      type: 'array',
      group: 'hoofd',
      of: [{ type: 'block' }],
      description: 'Het verhaal bij de woning (rich text).',
    }),

    defineField({
      name: 'volgorde',
      title: 'Volgorde op de homepage',
      type: 'number',
      group: 'instellingen',
      initialValue: 10,
      description: 'Lager = hoger in de lijst.',
    }),
    defineField({
      name: 'beschikbaar',
      title: 'Tonen op de site',
      type: 'boolean',
      group: 'instellingen',
      initialValue: true,
    }),
    defineField({
      name: 'uitgelicht',
      title: 'In de spotlight zetten',
      type: 'boolean',
      group: 'instellingen',
      initialValue: false,
      description: 'Maximaal één woning; dit pand komt groot bovenaan de homepage.',
    }),
  ],
  orderings: [
    { title: 'Volgorde (oplopend)', name: 'volgordeAsc', by: [{ field: 'volgorde', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'titel', subtitle: 'plaats', media: 'hero' },
  },
})
