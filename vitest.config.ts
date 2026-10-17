/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// getViteConfig lets Vitest compile .astro components for the Container API tests.
export default getViteConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    globalSetup: ['tests/global-setup.ts'],
  },
});
