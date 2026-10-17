import { defineConfig } from 'astro/config';

// GitHub Pages serves this project at https://speedster-kiev.github.io/cv-page/ (ADR 0004);
// without `base`, asset URLs such as /_astro/photo.webp point at the user root and 404.
// CV_OUT_DIR lets the failing-build tests write somewhere other than dist/.
export default defineConfig({
  output: 'static',
  site: 'https://speedster-kiev.github.io',
  base: '/cv-page',
  outDir: process.env.CV_OUT_DIR ?? 'dist',
});
