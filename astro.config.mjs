import { defineConfig } from 'astro/config';
import sanity from '@sanity/astro';
import react from '@astrojs/react';

// Sanity-project (content-database + beheerportaal /studio)
const SANITY_PROJECT_ID = 're4e1149';
const SANITY_DATASET = 'production';

export default defineConfig({
  // CSS in de pagina's inbakken (snelle laad, ook bij drag & drop deploys).
  build: {
    inlineStylesheets: 'always',
  },
  integrations: [
    sanity({
      projectId: SANITY_PROJECT_ID,
      dataset: SANITY_DATASET,
      // Statisch bouwen: verse data ophalen (geen CDN-cache tijdens build).
      useCdn: false,
      // Caro's beheerportaal komt op cre01.netlify.app/studio
      studioBasePath: '/studio',
    }),
    react(),
  ],
});
