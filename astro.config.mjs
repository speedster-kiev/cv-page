import { defineConfig } from 'astro/config';

// `site` and `base` are set when the Pages URL is decided (ADR 0004).
// CV_OUT_DIR lets the failing-build tests write somewhere other than dist/.
export default defineConfig({
  output: 'static',
  outDir: process.env.CV_OUT_DIR ?? 'dist',
});
