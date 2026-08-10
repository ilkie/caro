import { defineConfig } from 'astro/config';

// CSS in de pagina's inbakken, zodat de site ook bij een
// sleep-en-klaar (drag & drop) deploy meteen goed opmaakt.
export default defineConfig({
  build: {
    inlineStylesheets: 'always',
  },
});
