import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './src/sanity/schemaTypes'

// Beheerportaal (Sanity Studio) voor Caro — bereikbaar op /studio.
export default defineConfig({
  name: 'caro-leriche',
  title: 'Caro Leriche — Beheer',
  projectId: 're4e1149',
  dataset: 'production',
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
})
