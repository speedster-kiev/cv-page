import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  { ignores: ['dist/', '.astro/', 'node_modules/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  { rules: { 'astro/no-set-html-directive': 'error' } },
  { languageOptions: { globals: { ...globals.node, ...globals.browser } } },
];
