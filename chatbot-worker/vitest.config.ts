import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'miniflare',
    // Environment options
    environmentOptions: {
      bindings: {
        GEMINI_API_KEY: 'test-api-key',
      },
    },
  },
});
