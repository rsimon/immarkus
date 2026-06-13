import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Playwright owns e2e/; vitest only runs unit tests under src/
    include: ['src/**/*.test.ts']
  }
});
