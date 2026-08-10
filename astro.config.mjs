import { defineConfig } from 'astro/config';

// CSS in de pagina's inbakken (snelle laad, ook bij drag & drop deploys).
export default defineConfig({
  build: {
    inlineStylesheets: 'always',
  },
});
